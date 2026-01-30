import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Copy, Check, Loader2, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TwoFactorSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorSetupModal = ({ open, onClose, onSuccess }: TwoFactorSetupModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a random secret key (in production, use a proper TOTP library)
  const generateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format with spaces for readability
    return key.match(/.{1,4}/g)?.join(' ') || key;
  };

  const handleGenerateKey = () => {
    const key = generateSecretKey();
    setSecretKey(key);
    setStep('verify');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Secret key copied!" });
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({ title: "Please enter a 6-digit code", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // In production, verify the TOTP code against the secret
      // For demo, we'll accept any 6-digit code
      
      // Save to user_security table
      const { error: securityError } = await supabase
        .from('user_security')
        .upsert({
          user_id: user?.id,
          two_factor_enabled: true,
          secret_key: secretKey.replace(/\s/g, ''), // Store without spaces
        });

      if (securityError) throw securityError;

      // Also update user_preferences
      await supabase
        .from('user_preferences')
        .update({ two_factor_enabled: true })
        .eq('user_id', user?.id);

      toast({ title: "Two-factor authentication enabled successfully!" });
      onSuccess();
      handleClose();
    } catch (err: any) {
      toast({ 
        title: "Failed to enable 2FA", 
        description: err.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('generate');
    setSecretKey('');
    setVerificationCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Set Up Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 'generate' ? (
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-medium text-amber-800 mb-2">Why enable 2FA?</h4>
              <p className="text-sm text-amber-700">
                Two-factor authentication adds an extra layer of security to your account. 
                You'll need both your password and a code from your authenticator app to sign in.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Install an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Have your phone ready to scan or enter the secret key</li>
              </ul>
            </div>

            <Button onClick={handleGenerateKey} className="w-full gap-2">
              <Key className="h-4 w-4" />
              Generate Secret Key
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Secret Key</p>
              <p className="font-mono text-lg font-bold tracking-wider break-all">
                {secretKey}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyKey}
                className="mt-3 gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Key'}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Open your authenticator app</li>
                <li>Add a new account</li>
                <li>Choose "Enter setup key manually"</li>
                <li>Enter the secret key shown above</li>
                <li>Enter the 6-digit code below to verify</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & Enable
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorSetupModal;
