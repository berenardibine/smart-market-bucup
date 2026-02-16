import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get all pending referrals
    const { data: pendingReferrals, error: fetchError } = await supabase
      .from('referrals')
      .select('*')
      .eq('status', 'pending')
      .eq('is_valid', true);

    if (fetchError) throw fetchError;

    let activated = 0;
    let flagged = 0;

    for (const referral of pendingReferrals || []) {
      if (!referral.referred_user_id) continue;

      const [profileRes, productsRes] = await Promise.all([
        supabase.from('profiles').select('created_at, last_active, status, full_name').eq('id', referral.referred_user_id).single(),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', referral.referred_user_id).eq('status', 'active'),
      ]);

      const profile = profileRes.data;
      const productCount = productsRes.count || 0;
      if (!profile) continue;

      const accountAge = Math.floor((Date.now() - new Date(profile.created_at || 0).getTime()) / (1000 * 60 * 60 * 24));

      await supabase.from('referrals').update({
        referee_products_count: productCount,
        referee_account_age_days: accountAge,
      }).eq('id', referral.id);

      // Check activation: 3+ products AND 7+ days
      if (productCount >= 3 && accountAge >= 7) {
        await supabase.from('referrals').update({
          status: 'active',
          activated_at: new Date().toISOString(),
        }).eq('id', referral.id);

        // Award rewards to referrer
        if (referral.referrer_id) {
          const { data: existingReward } = await supabase
            .from('user_rewards')
            .select('*')
            .eq('user_id', referral.referrer_id)
            .maybeSingle();

          if (existingReward) {
            await supabase.from('user_rewards').update({
              points: (existingReward.points || 0) + 50,
              coins: (existingReward.coins || 0) + 10,
            }).eq('id', existingReward.id);
          }

          await supabase.from('referral_rewards').insert({
            user_id: referral.referrer_id,
            referral_id: referral.id,
            reward_type: 'points',
            amount: 50,
            status: 'credited',
            credited_at: new Date().toISOString(),
          });

          // Notify referrer about activation
          await supabase.from('notifications').insert({
            user_id: referral.referrer_id,
            title: 'Referral Activated! 🎉',
            message: `${profile.full_name || 'Your referral'} has completed all requirements and is now active! You earned 50 points and 10 coins.`,
            type: 'reward',
          });
        }

        // Notify referee
        await supabase.from('notifications').insert({
          user_id: referral.referred_user_id,
          title: 'Welcome Reward! 🎁',
          message: 'You completed the referral requirements. Enjoy your onboarding rewards!',
          type: 'reward',
        });

        activated++;
      }

      // Anti-fraud checks
      if (referral.ip_address) {
        const { count: sameIpCount } = await supabase
          .from('referrals')
          .select('id', { count: 'exact', head: true })
          .eq('ip_address', referral.ip_address)
          .gte('created_at', new Date(Date.now() - 3600000).toISOString());

        if ((sameIpCount || 0) > 3) {
          await supabase.from('invalid_referrals').insert({
            referral_id: referral.id,
            referral_code: referral.referral_code,
            reason: `Multiple referrals (${sameIpCount}) from same IP within 1 hour`,
            details: { ip: referral.ip_address, count: sameIpCount },
            detected_by: 'system_cron',
          });

          await supabase.from('referrals').update({
            status: 'invalid',
            invalid_reason: 'Suspicious: multiple signups from same IP',
            is_valid: false,
          }).eq('id', referral.id);

          flagged++;
        }
      }

      if (profile.status === 'blocked' || profile.status === 'banned') {
        await supabase.from('invalid_referrals').insert({
          referral_id: referral.id,
          referral_code: referral.referral_code,
          reason: `Referee account is ${profile.status}`,
          detected_by: 'system_cron',
        });
        flagged++;
      }
    }

    // Check pending redemptions - auto-validate task requirements
    const { data: pendingRedemptions } = await supabase
      .from('reward_redemptions')
      .select('*, task:reward_tasks(*)')
      .eq('status', 'pending');

    // Clean up expired featured products
    await supabase
      .from('featured_products')
      .update({ is_active: false })
      .lt('end_at', new Date().toISOString())
      .eq('is_active', true);

    return new Response(
      JSON.stringify({ success: true, activated, flagged, checked: pendingReferrals?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
