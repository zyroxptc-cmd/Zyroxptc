import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { useAuth } from '../../App';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { CreditCard, Landmark, CheckCircle2, Clock, XCircle, Smartphone } from 'lucide-react';

export default function DepositPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeposits = async () => {
    if (!user) return;
    const q = query(
      collection(db, 'deposits'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    setDeposits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchDeposits();
  }, [user]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const depositAmount = parseFloat(amount);
    if (depositAmount < 150) {
      alert('Minimum deposit is 150 PKR');
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl = '';
      if (screenshot) {
        const storageRef = ref(storage, `deposits/${user.uid}_${Date.now()}_${screenshot.name}`);
        const uploadResult = await uploadBytes(storageRef, screenshot);
        screenshotUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        amount: depositAmount,
        method,
        transactionId,
        screenshotUrl,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      toast.success('Deposit request submitted successfully! Admin will verify it soon.');
      setAmount('');
      setMethod('');
      setTransactionId('');
      setScreenshot(null);
      fetchDeposits();
    } catch (err) {
      console.error(err);
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline" className="text-zinc-500">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-zinc-500">Add funds to your account via manual verification.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Deposit Now</CardTitle>
            <CardDescription>Follow the instructions below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
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
                  placeholder="Min 150 PKR" 
                  min="150"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txid">TRX ID / Transaction ID</Label>
                <Input 
                  id="txid" 
                  placeholder="Enter Transaction ID" 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshot">Upload Screenshot</Label>
                <Input 
                  id="screenshot" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Deposit'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Deposit Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-600">
            <div className="p-4 bg-zinc-50 rounded-lg border flex gap-4">
              <Smartphone className="w-10 h-10 text-orange-500 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900">JazzCash / EasyPaisa</p>
                <p>Number: 0300 0000000</p>
                <p>Account Name: ClickCash Admin</p>
                <p className="text-xs text-orange-600 mt-1">Please upload screenshot after payment.</p>
              </div>
            </div>
            <div className="p-4 bg-zinc-50 rounded-lg border flex gap-4">
              <Landmark className="w-10 h-10 text-blue-500 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900">Bank Transfer</p>
                <p>Bank: Meezan Bank</p>
                <p>Account: 1234567890</p>
                <p>Account Name: ClickCash PKR</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Recent Deposits</CardTitle>
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
              {deposits.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-bold">PKR {d.amount.toFixed(0)}</TableCell>
                  <TableCell>{d.method}</TableCell>
                  <TableCell>{getStatusBadge(d.status)}</TableCell>
                  <TableCell className="text-right text-xs text-zinc-500">
                    {new Date(d.timestamp).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {deposits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-zinc-500">No deposit history found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
