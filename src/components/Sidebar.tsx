import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, 
  PlayCircle, 
  CreditCard, 
  TrendingUp, 
  ArrowUpCircle, 
  Settings, 
  ShieldCheck,
  Package,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Watch Ads', path: '/ads', icon: PlayCircle },
    { name: 'Plans', path: '/plans', icon: Package },
    { name: 'Deposit', path: '/deposit', icon: CreditCard },
    { name: 'Withdraw', path: '/withdrawal', icon: ArrowUpCircle },
  ];

  const adminLinks = [
    { name: 'Admin Home', path: '/admin', icon: ShieldCheck },
    { name: 'Manage Ads', path: '/admin/ads', icon: Layers },
    { name: 'Deposits', path: '/admin/deposits', icon: CreditCard },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: ArrowUpCircle },
  ];

  return (
    <aside className="w-64 border-r bg-white hidden md:flex flex-col">
      <div className="p-6 space-y-8">
        <div>
          <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">User Panel</h3>
          <nav className="space-y-1">
            {userLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === link.path 
                    ? "bg-zinc-900 text-white" 
                    : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Admin Panel</h3>
            <nav className="space-y-1">
              {adminLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === link.path 
                      ? "bg-zinc-900 text-white" 
                      : "text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
