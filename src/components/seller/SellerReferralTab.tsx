import { Users, Gift, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useReferral } from '@/hooks/useReferral';
import ShareReferral from '@/components/referral/ShareReferral';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const SellerReferralTab = () => {
  const { referrals, stats, loading } = useReferral();

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border">
          <Users className="h-5 w-5 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          <p className="text-xs text-muted-foreground">Total Referrals</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border">
          <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
          <p className="text-2xl font-bold">{stats.activeReferrals}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border">
          <Clock className="h-5 w-5 text-amber-600 mb-2" />
          <p className="text-2xl font-bold">{stats.pendingReferrals}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl p-4 border">
          <Gift className="h-5 w-5 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">{stats.totalRewards}</p>
          <p className="text-xs text-muted-foreground">Rewards Earned</p>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-card rounded-2xl p-4 border shadow-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Share & Earn
        </h3>
        <ShareReferral />
      </div>

      {/* Referral List */}
      <div className="bg-card rounded-2xl p-4 border shadow-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Your Referrals
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No referrals yet. Share your code to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((ref) => (
              <div key={ref.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {ref.referral_code?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    Referee #{ref.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ref.created_at ? format(new Date(ref.created_at), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px]",
                    ref.status === 'active' && "bg-green-50 text-green-700 border-green-200",
                    ref.status === 'pending' && "bg-amber-50 text-amber-700 border-amber-200",
                    ref.status === 'invalid' && "bg-red-50 text-red-700 border-red-200",
                  )}
                >
                  {ref.status === 'active' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {ref.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                  {ref.status === 'invalid' && <XCircle className="h-3 w-3 mr-1" />}
                  {ref.status || 'pending'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerReferralTab;
