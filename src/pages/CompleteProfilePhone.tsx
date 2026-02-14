import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CompleteProfilePhone = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [callNumber, setCallNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [sameNumber, setSameNumber] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // If phone already set, skip this page
  useEffect(() => {
    if (profile?.call_number && profile?.whatsapp_number) {
      navigate('/');
    }
  }, [profile, navigate]);

  // Pre-fill country code from profile
  useEffect(() => {
    if (profile?.country_code && !callNumber) {
      const code = profile.country_code.startsWith('+') ? profile.country_code : `+${profile.country_code}`;
      // Only set if it looks like a phone code, not ISO code
      if (/^\+\d+$/.test(code)) {
        setCallNumber(code + ' ');
        setWhatsappNumber(code + ' ');
      }
    }
  }, [profile]);

  const handleWhatsappChange = (value: string) => {
    setWhatsappNumber(value);
  };

  const handleCallChange = (value: string) => {
    setCallNumber(value);
    if (sameNumber) {
      setWhatsappNumber(value);
    }
  };

  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+?\d{7,15}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone(callNumber)) {
      toast({ title: 'Invalid call number', description: 'Please enter a valid phone number.', variant: 'destructive' });
      return;
    }

    if (!isValidPhone(whatsappNumber)) {
      toast({ title: 'Invalid WhatsApp number', description: 'Please enter a valid WhatsApp number.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('complete-profile', {
        body: {
          call_number: callNumber.trim(),
          whatsapp_number: whatsappNumber.trim(),
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({ title: 'Profile completed!', description: 'Your contact info has been saved.' });
        // Refresh profile in auth context
        window.location.href = '/';
      } else {
        throw new Error(data?.error || 'Failed to save');
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save phone numbers.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Complete Profile
            </span>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Phone className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Add Your Phone Numbers</h1>
          <p className="text-muted-foreground mt-2">
            Buyers need to reach you. Add your call and WhatsApp numbers to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Call Number */}
          <div className="space-y-2">
            <Label htmlFor="call-number">Call Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="call-number"
                type="tel"
                placeholder="+250 7XX XXX XXX"
                value={callNumber}
                onChange={(e) => handleCallChange(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          {/* Same number toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sameNumber}
              onChange={(e) => {
                setSameNumber(e.target.checked);
                if (e.target.checked) setWhatsappNumber(callNumber);
              }}
              className="rounded border-border"
            />
            <span className="text-sm text-muted-foreground">WhatsApp is the same number</span>
          </label>

          {/* WhatsApp Number */}
          {!sameNumber && (
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">WhatsApp Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                <Input
                  id="whatsapp-number"
                  type="tel"
                  placeholder="+250 7XX XXX XXX"
                  value={whatsappNumber}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 font-semibold rounded-xl"
            disabled={loading || !isValidPhone(callNumber) || !isValidPhone(whatsappNumber)}
          >
            {loading ? 'Saving...' : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your numbers will be visible to potential buyers on your product listings.
        </p>
      </div>
    </div>
  );
};

export default CompleteProfilePhone;
