import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Bell, Moon, Sun, Globe, Lock, 
  Trash2, ChevronRight, Shield, Eye, Smartphone
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    darkMode: false,
    twoFactor: false,
    showOnlineStatus: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingSections = [
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          description: "Receive push notifications",
          key: "pushNotifications" as const,
          type: "toggle"
        },
        {
          icon: Bell,
          label: "Email Notifications",
          description: "Receive email updates",
          key: "emailNotifications" as const,
          type: "toggle"
        },
      ]
    },
    {
      title: "Appearance",
      items: [
        {
          icon: settings.darkMode ? Moon : Sun,
          label: "Dark Mode",
          description: "Switch between light and dark theme",
          key: "darkMode" as const,
          type: "toggle"
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
          key: "twoFactor" as const,
          type: "toggle"
        },
        {
          icon: Eye,
          label: "Show Online Status",
          description: "Let others see when you're online",
          key: "showOnlineStatus" as const,
          type: "toggle"
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
          type: "link",
          href: "/settings/delete",
          danger: true
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
                    item.type === 'link' && "cursor-pointer hover:bg-accent transition-colors"
                  )}
                  onClick={() => item.type === 'link' && item.href && navigate(item.href)}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    item.danger ? "bg-red-100" : "bg-muted"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5",
                      item.danger ? "text-red-600" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      item.danger && "text-red-600"
                    )}>{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {item.type === 'toggle' && item.key && (
                    <Switch
                      checked={settings[item.key]}
                      onCheckedChange={() => toggleSetting(item.key)}
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

      {/* App Version */}
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">Smart Market v1.0.0</p>
      </div>
    </div>
  );
};

export default SettingsPage;
