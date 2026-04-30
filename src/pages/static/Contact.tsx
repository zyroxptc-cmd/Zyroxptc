import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-zinc-500">Have questions? We're here to help.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-zinc-900" />
            </div>
            <div>
              <p className="font-bold">Email Support</p>
              <p className="text-zinc-500 text-sm">support@clickcash.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-zinc-900" />
            </div>
            <div>
              <p className="font-bold">Phone</p>
              <p className="text-zinc-500 text-sm">+1 (555) 000-0000</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-zinc-900" />
            </div>
            <div>
              <p className="font-bold">Headquarters</p>
              <p className="text-zinc-500 text-sm">123 Earning Street, Wealth City, VC 12345</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
