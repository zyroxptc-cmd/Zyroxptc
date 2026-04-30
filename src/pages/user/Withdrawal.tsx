import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../App';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

export default function WithdrawalPage() {
  const { user, userData } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWithdrawals = async () => {
    if (!user) return;
    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > userData.balance) {
      alert('Insufficient balance');
      return;
    }
    if (withdrawAmount < 100) {
      alert('Minimum withdrawal is 100 PKR');
      return;
    }

    setLoading(true);
    try {
      // Create request
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: withdrawAmount,
        method,
        walletAddress,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      // Deduct from balance immediately to prevent double spending
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-withdrawAmount)
      });

      alert('Withdrawal request submitted!');
      setAmount('');
      setMethod('');
      setWalletAddress('');
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-700">Processed</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
        <p className="text-zinc-500">Withdraw your earnings to your wallet or bank.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-t-4 border-t-zinc-900">
          <CardHeader>
            <CardTitle>Withdraw Request</CardTitle>
            <div className="bg-zinc-100 p-3 rounded-lg mt-2">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Available</p>
                <p className="text-2xl font-mono font-bold">PKR {userData?.balance?.toFixed(2) || '0.00'}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <select 
                  id="method"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  required
                >
                  <option value="">Select Method</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (PKR)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="Min 100 PKR" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">JazzCash/EasyPaisa/Bank Details</Label>
                <Input 
                  id="address" 
                  placeholder="Enter details here" 
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Withdraw'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono font-bold">PKR {w.amount.toFixed(0)}</TableCell>
                    <TableCell>{w.method}</TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell className="text-right text-xs text-zinc-500">
                      {new Date(w.timestamp).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-zinc-500">No withdrawal history found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
