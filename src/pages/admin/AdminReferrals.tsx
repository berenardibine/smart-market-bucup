import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Home, Users, CheckCircle2, Clock, XCircle,
  Star, AlertTriangle, Shield, Gift, MoreVertical, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminReferrals } from '@/hooks/useReferral';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminReferrals = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { referrals, invalidReferrals, stats, loading, updateReferralStatus, reviewInvalidReferral, addFeaturedProduct } = useAdminReferrals();
  const { toast } = useToast();
  const [actionDialog, setActionDialog] = useState<{ type: string; id: string } | null>(null);
  const [reason, setReason] = useState('');
  const [featuredDialog, setFeaturedDialog] = useState(false);
  const [featuredProductId, setFeaturedProductId] = useState('');
  const [featuredDays, setFeaturedDays] = useState('7');
  const [featuredReason, setFeaturedReason] = useState('');

  if (adminLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) { navigate('/'); return null; }

  const handleAction = async () => {
    if (!actionDialog) return;
    await updateReferralStatus(actionDialog.id, actionDialog.type, reason);
    toast({ title: `Referral ${actionDialog.type}` });
    setActionDialog(null);
    setReason('');
  };

  const handleAddFeatured = async () => {
    if (!featuredProductId) return;
    await addFeaturedProduct(featuredProductId, parseInt(featuredDays), featuredReason);
    toast({ title: 'Featured product added' });
    setFeaturedDialog(false);
    setFeaturedProductId('');
    setFeaturedReason('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="font-bold text-lg">Referral Management</h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl gap-1" onClick={() => setFeaturedDialog(true)}>
              <Plus className="h-4 w-4" /> Feature
            </Button>
            <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Home className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Featured', value: stats.featuredCount, icon: Star, color: 'from-purple-500 to-violet-500' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl p-3 border">
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2", s.color)}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-3 h-10 rounded-xl">
            <TabsTrigger value="all" className="text-xs rounded-lg">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs rounded-lg">Pending</TabsTrigger>
            <TabsTrigger value="fraud" className="text-xs rounded-lg relative">
              Fraud Queue
              {invalidReferrals.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                  {invalidReferrals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-3 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No referrals yet</div>
            ) : (
              referrals.map((ref: any) => (
                <div key={ref.id} className="bg-card rounded-xl p-3 border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {ref.referrer?.full_name?.slice(0, 2) || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ref.referrer?.full_name || 'Unknown'} → {ref.referee?.full_name || 'Pending signup'}</p>
                    <p className="text-xs text-muted-foreground">{ref.referral_code} • {ref.created_at ? format(new Date(ref.created_at), 'MMM d') : ''}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px]",
                    ref.status === 'active' && "bg-green-50 text-green-700 border-green-200",
                    ref.status === 'pending' && "bg-amber-50 text-amber-700 border-amber-200",
                    ref.status === 'invalid' && "bg-red-50 text-red-700 border-red-200",
                  )}>
                    {ref.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-muted"><MoreVertical className="h-4 w-4" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setActionDialog({ type: 'active', id: ref.id })}>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Activate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActionDialog({ type: 'invalid', id: ref.id })}>
                        <XCircle className="h-4 w-4 mr-2 text-red-600" /> Mark Invalid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActionDialog({ type: 'cancelled', id: ref.id })}>
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" /> Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-3 space-y-2">
            {referrals.filter((r: any) => r.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No pending referrals</div>
            ) : (
              referrals.filter((r: any) => r.status === 'pending').map((ref: any) => (
                <div key={ref.id} className="bg-card rounded-xl p-3 border flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ref.referrer?.full_name || 'Unknown'} → {ref.referee?.full_name || 'Pending'}</p>
                    <p className="text-xs text-muted-foreground">Products: {ref.referee_products_count || 0}/3 • Age: {ref.referee_account_age_days || 0}/7 days</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs rounded-lg" onClick={() => setActionDialog({ type: 'active', id: ref.id })}>
                    Activate
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="fraud" className="mt-3 space-y-2">
            {invalidReferrals.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-10 w-10 text-green-500/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No fraud reports</p>
              </div>
            ) : (
              invalidReferrals.map((inv: any) => (
                <div key={inv.id} className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{inv.reason}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Code: {inv.referral_code} • {inv.detected_by}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs rounded-lg" onClick={() => reviewInvalidReferral(inv.id, 'cleared')}>
                      Clear
                    </Button>
                    <Button size="sm" variant="destructive" className="text-xs rounded-lg" onClick={() => reviewInvalidReferral(inv.id, 'confirmed_invalid')}>
                      Confirm Invalid
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'active' ? 'Activate Referral' : actionDialog?.type === 'invalid' ? 'Mark Invalid' : 'Cancel Referral'}
            </DialogTitle>
          </DialogHeader>
          {(actionDialog?.type === 'invalid' || actionDialog?.type === 'cancelled') && (
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={handleAction} className={actionDialog?.type === 'invalid' ? 'bg-red-600 hover:bg-red-700' : ''}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Featured Dialog */}
      <Dialog open={featuredDialog} onOpenChange={setFeaturedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Featured Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Product ID</Label>
              <Input value={featuredProductId} onChange={(e) => setFeaturedProductId(e.target.value)} placeholder="Enter product UUID" />
            </div>
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input type="number" value={featuredDays} onChange={(e) => setFeaturedDays(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={featuredReason} onChange={(e) => setFeaturedReason(e.target.value)} placeholder="Admin featured" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeaturedDialog(false)}>Cancel</Button>
            <Button onClick={handleAddFeatured}>Add Featured</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReferrals;
