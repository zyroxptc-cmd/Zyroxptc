import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWithdrawals = async () => {
    const q = query(collection(db, 'withdrawals'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const list = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        return { id: d.id, ...data, userEmail: userDoc.data()?.email };
    }));
    setWithdrawals(list);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Mark this withdrawal as ${status}?`)) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'withdrawals', id), { status });
      // If rejected, in a real app you'd refund the balance here.
      // For this demo, let's keep it simple.
      alert('Updated!');
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Wallet/Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="text-xs">{w.userEmail}</TableCell>
                  <TableCell className="font-mono font-bold">PKR {w.amount.toFixed(0)}</TableCell>
                  <TableCell>{w.method}</TableCell>
                  <TableCell className="font-mono text-[10px] break-all max-w-[150px]">{w.walletAddress}</TableCell>
                  <TableCell>
                    <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'outline'}>
                      {w.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {w.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatus(w.id, 'approved')} disabled={loading}>
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatus(w.id, 'rejected')} disabled={loading}>
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
