# MoveUp Platform - Environment Setup Guide

## Required Environment Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Stripe Configuration (Payment Processing)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Setup Steps

### 1. Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Go to Project Settings → API
3. Copy the Project URL and anon key
4. Set these as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Database Setup
1. Go to Supabase SQL Editor
2. Run the migration script from `/scripts/001_create_tables.sql`
3. This will create all required tables with RLS policies

### 3. Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Go to Developers → API Keys
3. Copy Secret Key and Publishable Key
4. Set as `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Set up webhook in Stripe Dashboard:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Subscribe to: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret and set as `STRIPE_WEBHOOK_SECRET`

### 4. Admin User Setup
1. Create a Supabase auth user for admin
2. Go to Supabase → Database → profiles
3. Update the profile row to set `role = 'admin'`

## Database Schema

The platform includes 9 tables:
- **profiles**: User data and roles
- **courses**: Course information
- **lessons**: Individual course lessons
- **enrollments**: Student course enrollments
- **lesson_progress**: Student progress on lessons
- **cart_items**: Shopping cart
- **orders**: Purchase orders
- **order_items**: Items in orders
- **certificates**: Completion certificates

## Testing

### Test User Credentials
- Create test account via `/auth/sign-up`
- Login at `/auth/login`
- Dashboard available at `/dashboard`

### Test Admin Panel
- Use admin account (set role='admin' in database)
- Access at `/admin`
- Manage courses, students, and orders

### Test Payment Flow
1. Add course to cart
2. Checkout
3. Use Stripe test card: 4242 4242 4242 4242
4. Any future expiry and any 3-digit CVC

## Production Considerations

1. **Email Confirmation**: Enable in Supabase to require email verification
2. **RLS Policies**: Review and customize based on security needs
3. **Webhook Security**: Always verify webhook signatures
4. **Rate Limiting**: Implement for API routes
5. **CORS**: Configure for your domain
6. **Payment**: Use Stripe payment elements for better UX
7. **SSL/TLS**: Ensure all HTTPS in production
