import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../App';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Check, Package } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  dailyAdLimit: number;
  bonusMultiplier: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      const snapshot = await getDocs(collection(db, 'plans'));
      const plansList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plan));
      setPlans(plansList.sort((a, b) => a.price - b.price));
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleBuy = async (plan: Plan) => {
    if (!user || !userData) return;
    if (userData.balance < plan.price) {
      alert('Insufficient balance to buy this plan');
      return;
    }

    if (confirm(`Are you sure you want to upgrade to ${plan.name} for PKR ${plan.price}?`)) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          balance: increment(-plan.price),
          planId: plan.id
        });
        alert(`Successfully upgraded to ${plan.name}!`);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Failed to upgrade');
      }
    }
  };

  if (loading) return <div>Loading plans...</div>;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upgrade Your Plan</h1>
        <p className="text-zinc-500">Pick a membership that fits your earning goals.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative flex flex-col ${userData?.planId === plan.id ? 'border-zinc-900 border-2 scale-105 z-10 shadow-lg' : ''}`}>
            {userData?.planId === plan.id && (
              <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded">
                CURRENT
              </div>
            )}
            <CardHeader>
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold font-mono">PKR {plan.price}</span>
                <span className="text-zinc-500 text-sm">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{plan.dailyAdLimit} Daily Ads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{plan.bonusMultiplier}x Earning Bonus</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <Check className="w-4 h-4" />
                  <span>Instant withdrawals</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={userData?.planId === plan.id ? 'outline' : 'default'}
                disabled={userData?.planId === plan.id}
                onClick={() => handleBuy(plan)}
              >
                {userData?.planId === plan.id ? 'Current Plan' : 'Purchase Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
