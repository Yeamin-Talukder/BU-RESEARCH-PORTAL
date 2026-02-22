import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';

interface VerificationProps {
  email?: string;
  onVerified: () => void;
}

const Verification: React.FC<VerificationProps> = ({ email: propEmail, onVerified }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [email, _setEmail] = useState(propEmail || location.state?.email || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
       toast.error("No email to verify. Please register first.");
       navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      toast.success('Email verified successfully! You can now log in.');
      onVerified();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify your Email</CardTitle>
            <CardDescription className="pt-2">
              We sent a verification code to <span className="font-semibold text-slate-800">{email}</span>.
              <br />Please check your inbox (and console/spam).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">


              <div className="space-y-2">
                <Label htmlFor="code" className="sr-only">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
                <p className="text-center text-xs text-slate-500">Enter the 6-digit code</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;
