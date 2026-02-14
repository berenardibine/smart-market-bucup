import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingBag, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorType = 'network' | 'config' | 'auth' | null;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing sign in...');
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!navigator.onLine) {
          setErrorType('network');
          setErrorDetail('Please check your internet connection and try again.');
          return;
        }

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlError = hashParams.get('error');
        const urlErrorDesc = hashParams.get('error_description');

        if (urlError) {
          console.error('[SmartMarket] OAuth error:', urlError, urlErrorDesc);
          if (urlError.includes('redirect') || urlErrorDesc?.includes('redirect')) {
            setErrorType('config');
            setErrorDetail('Redirect URI mismatch. The authentication service is misconfigured.');
          } else {
            setErrorType('auth');
            setErrorDetail(urlErrorDesc || 'Authentication was rejected.');
          }
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('[SmartMarket] No session:', error);
          setErrorType('auth');
          setErrorDetail('No session was created. Please try signing in again.');
          return;
        }

        console.log('[SmartMarket] Session established for', session.user.email);
        setStatus('Checking your profile...');

        // Get client-side geolocation
        let clientGeo: any = {};
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          clientGeo.lat = pos.coords.latitude;
          clientGeo.lng = pos.coords.longitude;
        } catch {
          // Will use IP fallback
        }

        // Call auth-sync
        try {
          const { data, error: syncError } = await supabase.functions.invoke('auth-sync', {
            body: clientGeo,
          });

          if (syncError) {
            console.error('[SmartMarket] Auth sync error:', syncError);
            navigate('/');
            return;
          }

          console.log('[SmartMarket] Auth sync result:', data);

          if (data?.needsProfile) {
            // Store metadata in sessionStorage for the Complete Profile page
            sessionStorage.setItem('sm-profile-metadata', JSON.stringify(data.metadata || {}));
            navigate('/complete-profile');
          } else {
            navigate('/');
          }
        } catch (syncErr) {
          console.error('[SmartMarket] Auth sync exception:', syncErr);
          navigate('/');
        }
      } catch (err) {
        console.error('[SmartMarket] Callback fatal error:', err);
        setErrorType('auth');
        setErrorDetail('An unexpected error occurred. Please try again.');
      }
    };

    handleCallback();
  }, [navigate]);

  const handleRetry = () => {
    navigate('/auth');
  };

  if (errorType) {
    const icons = {
      network: <WifiOff className="h-12 w-12 text-muted-foreground" />,
      config: <AlertTriangle className="h-12 w-12 text-primary" />,
      auth: <AlertTriangle className="h-12 w-12 text-destructive" />,
    };
    const titles = {
      network: 'Connection Failed',
      config: 'Configuration Error',
      auth: 'Authentication Failed',
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-foreground">Smart Market</h2>
          <div className="flex justify-center">{icons[errorType]}</div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{titles[errorType]}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              We couldn't verify your account. Please try again.
            </p>
            <p className="text-xs text-muted-foreground mt-1">{errorDetail}</p>
          </div>
          <Button onClick={handleRetry} className="w-full h-12 rounded-xl font-semibold gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-full text-muted-foreground">
            Continue as Guest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <ShoppingBag className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-base font-medium text-foreground">{status}</p>
        <p className="text-sm text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
