import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Mail, User, Phone, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import PasswordInput, { validatePassword } from '@/components/auth/PasswordInput';
import LocationSelect from '@/components/auth/LocationSelect';
import { cn } from '@/lib/utils';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  
  // Sign In fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callNumber, setCallNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [sectorId, setSectorId] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

    if (!fullName || !email || !provinceId || !districtId || !sectorId) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'buyer' && !phoneNumber) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your phone number.',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'seller' && (!callNumber || !whatsappNumber)) {
      toast({
        title: 'Contact numbers required',
        description: 'Sellers must provide both call and WhatsApp numbers.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email,
      password,
      fullName,
      userType,
      phoneNumber: userType === 'buyer' ? phoneNumber : callNumber,
      callNumber: userType === 'seller' ? callNumber : undefined,
      whatsappNumber: userType === 'seller' ? whatsappNumber : undefined,
      provinceId,
      districtId,
      sectorId,
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                ? "bg-white shadow-md text-foreground"
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
                ? "bg-white shadow-md text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Welcome Back!</h1>
              <p className="text-muted-foreground mt-2">Sign in to continue shopping</p>
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
                    className="pl-10 h-12 bg-white/80"
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
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold rounded-xl"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-muted-foreground mt-2">Join Rwanda Smart Market today</p>
            </div>

            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>I want to:</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as 'buyer' | 'seller')}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="buyer"
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    userType === 'buyer'
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value="buyer" id="buyer" />
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">Buy</span>
                  </div>
                </Label>
                <Label
                  htmlFor="seller"
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    userType === 'seller'
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value="seller" id="seller" />
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span className="font-medium">Sell</span>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 bg-white/80"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <LocationSelect
              onProvinceChange={setProvinceId}
              onDistrictChange={setDistrictId}
              onSectorChange={setSectorId}
            />

            {/* Phone Numbers */}
            {userType === 'buyer' ? (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="07X XXX XXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 h-12 bg-white/80"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="callNumber">Call Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="callNumber"
                      type="tel"
                      placeholder="07X XXX XXXX"
                      value={callNumber}
                      onChange={(e) => setCallNumber(e.target.value)}
                      className="pl-10 h-12 bg-white/80"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder="07X XXX XXXX"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="pl-10 h-12 bg-white/80"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/80"
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
              className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold rounded-xl"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        )}

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
