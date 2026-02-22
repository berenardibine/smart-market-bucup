import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Routes that don't require profile completion
const EXEMPT_ROUTES = [
  '/auth',
  '/auth/callback',
  '/complete-profile',
  '/complete-profile/phone',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/blocked',
];

const ProfileCompletionGuard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user) return;

    // Don't redirect on exempt routes
    const isExempt = EXEMPT_ROUTES.some(route => location.pathname.startsWith(route));
    if (isExempt) return;

    // If user has a profile but missing phone numbers, redirect to complete profile phone
    if (profile && (!profile.call_number || !profile.whatsapp_number)) {
      navigate('/complete-profile/phone', { replace: true });
      return;
    }

    // If user exists but no profile at all (shouldn't happen with trigger, but safety net)
    if (!profile) {
      // Wait a bit for profile to load from auth-sync
      const timer = setTimeout(() => {
        if (!profile) {
          navigate('/complete-profile', { replace: true });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, location.pathname, navigate]);

  return null;
};

export default ProfileCompletionGuard;
