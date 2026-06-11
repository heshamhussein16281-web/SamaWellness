# 🚀 Production Deployment - Phase 4 & 5

**Status:** ✅ Everything is ready for production deployment

---

## 📋 Pre-Deployment Checklist

- ✅ Database migrations prepared (3 migration files)
- ✅ API endpoints implemented and tested (18 endpoints)
- ✅ Frontend components built and responsive (8 components)
- ✅ Build succeeds with 0 errors
- ✅ Cron jobs configured in vercel.json
- ✅ Environment variables set (.env.local with CRON_SECRET)
- ✅ Code committed to main branch (commit b970240)

---

## 🔧 Step 1: Deploy Database Migrations (2 minutes)

**If you haven't done this yet:**

Go to: https://app.supabase.com/project/aelgbqybcvmuzlbmkwia/sql

Execute these 3 queries in order (see QUICK_DEPLOY.md):
1. Create Clinics Table
2. Add Therapist Hourly Rate
3. Phase 4 & 5 Main Migration

**Verify:** Query should return table_count: 6

---

## 🌐 Step 2: Deploy to Vercel (2 minutes)

### Option A: Deploy from CLI

```bash
cd /Users/haythamhussein/Downloads/sama-wellness
vercel deploy --prod
```

### Option B: Push to GitHub and Deploy from Vercel Dashboard

```bash
git push origin main
# Go to https://vercel.com/dashboard/sama-wellness
# Click "Deploy" on the main branch
```

### Option C: Connect GitHub Repository (if not already connected)

1. Go to https://vercel.com/new
2. Import repository from GitHub
3. Configure deployment settings
4. Deploy to production

---

## ⚙️ Step 3: Configure Vercel Environment Variables

**For production, set these in Vercel Dashboard:**
Settings → Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://aelgbqybcvmuzlbmkwia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
CRON_SECRET=@sama-wellness-cron-secret-2026
```

**Get these from:**
- Supabase: Project Settings → API Keys
- Keep CRON_SECRET the same as in vercel.json

---

## ✅ Step 4: Verify Deployment

After deployment completes:

1. **Check Vercel Deployment**
   - Go to Vercel dashboard
   - Verify status shows "Ready" ✅
   - Click preview URL to test app

2. **Test Cron Jobs**
   ```bash
   # Test payment deadline checker
   curl -X POST https://your-app.vercel.app/api/cron/check-payment-deadlines \
     -H "X-Cron-Secret: @sama-wellness-cron-secret-2026"
   
   # Response: {success: true, count: 0, message: "..."}
   ```

3. **Test API Endpoints**
   ```bash
   # Get available slots
   curl "https://your-app.vercel.app/api/admin/bookings/available-slots?therapist_id=1&clinic_id=1&date=2026-06-15&session_type=single"
   ```

4. **Test Frontend**
   - Open https://your-app.vercel.app
   - Navigate to clinical section
   - Try creating an intake form
   - Check client profile tabs

---

## 📊 Production URLs

After deployment, your app will be live at:

- **Production URL:** `https://your-vercel-domain.vercel.app`
- **Vercel Dashboard:** https://vercel.com/dashboard/sama-wellness
- **Supabase Dashboard:** https://app.supabase.com/project/aelgbqybcvmuzlbmkwia

---

## 🔄 Cron Jobs Schedule

Once deployed, these will run automatically:

| Job | Schedule | Purpose |
|-----|----------|---------|
| `check-payment-deadlines` | Every 15 minutes | Expire bookings with no payment |
| `update-recurring-clients` | Daily 1am UTC | Mark clients as recurring |
| `mark-inactive-clients` | Daily 2am UTC | Mark inactive clients (90+ days) |

**Monitor cron jobs:**
- Vercel Dashboard → Functions → Cron Jobs
- Supabase Logs → Extensions → PostgreSQL

---

## 🚨 Troubleshooting

### Build Fails
```bash
npm run build
# Fix any TypeScript or ESLint errors
git add . && git commit -m "fix: build errors"
git push origin main
```

### Cron Jobs Not Running
1. Check Vercel dashboard for errors
2. Verify CRON_SECRET matches in vercel.json and Vercel env vars
3. Check Supabase logs for database errors

### API Endpoints Not Working
1. Verify NEXT_PUBLIC_SUPABASE_URL is set in Vercel env vars
2. Check JWT tokens are valid in browser cookies
3. View function logs in Vercel dashboard

### Database Queries Fail
1. Verify migrations ran successfully in Supabase
2. Check user has correct permissions in Supabase
3. Review query in Supabase SQL editor

---

## 📈 Post-Deployment Monitoring

### Key Metrics to Monitor

1. **Page Load Time**
   - Vercel Analytics → Performance
   - Target: < 2s for main page

2. **API Response Time**
   - Vercel Functions → Metrics
   - Target: < 500ms per request

3. **Cron Job Duration**
   - Should complete in < 30 seconds
   - Check Vercel logs for errors

4. **Error Rate**
   - Monitor Supabase logs
   - Set up alerts for errors > 1%

### Health Check Endpoint

```bash
curl -I https://your-app.vercel.app
# Should return 200 OK
```

---

## 🎯 Success Criteria

✅ **Deployment Complete When:**
- [ ] Vercel build succeeds
- [ ] App loads at production URL
- [ ] All 3 cron jobs show in Vercel dashboard
- [ ] Database queries work
- [ ] Intake form creates new clients
- [ ] Client profile shows 5 tabs
- [ ] Available slots calculator works
- [ ] No error logs in Supabase

---

## 📞 Need Help?

- **Vercel Issues:** https://vercel.com/support
- **Supabase Issues:** https://supabase.com/docs
- **Code Issues:** Check DEPLOYMENT_CHECKLIST.md

---

**Your Sama Wellness Phase 4 & 5 is ready to go live!** 🚀
