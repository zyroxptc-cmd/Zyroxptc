import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ExternalLink } from 'lucide-react';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDeposits = async () => {
    const q = query(collection(db, 'deposits'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const list = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        return { id: d.id, ...data, userEmail: userDoc.data()?.email };
    }));
    setDeposits(list);
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this deposit? Funds will be added to user balance.')) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();
      const response = await window.fetch(`/api/admin/deposits/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (response.ok) {
        alert('Approved!');
        fetchDeposits();
      } else {
        alert('Failed to approve');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Pending Deposits</h1>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>TX ID</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs">{d.userEmail}</TableCell>
                  <TableCell className="font-mono font-bold">PKR {d.amount.toFixed(0)}</TableCell>
                  <TableCell>{d.method}</TableCell>
                  <TableCell className="font-mono text-[10px] max-w-[100px] truncate">{d.transactionId}</TableCell>
                  <TableCell>
                    {d.screenshotUrl ? (
                      <a href={d.screenshotUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    ) : 'No Proof'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'approved' ? 'default' : 'outline'}>{d.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {d.status === 'pending' && (
                      <Button size="sm" onClick={() => handleApprove(d.id)} disabled={loading}>
                        Approve
                      </Button>
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
