
-- Drop existing locations table (incompatible schema)
DROP TABLE IF EXISTS public.locations CASCADE;

-- Create enum for roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. countries
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  iso_code text UNIQUE,
  level_names jsonb DEFAULT '["Province", "District", "Sector"]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  currency_code text,
  currency_symbol text,
  phone_code text,
  lat numeric,
  lng numeric
);

-- 2. provinces
CREATE TABLE IF NOT EXISTS public.provinces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  country_id uuid REFERENCES public.countries(id)
);

-- 3. districts
CREATE TABLE IF NOT EXISTS public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id uuid NOT NULL REFERENCES public.provinces(id),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. sectors
CREATE TABLE IF NOT EXISTS public.sectors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id uuid NOT NULL REFERENCES public.districts(id),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. locations (hierarchical)
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  parent_id uuid REFERENCES public.locations(id),
  type text NOT NULL CHECK (type = ANY (ARRAY['country','province','district','sector'])),
  created_at timestamp with time zone DEFAULT now()
);

-- 6. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text NOT NULL,
  business_name text,
  bio text,
  location text,
  user_type text NOT NULL DEFAULT 'buyer',
  profile_image text,
  referral_code text,
  status text DEFAULT 'active',
  phone_number text,
  whatsapp_number text,
  call_number text,
  blocking_reason text,
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  identity_verified boolean DEFAULT false,
  id_front_photo text,
  id_back_photo text,
  verification_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_active timestamp with time zone DEFAULT now(),
  referred_by text,
  province_id uuid REFERENCES public.provinces(id),
  district_id uuid REFERENCES public.districts(id),
  sector_id uuid REFERENCES public.sectors(id),
  installed_pwa boolean DEFAULT false,
  installed_at timestamp with time zone,
  detected_ip text,
  auto_location_enabled boolean DEFAULT true,
  country text,
  country_code text,
  currency_code text,
  currency_symbol text,
  ip_address text,
  lat numeric,
  lng numeric,
  city text,
  region text,
  last_location_update timestamp with time zone
);

-- 7. shops
CREATE TABLE IF NOT EXISTS public.shops (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL,
  description text,
  logo_url text,
  contact_phone text,
  contact_email text,
  province_id uuid REFERENCES public.provinces(id),
  district_id uuid REFERENCES public.districts(id),
  sector_id uuid REFERENCES public.sectors(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  market_center text,
  owner_id uuid REFERENCES auth.users(id),
  trading_center text,
  whatsapp text,
  country text,
  currency_code text,
  lat numeric,
  lng numeric,
  city text,
  region text
);

-- 8. products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL,
  images text[] NOT NULL,
  category text,
  location text,
  status text DEFAULT 'pending',
  video_url text,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  share_count integer DEFAULT 0,
  impressions integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_negotiable boolean DEFAULT false,
  rental_rate_type text,
  contact_whatsapp text,
  contact_call text,
  discount numeric DEFAULT 0,
  discount_expiry timestamp with time zone,
  shop_id uuid REFERENCES public.shops(id),
  location_id uuid REFERENCES public.locations(id),
  product_type text DEFAULT 'retail',
  slug text UNIQUE,
  admin_posted boolean DEFAULT false,
  admin_phone text,
  admin_location text,
  show_connect_button boolean DEFAULT true,
  sponsored boolean DEFAULT false,
  rental_fee numeric,
  rental_unit text,
  rental_status text DEFAULT 'available',
  last_edited_by uuid,
  country text,
  currency_code text,
  currency_symbol text,
  lat numeric,
  lng numeric
);

-- 9. categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon text,
  type text DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now()
);

-- 10. ads
CREATE TABLE IF NOT EXISTS public.ads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type = ANY (ARRAY['image','text'])),
  title text NOT NULL,
  description text,
  image_url text,
  bg_color text DEFAULT '#f97316',
  text_color text DEFAULT '#ffffff',
  font_size text DEFAULT 'medium',
  link text,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  target_audience text DEFAULT 'all',
  location_id uuid REFERENCES public.locations(id)
);

-- 11. admin_actions
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  reason text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 12. admin_audit_log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  admin_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 13. admin_messages
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 14. ai_suggestions
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES public.profiles(id),
  suggestion_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 15. batch_optimization_jobs
CREATE TABLE IF NOT EXISTS public.batch_optimization_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  files_processed integer DEFAULT 0,
  files_failed integer DEFAULT 0,
  files_skipped integer DEFAULT 0,
  original_size_total bigint DEFAULT 0,
  optimized_size_total bigint DEFAULT 0,
  space_saved bigint DEFAULT 0,
  compression_ratio integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now()
);

