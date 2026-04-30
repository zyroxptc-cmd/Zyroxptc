export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto prose prose-zinc bg-white p-8 rounded-xl border shadow-sm">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-zinc-600 mb-4">Last Updated: April 28, 2026</p>

      <h2 className="text-xl font-bold mt-6 mb-3">1. Information We Collect</h2>
      <p>We collect your email, username, and IP address for security purposes and to prevent duplicate accounts.</p>

      <h2 className="text-xl font-bold mt-6 mb-3">2. How We Use Data</h2>
      <p>Your data is used to process earnings, verify deposits, and communicate account-related information.</p>

      <h2 className="text-xl font-bold mt-6 mb-3">3. Data Security</h2>
      <p>We implement industry-standard security measures to protect your personal information.</p>

      <h2 className="text-xl font-bold mt-6 mb-3">4. Third-Party Services</h2>
      <p>We use Firebase for authentication and database management. Your data is handled according to their privacy policies.</p>
    </div>
  );
}
