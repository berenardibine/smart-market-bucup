import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, Check, X, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminBoosts } from '@/hooks/useBoostedProducts';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminBoosts = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { boosts, loading, updateBoostStatus, refetch } = useAdminBoosts();
  const { toast } = useToast();
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) { navigate('/'); return null; }

  const handleApprove = async (boostId: string) => {
    try {
      await updateBoostStatus(boostId, 'active', 'Approved by admin');
      toast({ title: 'Boost activated! 🚀' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await updateBoostStatus(rejectModal, 'rejected', rejectReason);
      toast({ title: 'Boost rejected' });
      setRejectModal(null);
      setRejectReason('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'expired': return 'bg-muted text-muted-foreground';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-lg">Boost Management</h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : boosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Rocket className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No boost requests yet</p>
          </div>
        ) : (
          boosts.map((boost: any) => (
            <div key={boost.id} className="bg-card rounded-2xl border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{boost.product?.title || 'Unknown Product'}</p>
                  <p className="text-sm text-muted-foreground">by {boost.seller?.full_name || 'Unknown'}</p>
                </div>
                <Badge className={statusColor(boost.status)}>{boost.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{boost.duration_days} days</span>
                <span>{new Date(boost.created_at).toLocaleDateString()}</span>
              </div>
              {boost.admin_notes && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">{boost.admin_notes}</p>
              )}
              {boost.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(boost.id)} className="flex-1 gap-1 rounded-xl">
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setRejectModal(boost.id)} className="flex-1 gap-1 rounded-xl">
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Boost Request</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <Button onClick={handleReject} variant="destructive" className="w-full rounded-xl">
            Reject Boost
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBoosts;