-- 16. comments
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id),
  seller_id uuid REFERENCES public.profiles(id),
  user_id uuid NOT NULL,
  comment text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 17. community_posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  images text[] DEFAULT '{}'::text[],
  video_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_pinned boolean DEFAULT false
);

-- 18. contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone_number text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 19. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 20. messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id),
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 21. file_optimization_logs
CREATE TABLE IF NOT EXISTS public.file_optimization_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  original_url text NOT NULL,
  optimized_url text NOT NULL,
  original_size bigint NOT NULL DEFAULT 0,
  optimized_size bigint NOT NULL DEFAULT 0,
  compression_ratio integer NOT NULL DEFAULT 0,
  was_enhanced boolean DEFAULT false,
  target_type text DEFAULT 'product_card',
  created_at timestamp with time zone DEFAULT now()
);

-- 22. filter_analytics
CREATE TABLE IF NOT EXISTS public.filter_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  filter_type text NOT NULL,
  filter_value text,
  created_at timestamp with time zone DEFAULT now()
);

-- 23. help_articles
CREATE TABLE IF NOT EXISTS public.help_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 24. link_analytics
CREATE TABLE IF NOT EXISTS public.link_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  user_id uuid,
  source text DEFAULT 'direct',
  event text NOT NULL DEFAULT 'view',
  referrer text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  country text,
  device_type text,
  browser text,
  validation_score integer DEFAULT 100,
  is_valid boolean DEFAULT true
);

-- 25. invalid_clicks
CREATE TABLE IF NOT EXISTS public.invalid_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_analytics_id uuid REFERENCES public.link_analytics(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  reason text NOT NULL,
  details jsonb,
  ip_address text,
  risk_score integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 26. notification_badges
CREATE TABLE IF NOT EXISTS public.notification_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  count integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- 27. notification_tokens
CREATE TABLE IF NOT EXISTS public.notification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  token text NOT NULL UNIQUE,
  device_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 28. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 29. notifications_history
CREATE TABLE IF NOT EXISTS public.notifications_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'general',
  url text,
  sent_at timestamp with time zone DEFAULT now(),
  delivered boolean DEFAULT false,
  clicked boolean DEFAULT false
);

-- 30. product_analytics
CREATE TABLE IF NOT EXISTS public.product_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  viewer_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['view','impression'])),
  created_at timestamp with time zone DEFAULT now()
);

-- 31. product_analytics_daily
CREATE TABLE IF NOT EXISTS public.product_analytics_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  date date NOT NULL,
  impressions_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  unique_impressions integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  source_breakdown jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 32. product_comments
CREATE TABLE IF NOT EXISTS public.product_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  session_id text,
  user_id uuid REFERENCES public.profiles(id),
  author_name text NOT NULL,
  content text NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 1000),
  created_at timestamp with time zone DEFAULT now(),
  is_deleted boolean DEFAULT false
);

-- 33. product_daily_agg
CREATE TABLE IF NOT EXISTS public.product_daily_agg (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  impressions integer DEFAULT 0,
  views integer DEFAULT 0
);

-- 34. product_impressions
CREATE TABLE IF NOT EXISTS public.product_impressions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  ref_source text DEFAULT 'home',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 35. product_likes
CREATE TABLE IF NOT EXISTS public.product_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 36. product_metrics_cache
CREATE TABLE IF NOT EXISTS public.product_metrics_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id),
  total_impressions bigint DEFAULT 0,
  total_views bigint DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now()
);

-- 37. product_ratings
CREATE TABLE IF NOT EXISTS public.product_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now()
);

-- 38. product_requests
CREATE TABLE IF NOT EXISTS public.product_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  buyer_name text NOT NULL,
  buyer_phone text NOT NULL,
  buyer_location text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 39. product_views
CREATE TABLE IF NOT EXISTS public.product_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id),
  user_id uuid REFERENCES auth.users(id),
  session_id text NOT NULL,
  ref_source text DEFAULT 'direct',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 40. push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 41. pwa_installs_log
CREATE TABLE IF NOT EXISTS public.pwa_installs_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  event_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 42. recommendation_index
CREATE TABLE IF NOT EXISTS public.recommendation_index (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id),
  recommended_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- 43. referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES public.profiles(id),
  referred_user_id uuid UNIQUE REFERENCES public.profiles(id),
  referral_code text NOT NULL,
  is_valid boolean DEFAULT true,
  is_seller_referral boolean DEFAULT false,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  validated_at timestamp with time zone
);

-- 44. referral_logs
CREATE TABLE IF NOT EXISTS public.referral_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id uuid REFERENCES public.referrals(id),
  referral_code text NOT NULL,
  status text NOT NULL,
  reason text,
  detected_by text DEFAULT 'AI Manager',
  created_at timestamp with time zone DEFAULT now()
);

