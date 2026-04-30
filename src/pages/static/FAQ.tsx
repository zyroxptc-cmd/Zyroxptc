import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export default function FAQPage() {
  const faqs = [
    { q: "How do I earn money?", a: "You can earn by watching ads, completing tasks, and referring your friends." },
    { q: "What is the minimum withdrawal?", a: "The minimum withdrawal amount is $5.00." },
    { q: "How long does a withdrawal take?", a: "Withdrawals are processed manually by our team within 24-48 hours." },
    { q: "Can I have multiple accounts?", a: "No, multiple accounts are strictly prohibited. One account per person/IP." }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-center">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-600">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
