# MoveUp Platform - Deployment Guide

## Deployment Overview

This guide covers deploying the MoveUp platform to production using Vercel with Supabase and Stripe.

## Pre-Deployment Checklist

- [ ] All environment variables configured locally and tested
- [ ] Database schema created and tested in Supabase
- [ ] Stripe account in production mode
- [ ] Admin user created (role='admin' in database)
- [ ] Test course created and verified
- [ ] Stripe webhook configured for production domain
- [ ] All pages tested locally with real data
- [ ] Mobile responsiveness verified

## Step 1: Prepare for Production

### 1.1 Environment Variables

Create production environment variables for Supabase:

```env
# Production Supabase (not development)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[production-service-role-key]

# Production Stripe (not test keys!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[production-publishable-key]
STRIPE_SECRET_KEY=[production-secret-key]
STRIPE_WEBHOOK_SECRET=[production-webhook-secret]

# Production redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://yourdomain.com
```

### 1.2 Database Preparation

1. **Backup Development Database** (if migrating)
   - Export data from development Supabase
   - Create migration scripts for any custom data

2. **Create Production Supabase Project**
   - Create new Supabase project in production region
   - Run database schema script (`001_create_tables.sql`)
   - Verify all tables and RLS policies created
   - Test authentication and basic queries

3. **Seed Production Database** (optional)
   - Add admin user(s)
   - Add 2-3 sample courses for demo
   - Create test enrollments if desired

### 1.3 Stripe Configuration

1. **Switch to Live Mode**
   - In Stripe Dashboard, switch from Test to Live mode
   - Get production API keys

2. **Configure Webhook**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook secret

3. **Create Payment Link (optional)**
   - For manual payment page testing

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository

```bash
# If not already connected
git remote add origin https://github.com/youruser/moveup-platform.git
git push -u origin main
```

### 2.2 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** (if not default)
   - **Build Command:** `npm run build` (or `pnpm build`)
   - **Output Directory:** `.next`

### 2.3 Add Environment Variables

In Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=[your-production-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-production-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-production-service-role-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-production-public-key]
STRIPE_SECRET_KEY=[your-production-secret-key]
STRIPE_WEBHOOK_SECRET=[your-production-webhook-secret]
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://yourdomain.com
```

- Select "Development" and "Production" for each variable as appropriate
- For `STRIPE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY`: Production only

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build completion
3. Check deployment logs for any errors
4. Get production URL (e.g., `https://moveup.vercel.app`)

## Step 3: Post-Deployment Configuration

### 3.1 Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Update webhook endpoint URL to production:
   - Old: `http://localhost:3000/api/webhooks/stripe`
   - New: `https://yourdomain.com/api/webhooks/stripe`
3. Verify webhook can reach endpoint
4. Update `STRIPE_WEBHOOK_SECRET` if changed

### 3.2 Update Supabase Redirect URLs

In Supabase Project Settings → Authentication → Redirect URLs:

Add:
- `https://yourdomain.com/`
- `https://yourdomain.com/auth/login`
- `https://yourdomain.com/dashboard`

### 3.3 Configure Custom Domain (Optional)

1. In Vercel Project Settings → Domains
2. Add custom domain (e.g., `moveup.vn`)
3. Update DNS records as shown
4. Wait for DNS propagation
5. Update all environment variables with new domain

### 3.4 Update OAuth Callbacks

If using social login (future feature):
- Update redirect URIs in Google Console
- Update redirect URIs in GitHub OAuth app
- Update URLs in environment variables

## Step 4: Testing Production

### 4.1 Core Functionality Testing

**Authentication:**
```
1. Visit production URL
2. Sign up with test email
3. Confirm email
4. Login
5. Access dashboard
6. Logout
```

**Courses:**
```
1. Browse courses page
2. View course details
3. Add course to cart
```

**Payment:**
```
1. Proceed to checkout
2. Enter test card: 4242 4242 4242 4242
3. Complete payment
4. Verify auto-enrollment
5. Check order in admin dashboard
```

**Learning:**
```
1. Access enrolled course
2. View lessons
3. Mark lesson complete
4. Complete all lessons
5. Verify certificate generation
```

