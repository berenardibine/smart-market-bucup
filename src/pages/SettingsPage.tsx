import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Bell, Moon, Sun, Globe, Lock, 
  Trash2, ChevronRight, Shield, Eye, Smartphone, LogOut
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import TwoFactorSetupModal from "@/components/settings/TwoFactorSetupModal";
import TwoFactorVerifyModal from "@/components/settings/TwoFactorVerifyModal";
import ConnectedDevicesModal from "@/components/settings/ConnectedDevicesModal";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { preferences, loading, updatePreference } = useUserPreferences();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showDisable2FAVerify, setShowDisable2FAVerify] = useState(false);

  const isSeller = profile?.user_type === 'seller';

  const handleToggle = (key: keyof NonNullable<typeof preferences>, checked: boolean) => {
    if (!preferences) return;

    // Special handling for dark mode - apply theme immediately
    if (key === 'dark_mode') {
      const newTheme = checked ? 'dark' : 'light';
      setTheme(newTheme);
      updatePreference('dark_mode', checked);
      updatePreference('theme' as any, newTheme);
      return;
    }

    // Special handling for 2FA - show setup modal to enable, verify to disable
    if (key === 'two_factor_enabled') {
      if (checked && !preferences.two_factor_enabled) {
        setShow2FAModal(true);
        return;
      }
      if (!checked && preferences.two_factor_enabled) {
        // Require 2FA code to disable
        setShowDisable2FAVerify(true);
        return;
      }
    }

    updatePreference(key as any, checked);
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Coming Soon",
      description: "Account deletion will be available soon.",
    });
    setShowDeleteDialog(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have logged out successfully.",
    });
    navigate('/');
  };

  const settingSections = [
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          description: "Receive push notifications",
          key: "push_notifications" as const,
          type: "toggle",
          value: preferences?.push_notifications ?? true
        },
        {
          icon: Bell,
          label: "Email Notifications",
          description: "Receive email updates",
          key: "email_notifications" as const,
          type: "toggle",
          value: preferences?.email_notifications ?? true
        },
      ]
    },
    {
      title: "Appearance",
      items: [
        {
          icon: preferences?.dark_mode ? Moon : Sun,
          label: "Dark Mode",
          description: "Switch between light and dark theme",
          key: "dark_mode" as const,
          type: "toggle",
          value: preferences?.dark_mode ?? false
        },
        {
          icon: Globe,
          label: "Language",
          description: preferences?.language || "English",
          type: "link",
          href: "/settings/language"
        },
      ]
    },
    {
      title: "Privacy & Security",
      items: [
        ...(isSeller ? [{
          icon: Lock,
          label: "Two-Factor Authentication",
          description: preferences?.two_factor_enabled 
            ? "Enabled - Your account is secured" 
            : "Add extra security to your account",
          key: "two_factor_enabled" as const,
          type: "toggle" as const,
          value: preferences?.two_factor_enabled ?? false
        }] : []),
        {
          icon: Eye,
          label: "Show Online Status",
          description: "Let others see when you're online",
          key: "show_online_status" as const,
          type: "toggle",
          value: preferences?.show_online_status ?? true
        },
        {
          icon: Shield,
          label: "Privacy Settings",
          description: "Manage your privacy preferences",
          type: "link",
          href: "/settings/privacy"
        },
      ]
    },
    {
      title: "Account",
      items: [
        {
          icon: Smartphone,
          label: "Connected Devices",
          description: "Manage devices logged into your account",
          type: "action",
          action: () => setShowDevicesModal(true)
        },
        {
          icon: Trash2,
          label: "Delete Account",
          description: "Permanently delete your account",
          type: "danger",
          action: () => setShowDeleteDialog(true)
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-lg">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
              {section.title}
            </h3>
            <div className="bg-card rounded-2xl border overflow-hidden divide-y divide-border">
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    (item.type === 'link' || item.type === 'danger' || item.type === 'action') && 
                    "cursor-pointer hover:bg-accent transition-colors"
                  )}
                  onClick={() => {
                    if (item.type === 'link' && 'href' in item && item.href) navigate(item.href);
                    if ((item.type === 'danger' || item.type === 'action') && 'action' in item && item.action) item.action();
                  }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    item.type === 'danger' ? "bg-destructive/10" : "bg-muted"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5",
                      item.type === 'danger' ? "text-destructive" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      item.type === 'danger' && "text-destructive"
                    )}>{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {item.type === 'toggle' && 'key' in item && item.key && (
                    <Switch
                      checked={item.value}
                      onCheckedChange={(checked) => handleToggle(item.key!, checked)}
                      disabled={loading}
                    />
                  )}
                  {(item.type === 'link' || item.type === 'action') && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      {user && (
        <div className="px-4 mt-2">
          <Button 
            onClick={() => setShowLogoutDialog(true)}
            variant="outline" 
            className="w-full h-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 gap-2"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      )}

      {/* App Version */}
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">Smart Market v1.0.0</p>
      </div>

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        open={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onSuccess={() => {
          // Refresh preferences to show enabled state
        }}
      />

      {/* Connected Devices Modal */}
      <ConnectedDevicesModal
        open={showDevicesModal}
        onClose={() => setShowDevicesModal(false)}
      />

      {/* 2FA Verify to Disable */}
      {user && (
        <TwoFactorVerifyModal
          open={showDisable2FAVerify}
          onClose={() => setShowDisable2FAVerify(false)}
          onVerified={async () => {
            setShowDisable2FAVerify(false);
            // Disable 2FA
            await supabase
              .from('user_security')
              .update({ two_factor_enabled: false, secret_key: null })
              .eq('user_id', user.id);
            await supabase
              .from('user_preferences')
              .update({ two_factor_enabled: false })
              .eq('user_id', user.id);
            updatePreference('two_factor_enabled' as any, false);
            toast({ title: "Two-factor authentication disabled" });
          }}
          userId={user.id}
          title="Confirm Disable 2FA"
          description="Enter your authenticator code to confirm disabling two-factor authentication."
        />
      )}

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account permanently? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
