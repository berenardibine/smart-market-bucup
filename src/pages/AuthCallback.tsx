import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait for Supabase to process the OAuth callback
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('Auth callback error:', error);
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => navigate('/auth'), 2000);
          return;
        }

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
        const { data, error: syncError } = await supabase.functions.invoke('auth-sync', {
          body: clientGeo,
        });

        if (syncError) {
          console.error('Auth sync error:', syncError);
          // Still allow entry even if sync fails - profile will sync next time
          navigate('/');
          return;
        }

        if (data?.needsPhone) {
          navigate('/complete-profile/phone');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Callback error:', err);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-lg font-medium text-foreground">{status}</p>
        <p className="text-sm text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
