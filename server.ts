import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In AI Studio, we might not have a service account file readily available.
// We can use the project ID and try to initialize. 
// If it fails, we might need to fallback or ask user.
try {
  admin.initializeApp({
    projectId: 'ai-studio-applet-webapp-38226',
  });
} catch (error) {
  console.error('Firebase Admin init failed:', error);
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Claim Ad Reward
  // Body: { userId, adId, token }
  app.post('/api/ads/claim', async (req, res) => {
    try {
      const { userId, adId } = req.body;
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (decodedToken.uid !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const adRef = db.collection('ads').doc(adId);
      const adDoc = await adRef.get();
      if (!adDoc.exists) {
        return res.status(404).json({ error: 'Ad not found' });
      }
      const adData = adDoc.data();
      const reward = adData?.reward || 0;

      const userRef = db.collection('users').doc(userId);
      
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error('User not found');
        
        const userData = userDoc.data();
        const newBalance = (userData?.balance || 0) + reward;
        const newTotalEarnings = (userData?.totalEarnings || 0) + reward;

        transaction.update(userRef, {
          balance: newBalance,
          totalEarnings: newTotalEarnings,
          lastAdClaim: admin.firestore.FieldValue.serverTimestamp()
        });

        const earningRef = db.collection('earnings').doc();
        transaction.set(earningRef, {
          userId,
          adId,
          amount: reward,
          type: 'ad',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        // Referral logic
        if (userData?.referrerId) {
          const referrerRef = db.collection('users').doc(userData.referrerId);
          const referrerDoc = await transaction.get(referrerRef);
          if (referrerDoc.exists) {
            const referralBonus = reward * 0.1; // 10% referral bonus
            transaction.update(referrerRef, {
              balance: admin.firestore.FieldValue.increment(referralBonus),
              referralEarnings: admin.firestore.FieldValue.increment(referralBonus)
            });
            
            const refEarningRef = db.collection('earnings').doc();
            transaction.set(refEarningRef, {
              userId: userData.referrerId,
              amount: referralBonus,
              type: 'referral',
              fromUserId: userId,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      });

      res.json({ success: true, reward });
    } catch (error) {
      console.error('Claim error:', error);
      res.status(500).json({ error: 'Failed to claim reward' });
    }
  });

  // Admin Actions (Deposit Approval)
  app.post('/api/admin/deposits/:id/approve', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (decodedToken.email !== 'shakir.daharki@gmail.com') {
        return res.status(403).json({ error: 'Not an admin' });
      }

      const depositId = req.params.id;
      const depositRef = db.collection('deposits').doc(depositId);
      const depositDoc = await depositRef.get();
      if (!depositDoc.exists) return res.status(404).json({ error: 'Deposit not found' });
      
      const depositData = depositDoc.data();
      if (depositData?.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

      await db.runTransaction(async (transaction) => {
        transaction.update(depositRef, { status: 'approved' });
        const userRef = db.collection('users').doc(depositData.userId);
        transaction.update(userRef, {
          balance: admin.firestore.FieldValue.increment(depositData.amount)
        });
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to approve' });
    }
  });

  // Similarly for Withdrawals... 

  // --- Vite Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
