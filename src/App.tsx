/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/user/Dashboard';
import AdsPage from './pages/user/Ads';
import PlansPage from './pages/user/Plans';
import DepositPage from './pages/user/Deposit';
import WithdrawalPage from './pages/user/Withdrawal';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAds from './pages/admin/AdminAds';
import AdminDeposits from './pages/admin/AdminDeposits';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';

// Static
import ContactPage from './pages/static/Contact';
import FAQPage from './pages/static/FAQ';
import TermsPage from './pages/static/Terms';
import PrivacyPage from './pages/static/Privacy';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { SidebarProvider } from './components/ui/sidebar';

import { Toaster } from 'sonner';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // In case user exists in Auth but not in Firestore (shouldnt happen)
          const newData = {
            uid: user.uid,
            email: user.email,
            username: user.email?.split('@')[0],
            balance: 0,
            totalEarnings: 0,
            referralEarnings: 0,
            role: user.email === 'shakir.daharki@gmail.com' ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', user.uid), newData);
          setUserData(newData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userData?.role === 'admin';

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin }}>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50 flex flex-col">
          <Toaster position="top-center" richColors />
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            {user && <Sidebar />}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
                
                {/* User Private */}
                <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
                <Route path="/ads" element={user ? <AdsPage /> : <Navigate to="/login" />} />
                <Route path="/plans" element={user ? <PlansPage /> : <Navigate to="/login" />} />
                <Route path="/deposit" element={user ? <DepositPage /> : <Navigate to="/login" />} />
                <Route path="/withdrawal" element={user ? <WithdrawalPage /> : <Navigate to="/login" />} />
                
                {/* Admin Private */}
                <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
                <Route path="/admin/ads" element={isAdmin ? <AdminAds /> : <Navigate to="/dashboard" />} />
                <Route path="/admin/deposits" element={isAdmin ? <AdminDeposits /> : <Navigate to="/dashboard" />} />
                <Route path="/admin/withdrawals" element={isAdmin ? <AdminWithdrawals /> : <Navigate to="/dashboard" />} />

                {/* Static */}
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
