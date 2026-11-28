ALTER TABLE public.products
  ADD COLUMN slug text,
  ADD COLUMN currency text NOT NULL DEFAULT 'MZN',
  ADD COLUMN price numeric(14,2),
  ADD COLUMN category text NOT NULL DEFAULT 'outro',
  ADD COLUMN guarantee_days integer NOT NULL DEFAULT 7,
  ADD COLUMN billing_type text NOT NULL DEFAULT 'one_time',
  ADD COLUMN affiliate_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN affiliate_commission_percent numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN checkout_banner_url text,
  ADD COLUMN checkout_button_color text NOT NULL DEFAULT '#10B981',
  ADD COLUMN scarcity_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN order_bump_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN meta_pixel_id text,
  ADD COLUMN tiktok_pixel_id text,
  ADD COLUMN google_analytics_id text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.products SET price = price_mzn WHERE price IS NULL;
UPDATE public.products SET slug = 'p-' || replace(id::text, '-', '') WHERE slug IS NULL;
ALTER TABLE public.products ALTER COLUMN price SET NOT NULL, ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.products
  ADD CONSTRAINT products_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  ADD CONSTRAINT products_currency_allowed CHECK (currency IN ('MZN','USD','BRL','EUR','GBP','ZAR','AOA','CAD')),
  ADD CONSTRAINT products_guarantee_allowed CHECK (guarantee_days IN (7,14,15,30)),
  ADD CONSTRAINT products_billing_allowed CHECK (billing_type IN ('one_time','recurring')),
  ADD CONSTRAINT products_aff_pct CHECK (affiliate_commission_percent BETWEEN 0 AND 90),
  ADD CONSTRAINT products_price_positive CHECK (price > 0),
  ADD CONSTRAINT products_scarcity CHECK (scarcity_minutes BETWEEN 0 AND 180);
CREATE UNIQUE INDEX products_slug_key ON public.products(slug);
CREATE INDEX products_user_created_idx ON public.products(user_id, created_at DESC);
CREATE INDEX products_bump_idx ON public.products(order_bump_product_id);
DROP POLICY IF EXISTS "public active products" ON public.products;
REVOKE SELECT ON public.products FROM anon;

