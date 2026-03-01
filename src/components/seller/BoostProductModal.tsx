import { useState } from 'react';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BoostProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  onSubmit: (durationDays: number) => Promise<void>;
}

const plans = [
  { days: 3, label: '3 Days', description: 'Quick visibility boost' },
  { days: 7, label: '7 Days', description: 'Most popular choice' },
  { days: 14, label: '14 Days', description: 'Maximum exposure' },
];

const BoostProductModal = ({ isOpen, onClose, productTitle, onSubmit }: BoostProductModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(selectedPlan);
      toast({ title: 'Boost request submitted! 🚀', description: 'Admin will review and activate your boost.' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Failed to submit boost request', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Boost Product
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Boost <strong>{productTitle}</strong> to appear at the top of listings.
          </p>

          <div className="space-y-2">
            {plans.map((plan) => (
              <button
                key={plan.days}
                onClick={() => setSelectedPlan(plan.days)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all',
                  selectedPlan === plan.days
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{plan.label}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  {plan.days === 7 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Popular</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Admin will review your boost request and activate it.
          </p>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full gap-2 rounded-xl"
          >
            {submitting ? 'Submitting...' : 'Request Boost'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostProductModal;
