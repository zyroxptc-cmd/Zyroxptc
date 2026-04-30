import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Trash2, Plus } from 'lucide-react';

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [reward, setReward] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAds = async () => {
    const snapshot = await getDocs(collection(db, 'ads'));
    setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'ads'), {
        title,
        url,
        reward: parseFloat(reward),
        duration: parseInt(duration),
        active: true,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setUrl('');
      setReward('');
      setDuration('');
      fetchAds();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this ad?')) {
      await deleteDoc(doc(db, 'ads', id));
      fetchAds();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'ads', id), { active: !current });
    fetchAds();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Manage Ads</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add New Ad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Reward (PKR)</Label>
              <Input type="number" step="0.01" value={reward} onChange={e => setReward(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Duration (s)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>Create Ad</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell className="font-mono">PKR {ad.reward.toFixed(2)}</TableCell>
                  <TableCell>{ad.duration}s</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(ad.id, ad.active)}>
                      {ad.active ? '🟢 Active' : '🔴 Inactive'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