**Admin:**
```
1. Login as admin user
2. Create test course
3. Add lessons
4. View analytics
5. Verify all admin functions
```

### 4.2 Performance Testing

- Check Core Web Vitals in Vercel Analytics
- Test page load speeds
- Verify database query performance
- Monitor API response times

### 4.3 Security Testing

- Verify HTTPS on all pages
- Test authentication redirects
- Verify RLS prevents unauthorized access
- Check Stripe webhook signature verification
- Test CORS headers

## Step 5: Monitoring & Maintenance

### 5.1 Set Up Monitoring

**Vercel Analytics:**
- Monitor deployment duration
- Track Web Vitals
- Monitor error rates
- Check uptime

**Supabase:**
- Monitor database size
- Track API usage
- Review auth logs
- Check realtime subscriptions

**Stripe:**
- Monitor payment success rate
- Track failed payments
- Review webhook logs
- Monitor disputes

### 5.2 Regular Maintenance

**Daily:**
- Check deployment status
- Monitor error logs
- Review failed payments

**Weekly:**
- Review analytics trends
- Check database performance
- Backup critical data
- Update dependencies if needed

**Monthly:**
- Full backup of database
- Review security logs
- Update SSL certificates
- Performance optimization

### 5.3 Scaling Considerations

As traffic grows:
- **Database:** Monitor connections, consider read replicas
- **API:** Monitor response times, add caching
- **Storage:** Monitor image storage, implement CDN
- **Payments:** Monitor Stripe API rate limits

## Step 6: Troubleshooting Production Issues

### Issue: Redirect Loop on Login

**Solution:**
- Check `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` matches domain
- Verify redirect URL in Supabase Auth settings
- Clear browser cookies and retry

### Issue: Payments Not Processing

**Solution:**
- Check `STRIPE_SECRET_KEY` is correct
- Verify webhook endpoint is reachable
- Check webhook signature verification
- Review Stripe dashboard for errors

### Issue: Database Connection Errors

**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` and keys
- Verify Supabase project is running
- Check connection pool limits
- Review database logs

### Issue: 500 Errors on API Routes

**Solution:**
- Check Vercel function logs
- Verify all environment variables set
- Check database queries for errors
- Review application logs

### Issue: Slow Page Load

**Solution:**
- Check Core Web Vitals in Vercel Analytics
- Profile database queries
- Optimize images
- Enable caching headers
- Consider Next.js Image Optimization

## Step 7: Rollback Plan

If critical issues occur:

### Quick Rollback:
```bash
# In Vercel Dashboard → Deployments
# Select previous working deployment
# Click "Redeploy"
```

### Database Rollback:
- Stop accepting payments
- Restore from Supabase backup
- Verify data consistency

### Partial Rollback:
- Disable new features in env variables
- Rollback specific API routes
- Use feature flags for controlled rollout

## Post-Launch Improvements

### First Month:
1. Monitor user feedback
2. Track common issues
3. Optimize performance
4. Update documentation based on feedback

### First Quarter:
1. Implement analytics refinements
2. Add new course features based on usage
3. Optimize database indexes
4. Plan v1.1 features

### First Year:
1. Analyze business metrics
2. Plan scaling strategy
3. Implement advanced features
4. Consider additional integrations

## Support & Resources

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/docs
- **Stripe Support:** https://stripe.com/docs/support
- **GitHub Issues:** Track bugs and features

## Deployment Checklist Summary

- [ ] Environment variables configured
- [ ] Database ready in production
- [ ] Stripe in live mode
- [ ] GitHub connected to Vercel
- [ ] All env vars added to Vercel
- [ ] Deployment successful
- [ ] Stripe webhook updated
- [ ] Supabase redirect URLs updated
- [ ] Authentication flow tested
- [ ] Payment flow tested
- [ ] Admin dashboard tested
- [ ] Core Web Vitals checked
- [ ] Security verified
- [ ] Monitoring configured
- [ ] Rollback plan documented

---

**Estimated Deployment Time:** 2-3 hours
**Success Rate:** 95% if checklist followed
**Go-Live Confidence:** 🟢 High

**Last Updated:** February 2026
**Version:** 1.0.0

