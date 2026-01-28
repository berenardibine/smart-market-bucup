import { useState, useEffect } from "react";
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { preferences, loading, updatePreference } = useUserPreferences();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    if (!preferences) return;
    updatePreference(key as any, !value);
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
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
          description: "English",
          type: "link",
          href: "/settings/language"
        },
      ]
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: Lock,
          label: "Two-Factor Authentication",
          description: "Add extra security to your account",
          key: "two_factor_enabled" as const,
          type: "toggle",
          value: preferences?.two_factor_enabled ?? false
        },
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
          type: "link",
          href: "/settings/devices"
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
            <div className="bg-card rounded-2xl border overflow-hidden divide-y">
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    (item.type === 'link' || item.type === 'danger') && "cursor-pointer hover:bg-accent transition-colors"
                  )}
                  onClick={() => {
                    if (item.type === 'link' && item.href) navigate(item.href);
                    if (item.type === 'danger' && item.action) item.action();
                  }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    item.type === 'danger' ? "bg-red-100" : "bg-muted"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5",
                      item.type === 'danger' ? "text-red-600" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      item.type === 'danger' && "text-red-600"
                    )}>{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {item.type === 'toggle' && item.key && (
                    <Switch
                      checked={item.value}
                      onCheckedChange={() => handleToggle(item.key!, item.value!)}
                      disabled={loading}
                    />
                  )}
                  {item.type === 'link' && (
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
            className="w-full h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-2"
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
              className="bg-red-600 hover:bg-red-700"
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