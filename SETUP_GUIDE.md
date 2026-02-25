# MoveUp Platform - Complete Setup Guide

## Overview

The MoveUp platform is a premium online learning management system built with Next.js 16, Supabase, and Stripe. It includes complete course management, student enrollment, payment processing, and certificate generation.

## Project Structure

```
app/
├── page.tsx                          # Public homepage
├── courses/
│   ├── page.tsx                     # Course catalog
│   └── [id]/page.tsx               # Course detail page
├── cart/page.tsx                    # Shopping cart
├── checkout/[orderId]/page.tsx      # Checkout page
├── payment-success/[orderId]/page.tsx
├── auth/
│   ├── login/page.tsx              # Login page
│   ├── sign-up/page.tsx            # Sign up page
│   ├── sign-up-success/page.tsx
│   └── error/page.tsx
├── dashboard/page.tsx              # Student dashboard (protected)
├── learn/[courseId]/page.tsx      # Lesson player (protected)
├── certificates/page.tsx           # Certificate gallery (protected)
├── admin/
│   ├── page.tsx                    # Admin dashboard
│   ├── courses/page.tsx            # Manage courses
│   ├── students/page.tsx           # Manage students
│   ├── orders/page.tsx             # Manage orders
│   └── certificates/page.tsx       # Manage certificates
├── api/
│   ├── payments/create-intent/route.ts      # Stripe payment intent
│   ├── webhooks/stripe/route.ts             # Stripe webhook
│   └── lessons/complete/route.ts            # Mark lesson complete
└── layout.tsx                       # Root layout

lib/
├── supabase/
│   ├── client.ts                   # Browser Supabase client
│   ├── server.ts                   # Server Supabase client
│   └── proxy.ts                    # Session proxy
├── auth-actions.ts                 # Auth helper functions
├── stripe.ts                       # Stripe utilities
└── certificates.ts                # Certificate generation

scripts/
└── 001_create_tables.sql          # Database schema
```

## Database Schema

The platform uses 9 Supabase tables:

1. **profiles** - User profiles with role (student/instructor/admin)
2. **courses** - Course catalog
3. **lessons** - Individual lessons within courses
4. **enrollments** - Student course enrollments
5. **lesson_progress** - Track lesson completion per student
6. **cart_items** - Shopping cart
7. **orders** - Purchase orders
8. **order_items** - Items in each order
9. **certificates** - Generated certificates

## Setup Steps

### 1. Environment Variables

Add these to your `.env.local`:

```
# Supabase (provided automatically)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# For development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

### 2. Database Setup

**In Supabase SQL Editor:**

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy and paste the contents of `/scripts/001_create_tables.sql`
5. Run the query

This creates all tables, indexes, Row Level Security policies, and the auto-profile trigger.

### 3. Authentication Setup

The platform uses Supabase Auth with email/password. Users can:
- Sign up at `/auth/sign-up`
- Confirm email (email sent automatically)
- Login at `/auth/login`
- Access protected routes after authentication

### 4. Admin Setup

To create an admin user:

1. Sign up a user account via `/auth/sign-up`
2. In Supabase, go to your `profiles` table
3. Find the user and set `role = 'admin'`
4. Access admin panel at `/admin`

### 5. Stripe Integration

1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` to env
3. Create webhook endpoint:
   - In Stripe Dashboard → Webhooks
   - Create endpoint: `https://yoursite.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Key Features

### For Students
- Browse course catalog
- Add courses to shopping cart
- Checkout with Stripe payment
- Auto-enrollment after payment
- Watch video lessons
- Track progress per lesson
- View completion percentage
- Download certificates

### For Instructors
- Create and manage courses
- Add lessons with videos
- View student enrollments
- Track completion rates

### For Admins
- Full course management
- Student management
- Order tracking
- Certificate management
- Sales analytics
- Revenue reports

## Important Notes

### Row Level Security (RLS)
All tables use RLS policies to ensure users can only:
- View/edit their own profiles
- View published courses
- View/track their own enrollments
- View/download their own certificates
- See their own orders

### Authentication Flow
1. User signs up → email confirmation sent
2. User confirms email → session created
3. Middleware checks auth on protected routes
4. Redirects to login if not authenticated

### Payment Flow
1. User adds courses to cart
2. Proceeds to checkout
3. Stripe payment intent created
4. Payment processed
5. Webhook confirms payment
6. Auto-enrollment to course
7. Redirect to success page

### Certificate Generation
1. Student completes all lessons (100% progress)
2. Certificate auto-generated on completion
3. Student views in `/certificates`
4. Can download and share

## Testing

### Test Stripe Payments
Use Stripe test card: `4242 4242 4242 4242`
- Any expiry date in future
- Any 3-digit CVC

### Test Admin Features
1. Create admin user (role='admin')
2. Navigate to `/admin`
3. Create test course
4. Add test lessons
5. View student enrollments

## Troubleshooting

### Hydration Mismatch Errors
- Caused by client-side state in server components
- Header component was fixed by removing scroll state
- Ensure all pages use 'use client' if they have state/effects

### Authentication Not Working
- Check SUPABASE_URL and ANON_KEY in env
- Ensure database schema is created
- Check middleware.ts is in project root
- Verify Supabase Auth enabled in project

### Stripe Payment Fails
- Check API keys are correct
- Ensure webhook endpoint is reachable
- Check webhook secret matches env var
- Monitor Stripe dashboard for errors

### Database Queries Return Empty
- Ensure RLS policies allow access
- Check user is authenticated
- Verify user_id matches in table
- Check policy conditions

## Deployment

When deploying to Vercel:

1. Add all environment variables in Vercel project settings
2. Set up production Stripe keys
3. Update webhook URL to production domain
4. Deploy database to production Supabase project
5. Test entire flow end-to-end

## API Endpoints

- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/lessons/complete` - Mark lesson complete

## Support

For issues or questions:
- Check Supabase logs in dashboard
- Check Stripe webhook logs
- Review browser console for errors
- Check server logs for API errors

---

**Last Updated:** February 2026
**Version:** 1.0.0
