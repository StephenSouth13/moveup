# MoveUp Platform - Quick Start Checklist

## Pre-Launch Checklist

### 1. Environment Setup ✓
- [ ] Supabase project created and connected
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to env
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to env
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added to env
- [ ] Stripe account created
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` added to env
- [ ] `STRIPE_SECRET_KEY` added to env

### 2. Database Setup ✓
- [ ] Run `/scripts/001_create_tables.sql` in Supabase SQL Editor
- [ ] Verify all 9 tables created
- [ ] Verify RLS policies enabled
- [ ] Test user profile auto-creation with signup

### 3. Authentication Setup ✓
- [ ] Test sign up at `/auth/sign-up`
- [ ] Verify email confirmation works
- [ ] Test login at `/auth/login`
- [ ] Verify redirect to `/dashboard` after login
- [ ] Test logout functionality
- [ ] Verify unauthenticated users can't access `/dashboard`

### 4. Admin User Setup ✓
- [ ] Create test admin user via signup
- [ ] Set role='admin' in profiles table
- [ ] Access `/admin` dashboard
- [ ] Verify admin pages load correctly

### 5. Course Setup ✓
- [ ] Create 3-5 test courses in `/admin/courses`
- [ ] Add lessons to each course
- [ ] Add video URLs to lessons (can use placeholder URLs)
- [ ] Verify courses appear in `/courses` catalog
- [ ] Verify course details load at `/courses/[id]`

### 6. Stripe Integration ✓
- [ ] Add test mode API keys to env
- [ ] Set `STRIPE_WEBHOOK_SECRET` 
- [ ] Create Stripe webhook for `/api/webhooks/stripe`
- [ ] Test payment with card `4242 4242 4242 4242`
- [ ] Verify webhook logs show successful payment
- [ ] Verify student auto-enrolled after payment

### 7. Shopping Cart ✓
- [ ] Add course to cart at `/cart`
- [ ] Verify cart calculates total correctly
- [ ] Remove items from cart
- [ ] Proceed to checkout
- [ ] Verify order created

### 8. Learning Path ✓
- [ ] Complete a course purchase
- [ ] Access course in `/learn/[courseId]`
- [ ] Verify lesson player loads
- [ ] Mark lesson complete
- [ ] Check progress updates
- [ ] Complete all lessons
- [ ] Verify certificate auto-generates
- [ ] View certificate in `/certificates`

### 9. Admin Features ✓
- [ ] View all students in `/admin/students`
- [ ] View all orders in `/admin/orders`
- [ ] View certificates in `/admin/certificates`
- [ ] Test course publish/unpublish
- [ ] Test course edit/delete
- [ ] View sales analytics

### 10. Mobile Testing ✓
- [ ] Test homepage on mobile
- [ ] Test course catalog responsive
- [ ] Test login/signup on mobile
- [ ] Test dashboard on mobile
- [ ] Test lesson player on mobile
- [ ] Test checkout on mobile

## Known Limitations

- [ ] Images use placeholders (/course-1.jpg, etc) - replace with real course images
- [ ] Videos use placeholders - add real video URLs in lessons
- [ ] Admin users manually set in database - no admin invite system yet
- [ ] No email templates - uses Supabase defaults
- [ ] No payment history view for students yet
- [ ] No course progress export

## After Launch

- [ ] Monitor Supabase database usage
- [ ] Monitor Stripe payment logs
- [ ] Set up email templates in Supabase
- [ ] Replace placeholder course images
- [ ] Add real video content to lessons
- [ ] Set up analytics tracking
- [ ] Monitor performance metrics
- [ ] Plan v2 features (reviews, discussions, certificates with QR codes, etc)

## Rollback Plan

If issues occur:
- Disable Stripe payments in env
- Disable auth redirects temporarily
- Use read-only mode for courses
- Set maintenance flag

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Stripe Docs: https://stripe.com/docs
- React Docs: https://react.dev

---

**Estimated Setup Time:** 30-45 minutes
**Go Live Confidence:** 80%+ if all checklist items completed

