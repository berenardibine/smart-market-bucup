import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Phone, Globe, MapPin, CheckCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionReferral, useReferral } from '@/hooks/useReferral';

interface ProfileMetadata {
  fullName?: string;
  email?: string;
  profileImage?: string;
  geo?: {
    country?: string;
    country_code?: string;
    city?: string;
    region?: string;
    lat?: number;
    lng?: number;
    currency_code?: string;
    currency_symbol?: string;
  };
}

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, profile } = useAuth();
  const { toast } = useToast();

  const [metadata, setMetadata] = useState<ProfileMetadata>({});
  const [fullName, setFullName] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('');
  const [sameNumber, setSameNumber] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const { sessionCode, referrerName: sessionReferrerName } = useSessionReferral();
  const { applyReferralCode } = useReferral();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // If profile already complete (has phone numbers), skip
  useEffect(() => {
    if (profile?.id && profile?.call_number && profile?.whatsapp_number) {
      navigate('/');
    }
  }, [profile, navigate]);

  // Load metadata from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('sm-profile-metadata');
      if (stored) {
        const parsed: ProfileMetadata = JSON.parse(stored);
        setMetadata(parsed);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.geo?.city) setCity(parsed.geo.city);
      }
    } catch {
      // Fallback to user metadata
    }

    if (user?.user_metadata) {
      if (!fullName) {
        setFullName(user.user_metadata.full_name || user.user_metadata.name || '');
      }
    }

    // Pre-fill referral code from session
    if (sessionCode && !referralCodeInput) {
      setReferralCodeInput(sessionCode);
    }
  }, [user, sessionCode]);

  const handleCallChange = (value: string) => {
    setCallNumber(value);
    if (sameNumber) setWhatsappNumber(value);
  };

  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+?\d{7,15}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate
    if (!fullName.trim()) {
      setFormError('Please complete all fields to continue.');
      return;
    }
    if (!isValidPhone(callNumber)) {
      setFormError('Please enter a valid phone number.');
      return;
    }
    if (!isValidPhone(whatsappNumber)) {
      setFormError('Please enter a valid WhatsApp number.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('complete-profile', {
        body: {
          full_name: fullName.trim(),
          call_number: callNumber.trim(),
          whatsapp_number: whatsappNumber.trim(),
          country: metadata.geo?.country || null,
          country_code: metadata.geo?.country_code || null,
          city: city.trim() || metadata.geo?.city || null,
          region: metadata.geo?.region || null,
          currency_code: metadata.geo?.currency_code || null,
          currency_symbol: metadata.geo?.currency_symbol || null,
          lat: metadata.geo?.lat || null,
          lng: metadata.geo?.lng || null,
          profile_image: metadata.profileImage || null,
        },
      });

      if (error) throw error;

      if (data?.success) {
        sessionStorage.removeItem('sm-profile-metadata');
        // Apply referral code if provided
        if (referralCodeInput.trim()) {
          await applyReferralCode(referralCodeInput.trim());
        }
        toast({ title: 'Profile created!', description: 'Welcome to Smart Market.' });
        window.location.href = '/';
      } else {
        throw new Error(data?.error || 'Failed to save profile');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('already used') || msg.includes('already exists') || msg.includes('duplicate')) {
        setFormError(msg);
      } else {
        setFormError(msg || 'Failed to create profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-3 justify-center">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-primary">Smart Market</span>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Fill in your details to start selling on Smart Market.
          </p>
        </div>

        {formError && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive text-center">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="callNumber">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="callNumber"
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
              <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  id="whatsappNumber"
                  type="tel"
                  placeholder="+250 7XX XXX XXX"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>
          )}

          {/* Country (auto-detected, read-only) */}
          {metadata.geo?.country && (
            <div className="space-y-2">
              <Label>Country</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={metadata.geo.country}
                  readOnly
                  className="pl-10 h-12 bg-muted/30"
                />
              </div>
            </div>
          )}

          {/* City (optional) */}
          <div className="space-y-2">
            <Label htmlFor="city">City (optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code (optional)</Label>
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="referralCode"
                type="text"
                placeholder="Enter referral code"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
                className="pl-10 h-12"
                disabled={!!(profile as any)?.referred_by}
              />
            </div>
            {sessionReferrerName && referralCodeInput && (
              <p className="text-xs text-primary">✓ Referred by {sessionReferrerName}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-semibold rounded-xl"
            disabled={loading || !fullName.trim() || !isValidPhone(callNumber) || !isValidPhone(whatsappNumber)}
          >
            {loading ? 'Creating profile...' : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Continue
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

export default CompleteProfile;
