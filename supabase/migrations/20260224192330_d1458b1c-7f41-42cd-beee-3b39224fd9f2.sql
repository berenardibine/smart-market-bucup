
-- 1. Create site_pages table for admin-editable legal/SEO pages
CREATE TABLE IF NOT EXISTS public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text,
  content text NOT NULL DEFAULT '',
  is_published boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read published pages
CREATE POLICY "Public read site_pages" ON public.site_pages
  FOR SELECT USING (is_published = true);

-- Admin full access
CREATE POLICY "Admin full access site_pages" ON public.site_pages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Seed default pages
INSERT INTO public.site_pages (slug, title, meta_description, content) VALUES
('privacy', 'Privacy Policy – Smart Market Rwanda', 'Discover how Smart Market Rwanda protects your privacy, secures your data, and ensures safe online transactions for all buyers and sellers.', '<h1>Privacy Policy of Smart Market Rwanda</h1><p><strong>Effective Date:</strong> February 2026</p><p>Welcome to Smart Market Rwanda, an innovative online marketplace designed to connect buyers and sellers across Rwanda and Africa.</p><p>Your privacy and data protection are our top priority.</p><h2>1. Information We Collect</h2><p>We collect limited personal data to improve your experience:</p><ul><li>Name, phone number, and email for account registration.</li><li>Location (optional) to show nearby products.</li><li>Device IP address to secure your session.</li><li>Product listings, comments, and activity logs for marketplace functionality.</li></ul><h2>2. How We Use Your Information</h2><p>We use your information to:</p><ul><li>Create and manage your account.</li><li>Display relevant products in your area.</li><li>Improve our services and personalize your experience.</li><li>Prevent fraud, spam, and unauthorized access.</li><li>Communicate updates, offers, or security alerts.</li></ul><h2>3. Data Storage and Security</h2><p>All data is securely stored in our encrypted cloud servers powered by Supabase.</p><p>We do not sell or share your data with third parties, except when required by law or to process payments securely.</p><h2>4. Cookies and Session Tracking</h2><p>Smart Market uses cookies to keep your session active and improve loading speed.</p><p>You can disable cookies in your browser, but some features may not function properly.</p><h2>5. User Control and Account Deletion</h2><p>You have full control of your data. You can update, export, or request deletion of your account anytime.</p><h2>6. Updates to This Policy</h2><p>We may occasionally update this Privacy Policy to improve transparency and comply with legal requirements.</p><p>All changes will be announced via email or app notifications.</p><p>For questions, contact: 📧 support@smartmarket.rw</p>'),
('terms', 'Terms & Conditions – Smart Market Rwanda', 'Read the official Terms & Conditions of Smart Market Rwanda to understand your rights, responsibilities, and safe online trading guidelines.', '<h1>Terms and Conditions</h1><p><strong>Effective Date:</strong> February 2026</p><p>Welcome to Smart Market Rwanda — by accessing or using our platform, you agree to these terms.</p><h2>1. Introduction</h2><p>Smart Market Rwanda provides an online platform where users can list, buy, and sell products or services securely.</p><h2>2. User Accounts</h2><ul><li>You must provide accurate information when registering.</li><li>Each user is responsible for activities performed under their account.</li><li>Smart Market reserves the right to suspend or delete accounts involved in fraud, spam, or illegal activity.</li></ul><h2>3. Sellers'' Responsibilities</h2><ul><li>Sellers must post genuine products with correct details and fair prices.</li><li>Misleading information or fake listings may result in permanent suspension.</li><li>Sellers must respect buyers'' privacy and never share personal contact details without consent.</li></ul><h2>4. Buyers'' Responsibilities</h2><ul><li>Buyers must verify product details before purchase.</li><li>Any transaction made outside the Smart Market system is at your own risk.</li></ul><h2>5. Payments and Refunds</h2><p>Payments made through Smart Market-supported payment gateways are secure and encrypted. Refunds may be provided under certain verified conditions.</p><h2>6. Intellectual Property</h2><p>All Smart Market trademarks, brand assets, and software are protected by copyright law. You may not copy, modify, or redistribute any part of the platform without written permission.</p><h2>7. Limitation of Liability</h2><p>Smart Market Rwanda is not responsible for any indirect losses or damages arising from user transactions, misuse, or technical errors.</p><h2>8. Termination</h2><p>Smart Market reserves the right to terminate accounts that violate these terms without prior notice.</p><h2>9. Governing Law</h2><p>These Terms are governed by the laws of Rwanda.</p>'),
('disclaimer', 'Disclaimer – Smart Market Rwanda', 'Smart Market Rwanda Disclaimer – Learn about our responsibility, product authenticity policy, and user accountability guidelines.', '<h1>Disclaimer</h1><p>All products, services, and listings displayed on Smart Market Rwanda are posted by independent sellers.</p><p>Smart Market acts as a digital bridge between buyers and sellers and does not own or directly sell any listed product.</p><ul><li>Product descriptions and prices are provided by the sellers.</li><li>Smart Market cannot guarantee product availability, quality, or delivery speed.</li><li>Users are advised to verify product details and communicate safely through official channels.</li><li>We do not take responsibility for external links or third-party content shared on our platform.</li></ul><p>By using Smart Market, you acknowledge that all transactions are made at your own discretion and responsibility.</p>'),
('about', 'About Us – Smart Market Rwanda', 'Smart Market Rwanda – Africa''s fastest-growing online marketplace for local sellers, innovative buyers, and digital entrepreneurs.', '<h1>About Smart Market Rwanda</h1><p>Smart Market Rwanda is a modern digital marketplace designed to empower local sellers and simplify online shopping in Africa.</p><p>We combine technology, automation, and secure payments to build a reliable space where everyone can trade confidently.</p><h2>Our Mission</h2><p>To connect millions of Africans through technology and create new digital income opportunities.</p><h2>Our Vision</h2><p>To become Africa''s leading smart e-commerce ecosystem powered by AI and community innovation.</p>')
ON CONFLICT (slug) DO NOTHING;

-- 3. Fix notification delivery: Allow all authenticated users to read global notifications (user_id IS NULL)
CREATE POLICY "Users read global notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id IS NULL);

-- 4. Allow authenticated users to update their own notification read status
CREATE POLICY "Users update own notification read" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 5. Add 'seller_dashboard' to ads target_audience options (no schema change needed, just data convention)
