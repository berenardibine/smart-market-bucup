import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShoppingBag, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorType = 'network' | 'config' | 'auth' | 'sync' | null;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing sign in...');
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check network
        if (!navigator.onLine) {
          setErrorType('network');
          setErrorDetail('Please check your internet connection and try again.');
          console.error('[SmartMarket] Auth callback: No internet connection');
          return;
        }

        // Check URL for error params (Supabase puts errors in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlError = hashParams.get('error');
        const urlErrorDesc = hashParams.get('error_description');
        
        if (urlError) {
          console.error('[SmartMarket] OAuth error from URL:', urlError, urlErrorDesc);
          
          if (urlError.includes('redirect') || urlErrorDesc?.includes('redirect')) {
            setErrorType('config');
            setErrorDetail('Redirect URI mismatch. The authentication service is misconfigured.');
          } else {
            setErrorType('auth');
            setErrorDetail(urlErrorDesc || urlError || 'Authentication was rejected.');
          }
          return;
        }

        // Wait for Supabase to process the OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[SmartMarket] Auth callback session error:', error);
          setErrorType('auth');
          setErrorDetail(error.message || 'Could not establish a session.');
          return;
        }

        if (!session) {
          console.error('[SmartMarket] Auth callback: No session returned');
          setErrorType('auth');
          setErrorDetail('No session was created. Please try signing in again.');
          return;
        }

        console.log('[SmartMarket] Auth callback: Session established for', session.user.email);
        setStatus('Syncing your profile...');

        // Get client-side geolocation
        let clientGeo: any = {};
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          clientGeo.lat = pos.coords.latitude;
          clientGeo.lng = pos.coords.longitude;
        } catch {
          // Geo not available, edge function will use IP fallback
        }

        // Call auth-sync edge function
        try {
          const { data, error: syncError } = await supabase.functions.invoke('auth-sync', {
            body: clientGeo,
          });

          if (syncError) {
            console.error('[SmartMarket] Auth sync error:', syncError);
            // Still allow entry even if sync fails
            navigate('/');
            return;
          }

          console.log('[SmartMarket] Auth sync result:', data);

          if (data?.needsPhone) {
            navigate('/complete-profile/phone');
          } else {
            navigate('/');
          }
        } catch (syncErr) {
          console.error('[SmartMarket] Auth sync exception:', syncErr);
          // Don't block user if sync fails
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

  // Error screen
  if (errorType) {
    const errorConfig = {
      network: {
        icon: <WifiOff className="h-12 w-12 text-muted-foreground" />,
        title: 'Connection Failed',
      },
      config: {
        icon: <AlertTriangle className="h-12 w-12 text-primary" />,
        title: 'Configuration Error',
      },
      auth: {
        icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
        title: 'Authentication Failed',
      },
      sync: {
        icon: <AlertTriangle className="h-12 w-12 text-muted-foreground" />,
        title: 'Profile Sync Failed',
      },
    };

    const config = errorConfig[errorType];

    return (
      <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <ShoppingBag className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-foreground">Smart Market</h2>

          {/* Error Icon */}
          <div className="flex justify-center">{config.icon}</div>

          {/* Error Message */}
          <div>
            <h3 className="text-xl font-semibold text-foreground">{config.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{errorDetail}</p>
          </div>

          {/* Retry Button */}
          <Button
            onClick={handleRetry}
            className="w-full h-12 rounded-xl font-semibold gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full text-muted-foreground"
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    );
  }

  // Loading screen
  return (
    <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
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