-- 45. reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id),
  reported_seller_id uuid REFERENCES public.profiles(id),
  reporter_name text NOT NULL,
  reporter_phone text NOT NULL,
  reporter_email text,
  reason text NOT NULL,
  details text,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'new' CHECK (status = ANY (ARRAY['new','in_review','resolved']))
);

-- 46. reward_tasks
CREATE TABLE IF NOT EXISTS public.reward_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  reward_points integer NOT NULL DEFAULT 0,
  reward_coins integer NOT NULL DEFAULT 0,
  task_type text NOT NULL CHECK (task_type = ANY (ARRAY['view','share','invite','rate','referral','promotion','engagement','growth','traffic','custom'])),
  requirement_count integer DEFAULT 1,
  icon text,
  color text,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  requires_evidence boolean DEFAULT false,
  category text DEFAULT 'general'
);

-- 47. seller_activity
CREATE TABLE IF NOT EXISTS public.seller_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  posts_this_month integer NOT NULL DEFAULT 0,
  updates_this_month integer NOT NULL DEFAULT 0,
  edits_this_month integer NOT NULL DEFAULT 0,
  last_reset_date timestamp with time zone NOT NULL DEFAULT date_trunc('month', now()),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 48. seller_connections
CREATE TABLE IF NOT EXISTS public.seller_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES public.profiles(id),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 49. site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name text DEFAULT 'Rwanda Smart Market',
  site_description text,
  contact_email text,
  contact_phone text,
  facebook_url text,
  twitter_url text,
  instagram_url text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid
);

-- 50. subscription_requests
CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  requested_plan_id uuid NOT NULL,
  amount_rwf integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_reference text,
  phone_paid_to text,
  message text,
  admin_note text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- 51. trending_hashtags
CREATE TABLE IF NOT EXISTS public.trending_hashtags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hashtag text NOT NULL UNIQUE,
  usage_count integer DEFAULT 1,
  last_used_at timestamp with time zone DEFAULT now()
);

-- 52. user_browsing_history
CREATE TABLE IF NOT EXISTS public.user_browsing_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id),
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 53. user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  push_notifications boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  language text DEFAULT 'en',
  show_online_status boolean DEFAULT true,
  two_factor_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  theme text DEFAULT 'light'
);

-- 54. user_privacy
CREATE TABLE IF NOT EXISTS public.user_privacy (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  show_online_status boolean DEFAULT true,
  hide_contact boolean DEFAULT false,
  hide_products boolean DEFAULT false,
  allow_messaging boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 55. user_rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  coins integer DEFAULT 0,
  points integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_login_date date,
  level integer DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  badge text DEFAULT 'Bronze'
);

-- 56. user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 57. user_security
CREATE TABLE IF NOT EXISTS public.user_security (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  two_factor_enabled boolean DEFAULT false,
  secret_key text,
  backup_codes text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 58. user_sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  device_name text,
  device_type text,
  browser text,
  ip_address text,
  location text,
  last_active timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  is_current boolean DEFAULT false
);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_optimization_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_optimization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invalid_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_daily_agg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pwa_installs_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for public read access
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Public read help_articles" ON public.help_articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public read ads" ON public.ads FOR SELECT USING (is_active = true);
CREATE POLICY "Public read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read provinces" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public read sectors" ON public.sectors FOR SELECT USING (true);
CREATE POLICY "Public read product_comments" ON public.product_comments FOR SELECT USING (is_deleted = false);
CREATE POLICY "Public read trending_hashtags" ON public.trending_hashtags FOR SELECT USING (true);
CREATE POLICY "Public read reward_tasks" ON public.reward_tasks FOR SELECT USING (is_active = true);

-- User own data policies
CREATE POLICY "Users manage own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users read own preferences" ON public.user_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own preferences" ON public.user_preferences FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users read own rewards" ON public.user_rewards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users read own privacy" ON public.user_privacy FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own privacy" ON public.user_privacy FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users read own sessions" ON public.user_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- Authenticated insert policies
CREATE POLICY "Auth insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Auth update own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Auth insert shops" ON public.shops FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Auth update own shops" ON public.shops FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Auth insert comments" ON public.product_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth insert contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert impressions" ON public.product_impressions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert views" ON public.product_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert filter_analytics" ON public.filter_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth insert push_sub" ON public.push_subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth manage push_sub" ON public.push_subscriptions FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Auth insert link_analytics" ON public.link_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read link_analytics" ON public.link_analytics FOR SELECT USING (true);

-- Admin policies using has_role function
CREATE POLICY "Admin full access products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access ads" ON public.ads FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access locations" ON public.locations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access admin_messages" ON public.admin_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access reports" ON public.reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access shops" ON public.shops FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin read all profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