ALTER TABLE public.orders
  ADD COLUMN currency text NOT NULL DEFAULT 'MZN',
  ADD COLUMN gross_amount numeric(14,2),
  ADD COLUMN platform_fee numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN affiliate_commission numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN net_amount numeric(14,2),
  ADD COLUMN fee_percent_snapshot numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN fixed_fee_snapshot numeric(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN hold_days_snapshot integer NOT NULL DEFAULT 7,
  ADD COLUMN available_at timestamptz,
  ADD COLUMN paid_at timestamptz,
  ADD COLUMN refunded_at timestamptz,
  ADD COLUMN refund_reason text,
  ADD COLUMN affiliate_id uuid,
  ADD COLUMN bump_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN provider text NOT NULL DEFAULT 'paysuite',
  ADD COLUMN idempotency_key text;
UPDATE public.orders SET gross_amount = amount_mzn, net_amount = amount_mzn,
  available_at = created_at + interval '7 days' WHERE gross_amount IS NULL;
ALTER TABLE public.orders ALTER COLUMN gross_amount SET NOT NULL, ALTER COLUMN net_amount SET NOT NULL;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_currency_allowed CHECK (currency IN ('MZN','USD','BRL','EUR','GBP','ZAR','AOA','CAD')),
  ADD CONSTRAINT orders_amounts_nonneg CHECK (gross_amount >= 0 AND platform_fee >= 0 AND affiliate_commission >= 0 AND net_amount >= 0);
CREATE UNIQUE INDEX orders_idempotency_key ON public.orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX orders_provider_ref_key ON public.orders(provider, provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX orders_affiliate_idx ON public.orders(affiliate_id, created_at DESC);
CREATE INDEX orders_product_idx ON public.orders(product_id);
CREATE INDEX orders_bump_idx ON public.orders(bump_product_id);
DROP POLICY IF EXISTS "seller reads orders" ON public.orders;

ALTER TABLE public.withdrawals
  ADD COLUMN currency text NOT NULL DEFAULT 'MZN',
  ADD COLUMN amount numeric(14,2),
  ADD COLUMN admin_note text,
  ADD COLUMN processed_at timestamptz,
  ADD COLUMN processed_by uuid;
UPDATE public.withdrawals SET amount = amount_mzn WHERE amount IS NULL;
ALTER TABLE public.withdrawals ALTER COLUMN amount SET NOT NULL;
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_status_check;
ALTER TABLE public.withdrawals
  ADD CONSTRAINT withdrawals_status_allowed CHECK (status IN ('requested','in_review','paid','rejected')),
  ADD CONSTRAINT withdrawals_currency_allowed CHECK (currency IN ('MZN','USD','BRL','EUR','GBP','ZAR','AOA','CAD'));
DROP POLICY IF EXISTS "own withdrawals insert" ON public.withdrawals;
REVOKE INSERT ON public.withdrawals FROM authenticated;
CREATE INDEX withdrawals_user_created_idx ON public.withdrawals(user_id, created_at DESC);

ALTER TABLE public.profiles
  ADD COLUMN whatsapp text,
  ADD COLUMN onboarded boolean NOT NULL DEFAULT false,
  ADD COLUMN custom_fee_percent numeric(5,2);

CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "seller or affiliate reads orders" ON public.orders FOR SELECT TO authenticated
  USING (seller_id = (select auth.uid()) OR affiliate_id = (select auth.uid()) OR (select public.has_role((select auth.uid()), 'admin')));

CREATE TABLE public.platform_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  fee_percent numeric(5,2) NOT NULL DEFAULT 6.99 CHECK (fee_percent BETWEEN 0 AND 50),
  hold_days integer NOT NULL DEFAULT 7 CHECK (hold_days BETWEEN 0 AND 90),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed in read settings" ON public.platform_settings FOR SELECT TO authenticated USING (true);
INSERT INTO public.platform_settings (id) SELECT 1;

CREATE TABLE public.currency_limits (
  currency text PRIMARY KEY CHECK (currency IN ('MZN','USD','BRL','EUR','GBP','ZAR','AOA','CAD')),
  min_withdrawal numeric(14,2) NOT NULL CHECK (min_withdrawal > 0),
  max_withdrawal numeric(14,2) NOT NULL,
  fixed_fee numeric(14,2) NOT NULL DEFAULT 0 CHECK (fixed_fee >= 0),
  CHECK (max_withdrawal >= min_withdrawal)
);
GRANT SELECT ON public.currency_limits TO authenticated;
GRANT ALL ON public.currency_limits TO service_role;
ALTER TABLE public.currency_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed in read limits" ON public.currency_limits FOR SELECT TO authenticated USING (true);
INSERT INTO public.currency_limits (currency, min_withdrawal, max_withdrawal)
SELECT * FROM (VALUES ('MZN',500,150000),('USD',20,10000),('BRL',50,50000),('EUR',20,10000),
  ('GBP',20,10000),('ZAR',300,100000),('AOA',10000,2000000),('CAD',25,10000)) v(c,mi,ma);

CREATE TABLE public.affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  producer_id uuid NOT NULL,
  affiliate_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, affiliate_id)
);
GRANT SELECT ON public.affiliations TO authenticated;
GRANT ALL ON public.affiliations TO service_role;
ALTER TABLE public.affiliations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants read affiliations" ON public.affiliations FOR SELECT TO authenticated
  USING (affiliate_id = (select auth.uid()) OR producer_id = (select auth.uid()));
CREATE INDEX affiliations_producer_idx ON public.affiliations(producer_id, created_at DESC);
CREATE INDEX affiliations_affiliate_idx ON public.affiliations(affiliate_id, created_at DESC);

CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages modules" ON public.modules FOR ALL TO authenticated
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = (select auth.uid())))
  WITH CHECK (product_id IN (SELECT id FROM public.products WHERE user_id = (select auth.uid())));
