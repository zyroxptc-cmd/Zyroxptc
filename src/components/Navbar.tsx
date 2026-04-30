import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Button, buttonVariants } from './ui/button';
import { LogOut, User, Landmark } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white px-4 py-3 flex items-center justify-between z-50">
      <Link to="/" className="flex items-center gap-2">
        <Landmark className="w-8 h-8 text-zinc-900" />
        <span className="font-bold text-xl tracking-tight">ClickCash</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Balance</span>
              <span className="font-mono font-bold text-zinc-900">PKR {userData?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            <Link to="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
              <User className="w-5 h-5" />
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className={cn(buttonVariants({ variant: "ghost" }))}>Login</Link>
            <Link to="/signup" className={cn(buttonVariants({ variant: "default" }))}>Start Earning</Link>
          </>
        )}
      </div>
    </nav>
  );
}
