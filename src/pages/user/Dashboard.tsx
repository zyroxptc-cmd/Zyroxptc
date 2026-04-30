import { useAuth } from '../../App';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button, buttonVariants } from '../../components/ui/button';
import { Wallet, TrendingUp, Users, History, Copy, Check, PlayCircle, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Dashboard() {
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/signup?ref=${userData?.uid}`;

  const copyRefLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { name: 'Main Balance', value: `PKR ${userData?.balance?.toFixed(0) || '0'}`, icon: Wallet, color: 'text-blue-600' },
    { name: 'Total Earnings', value: `PKR ${userData?.totalEarnings?.toFixed(0) || '0'}`, icon: TrendingUp, color: 'text-green-600' },
    { name: 'Referral Earnings', value: `PKR ${userData?.referralEarnings?.toFixed(0) || '0'}`, icon: Users, color: 'text-purple-600' },
    { name: 'Current Plan', value: userData?.planId?.toUpperCase() || 'FREE', icon: History, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Welcome, {userData?.username}!</h1>
        <p className="text-zinc-500">Track your earnings and manage your account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-500">Share your referral link with friends and earn 10% of their ad rewards!</p>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-zinc-100 rounded-md text-xs font-mono truncate">
                {referralLink}
              </div>
              <Button size="icon" variant="outline" onClick={copyRefLink}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Link 
              to="/ads" 
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2 h-auto py-4 px-4")}
            >
              <PlayCircle className="h-5 w-5" />
              <div className="text-left">
                <p className="font-bold">Watch Ads</p>
                <p className="text-[10px] text-zinc-500">Earn money now</p>
              </div>
            </Link>
            <Link 
              to="/deposit" 
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2 h-auto py-4 px-4")}
            >
              <CreditCard className="h-5 w-5" />
              <div className="text-left">
                <p className="font-bold">Deposit</p>
                <p className="text-[10px] text-zinc-500">Add funds</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
