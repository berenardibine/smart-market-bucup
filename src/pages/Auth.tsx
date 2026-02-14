import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Mail, User, Phone, Store, ArrowLeft, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGeo } from '@/context/GeoContext';
import PasswordInput, { validatePassword } from '@/components/auth/PasswordInput';
import CountrySelect from '@/components/location/CountrySelect';
import { Country } from '@/hooks/useCountries';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  const { countries, countryCode, phoneCode } = useGeo();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up fields (Seller only)
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [callNumber, setCallNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Auto-select detected country
  useEffect(() => {
    if (countryCode && countries.length > 0 && !selectedCountry) {
      const found = countries.find(c => c.iso_code === countryCode);
      if (found) {
        setSelectedCountry(found);
        if (found.phone_code && !callNumber) {
          setCallNumber(found.phone_code + ' ');
          setWhatsappNumber(found.phone_code + ' ');
        }
      }
    }
  }, [countryCode, countries]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('[SmartMarket] Google sign-in error:', error);
        toast({
          title: 'Google sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error('[SmartMarket] Google sign-in exception:', err);
      setGoogleLoading(false);
    }
  };

  // Update phone prefix when country changes
  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    if (country.phone_code) {
      const currentCall = callNumber.replace(/^\+\d+\s*/, '');
      const currentWhatsapp = whatsappNumber.replace(/^\+\d+\s*/, '');
      setCallNumber(`${country.phone_code} ${currentCall}`);
      setWhatsappNumber(`${country.phone_code} ${currentWhatsapp}`);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      toast({
        title: 'Invalid password',
        description: 'Please meet all password requirements.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedCountry) {
      toast({
        title: 'Country required',
        description: 'Please select your country.',
        variant: 'destructive',
      });
      return;
    }

    if (!fullName || !email) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!callNumber || !whatsappNumber) {
      toast({
        title: 'Contact numbers required',
        description: 'Please provide both call and WhatsApp numbers.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email,
      password,
      fullName,
      userType: 'seller',
      phoneNumber: callNumber,
      callNumber,
      whatsappNumber,
      provinceId: 'global',
      districtId: 'global',
      sectorId: 'global',
      country: selectedCountry.name,
      countryCode: selectedCountry.iso_code,
      currencyCode: selectedCountry.currency_code || 'USD',
      currencySymbol: selectedCountry.currency_symbol || '$',
    });

    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Could not create account',
        variant: 'destructive',
      });
    } else {
      navigate('/verify-email');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-primary">
              Smart Market
            </span>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-muted/50 rounded-2xl mb-8">
          <button
            onClick={() => setMode('signin')}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300",
              mode === 'signin'
                ? "bg-white dark:bg-card shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={cn(
              "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300",
              mode === 'signup'
                ? "bg-white dark:bg-card shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Become a Seller
          </button>
        </div>

        {/* Google Sign-In Button */}
        <Button
          type="button"
          className="w-full h-12 rounded-xl font-semibold gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="white"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-background px-3 text-muted-foreground">
              or continue with email
            </span>
          </div>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
              <p className="text-muted-foreground mt-2">Sign in to manage your shop</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <PasswordInput
                value={password}
                onChange={setPassword}
                id="signin-password"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>

            <Button
              type="submit"
              className="w-full h-12 font-semibold rounded-xl"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
                <Store className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Become a Seller</h1>
              <p className="text-muted-foreground mt-2">Start selling on Smart Market globally</p>
            </div>

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

            {/* Country Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Your Country *
              </Label>
              <CountrySelect
                countries={countries}
                value={selectedCountry?.iso_code || ''}
                onChange={handleCountryChange}
                placeholder="Select your country"
                showCurrency
                showPhoneCode
              />
              {selectedCountry && (
                <p className="text-xs text-muted-foreground">
                  Currency: {selectedCountry.currency_symbol} {selectedCountry.currency_code} • 
                  Phone: {selectedCountry.phone_code}
                </p>
              )}
            </div>

            {/* Phone Numbers */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="callNumber">Call Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="callNumber"
                    type="tel"
                    placeholder={`${selectedCountry?.phone_code || '+1'} XXX XXXX`}
                    value={callNumber}
                    onChange={(e) => setCallNumber(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder={`${selectedCountry?.phone_code || '+1'} XXX XXXX`}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <PasswordInput
              value={password}
              onChange={setPassword}
              showRequirements={true}
              id="signup-password"
            />

            <Button
              type="submit"
              className="w-full h-12 font-semibold rounded-xl"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Seller Account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              🌍 Sell your products to customers worldwide
            </p>
          </form>
        )}

        {/* Guest Info */}
        <div className="mt-8 p-4 bg-muted/30 rounded-2xl text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Looking to buy?</span><br />
            Browse and contact sellers without an account!
          </p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => navigate('/')}
          >
            Continue as Guest
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