CREATE INDEX modules_product_idx ON public.modules(product_id, position);

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '',
  video_url text CHECK (video_url IS NULL OR video_url ~ '^https://'),
  attachment_url text CHECK (attachment_url IS NULL OR attachment_url ~ '^https://'),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages lessons" ON public.lessons FOR ALL TO authenticated
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = (select auth.uid())))
  WITH CHECK (product_id IN (SELECT id FROM public.products WHERE user_id = (select auth.uid())));
CREATE INDEX lessons_module_idx ON public.lessons(module_id, position);
CREATE INDEX lessons_product_idx ON public.lessons(product_id);

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
GRANT SELECT ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student reads own enrollments" ON public.enrollments FOR SELECT TO authenticated
  USING (lower(customer_email) = lower((select auth.jwt() ->> 'email')));
CREATE INDEX enrollments_email_idx ON public.enrollments(lower(customer_email));
CREATE INDEX enrollments_product_idx ON public.enrollments(product_id);

CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);
GRANT SELECT, INSERT, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own progress select" ON public.lesson_progress FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "own progress delete" ON public.lesson_progress FOR DELETE TO authenticated USING (user_id = (select auth.uid()));
CREATE INDEX lesson_progress_lesson_idx ON public.lesson_progress(lesson_id);

CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL,
  requested_by text NOT NULL,
  reason text NOT NULL CHECK (length(reason) BETWEEN 5 AND 1000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','rejected')),
  provider_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT ON public.refund_requests TO authenticated;
GRANT ALL ON public.refund_requests TO service_role;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller or admin reads refunds" ON public.refund_requests FOR SELECT TO authenticated
  USING (seller_id = (select auth.uid()) OR (select public.has_role((select auth.uid()), 'admin')));
CREATE UNIQUE INDEX refund_requests_open_key ON public.refund_requests(order_id) WHERE status = 'open';
CREATE INDEX refund_requests_seller_idx ON public.refund_requests(seller_id, created_at DESC);

CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_key text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_key)
);
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX payment_events_order_idx ON public.payment_events(order_id);

CREATE TABLE public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL CHECK (url ~ '^https://'),
  events text[] NOT NULL DEFAULT '{}',
  secret text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.webhooks TO service_role;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE INDEX webhooks_user_idx ON public.webhooks(user_id, created_at DESC);

CREATE TABLE public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event text NOT NULL,
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','failed')),
  last_status_code integer,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads deliveries" ON public.webhook_deliveries FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE INDEX webhook_deliveries_user_idx ON public.webhook_deliveries(user_id, created_at DESC);
CREATE INDEX webhook_deliveries_webhook_idx ON public.webhook_deliveries(webhook_id);
CREATE INDEX webhook_deliveries_due_idx ON public.webhook_deliveries(status, next_attempt_at);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications select" ON public.notifications FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING ((select public.has_role((select auth.uid()), 'admin')));
CREATE INDEX audit_logs_created_idx ON public.audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION public.sync_enrollment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO public.enrollments(order_id, product_id, customer_email)
    VALUES (NEW.id, NEW.product_id, lower(NEW.customer_email))
    ON CONFLICT (order_id) DO UPDATE SET status = 'active', revoked_at = NULL;
  ELSIF NEW.status IN ('refunded','chargeback') THEN
    UPDATE public.enrollments SET status = 'revoked', revoked_at = now() WHERE order_id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.sync_enrollment() FROM public, anon, authenticated;
CREATE TRIGGER orders_sync_enrollment AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.sync_enrollment();
INSERT INTO public.enrollments(order_id, product_id, customer_email)
SELECT id, product_id, lower(customer_email) FROM public.orders WHERE status = 'approved';

DROP POLICY IF EXISTS "product images public read" ON storage.objects;
CREATE POLICY "product images owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = (select auth.uid())::text);

COMMENT ON COLUMN public.products.price_mzn IS 'DEPRECATED: replaced by price + currency';
COMMENT ON COLUMN public.orders.amount_mzn IS 'DEPRECATED: replaced by gross_amount + currency';
COMMENT ON COLUMN public.withdrawals.amount_mzn IS 'DEPRECATED: replaced by amount + currency';