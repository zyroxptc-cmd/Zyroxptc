import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, CreditCard, ArrowUpCircle, PlayCircle, Database } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeAds: 0
  });

  const fetchStats = async () => {
    const [users, deposits, withdrawals, ads] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'deposits')),
      getDocs(collection(db, 'withdrawals')),
      getDocs(collection(db, 'ads'))
    ]);

    setStats({
      totalUsers: users.size,
      totalDeposits: deposits.size,
      totalWithdrawals: withdrawals.size,
      activeAds: ads.docs.filter(d => d.data().active).length
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    try {
      const plans = [
        { id: 'free', name: 'Starter', price: 0, dailyAdLimit: 5, bonusMultiplier: 1 },
        { id: 'basic', name: 'Basic Earner', price: 500, dailyAdLimit: 15, bonusMultiplier: 1.2 },
        { id: 'pro', name: 'Pro Earner', price: 1500, dailyAdLimit: 30, bonusMultiplier: 1.8 },
        { id: 'business', name: 'Business Plan', price: 5000, dailyAdLimit: 100, bonusMultiplier: 4 }
      ];

      for (const plan of plans) {
        await setDoc(doc(db, 'plans', plan.id), plan);
      }
      alert('Database seeded with membership plans!');
    } catch (err) {
      console.error(err);
      alert('Seeding failed');
    }
  };

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
    { name: 'Total Deposits', value: stats.totalDeposits, icon: CreditCard, color: 'text-green-600' },
    { name: 'Withdrawal Requests', value: stats.totalWithdrawals, icon: ArrowUpCircle, color: 'text-red-600' },
    { name: 'Active Ads', value: stats.activeAds, icon: PlayCircle, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-zinc-500">Overview of system health and activity.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleSeed}>
          <Database className="w-4 h-4" /> Seed Plans
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
