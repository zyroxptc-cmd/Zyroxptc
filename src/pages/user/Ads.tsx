import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../App';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Play, Timer, CheckCircle, ExternalLink } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  url: string;
  reward: number;
  duration: number;
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAd, setActiveAd] = useState<Ad | null>(null);
  const [timer, setTimer] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAds = async () => {
      const q = query(collection(db, 'ads'), where('active', '==', true));
      const snapshot = await getDocs(q);
      const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      setAds(adsList);
      setLoading(false);
    };
    fetchAds();
  }, []);

  useEffect(() => {
    let interval: any;
    if (activeAd && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (activeAd && timer === 0) {
      setCompleted(true);
    }
    return () => clearInterval(interval);
  }, [activeAd, timer]);

  const handleWatch = (ad: Ad) => {
    setActiveAd(ad);
    setTimer(ad.duration);
    setCompleted(false);
    // Open URL in new tab
    window.open(ad.url, '_blank');
  };

  const handleClaim = async () => {
    if (!activeAd || !user) return;
    setClaiming(true);
    try {
      const idToken = await user.getIdToken();
      const response = await window.fetch('/api/ads/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ userId: user.uid, adId: activeAd.id })
      });
      const result = await response.json();
      if (result.success) {
        alert(`Successfully claimed PKR ${result.reward}!`);
        setActiveAd(null);
        setCompleted(false);
      } else {
        alert(result.error || 'Failed to claim');
      }
    } catch (err) {
      console.error(err);
      alert('Error claiming reward');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div>Loading ads...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Watch Ads & Earn</h1>
        <p className="text-zinc-500">Click an ad, wait for the timer, and claim your reward.</p>
      </div>

      {activeAd ? (
        <Card className="border-2 border-zinc-900 bg-zinc-50">
          <CardContent className="py-12 flex flex-col items-center gap-6 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{activeAd.title}</h2>
              <p className="text-zinc-500 font-mono">Status: {completed ? 'Ready to Claim' : `Watching... ${timer}s`}</p>
            </div>
            
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-zinc-200"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * (activeAd.duration - timer)) / activeAd.duration}
                        className="text-zinc-900 transition-all duration-1000"
                    />
                </svg>
                <div className="text-3xl font-bold font-mono">{timer}</div>
            </div>

            {completed ? (
              <Button size="lg" onClick={handleClaim} disabled={claiming} className="mt-4 gap-2">
                <CheckCircle className="w-5 h-5" />
                {claiming ? 'Claiming...' : 'Claim Reward'}
              </Button>
            ) : (
              <p className="text-sm font-medium animate-pulse">Don't close the browser tab!</p>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => setActiveAd(null)} disabled={claiming}>
              Cancel task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ads.length === 0 ? (
            <p className="col-span-full text-center py-12 text-zinc-500">No active ads available right now. Check back later!</p>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{ad.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg border">
                    <div className="flex items-center gap-2 text-green-600 font-bold font-mono">
                      <span className="text-xs text-zinc-500 font-sans uppercase">Reward</span>
                      PKR {ad.reward.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
                      <Timer className="w-4 h-4" />
                      {ad.duration}s
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" onClick={() => handleWatch(ad)}>
                    <Play className="w-4 h-4" /> Watch Now
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
