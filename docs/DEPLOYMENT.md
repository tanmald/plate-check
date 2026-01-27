# Deployment Guide

PlateCheck is deployed to Vercel with Supabase backend integration. This guide covers both Supabase configuration and Vercel deployment.

## Prerequisites

- [Vercel account](https://vercel.com)
- [Supabase project](https://supabase.com)
- OpenAI API key (for GPT-4 Vision API)
- Git repository connected to Vercel

## Supabase Setup

### 1. Create Project

1. Sign up at [supabase.com](https://supabase.com) if you haven't already
2. Create a new project
3. Choose a project name and password
4. Select a region close to your users
5. Wait for project to initialize (~2 minutes)

### 2. Enable Email Authentication

1. Go to your Supabase Dashboard: `https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]`
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider and configure:
   - ✅ **Enable Email provider**: ON
   - ✅ **Confirm email**: ON (recommended for security)
   - ✅ **Secure email change**: ON (optional, adds extra security)
   - **Site URL**: Set to `http://localhost:8080` for development
   - **Redirect URLs**: Add:
     - `http://localhost:8080/auth/callback`
     - `http://localhost:8080/auth/reset-password`
     - `http://localhost:8080`
4. Click **Save**

### 3. Configure Email Templates

Navigate to **Authentication** → **Email Templates** and customize:

#### Confirm Signup Template

**Subject:** `Confirm your PlateCheck account`

**Body:**
```html
<h2>Welcome to PlateCheck!</h2>

<p>Hi there,</p>

<p>Thanks for signing up for PlateCheck - the easiest way to know whether you're following your nutrition plan.</p>

<p>Click the link below to confirm your email address and get started:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't sign up for PlateCheck, you can safely ignore this email.</p>

<p>Best,<br>PlateCheck Team</p>
```

#### Reset Password Template

**Subject:** `Reset your PlateCheck password`

**Body:**
```html
<h2>Reset your password</h2>

<p>Hi there,</p>

<p>We received a request to reset your PlateCheck password.</p>

<p>Click the link below to set a new password:</p>

<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>

<p>Best,<br>PlateCheck Team</p>
```

### 4. Authentication Settings

Navigate to **Authentication** → **Settings**:

- **JWT expiry**: 3600 seconds (1 hour) - default is fine
- **Refresh token rotation**: Enabled (recommended)
- **Minimum password length**: 8 characters
- **Password requirements**: Consider "Lower + upper letters + digits"

### 5. Database Schema

PlateCheck uses these tables (migrations are in `/supabase/migrations/`):

- `user_profiles` - User profile information
- `nutrition_plans` - Uploaded nutrition plans
- `meal_templates` - Meal templates from plans
- `meal_logs` - Logged meals with AI analysis
- `daily_progress` - Daily adherence scores
- `weekly_progress` - Weekly aggregations

To apply migrations:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref [YOUR_PROJECT_ID]

# Run migrations
supabase db push
```

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **New Project**
3. Import your GitHub repository (`tanmald/plate-check`)
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Configure Environment Variables

Add these environment variables in Vercel Project Settings → Environment Variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://[YOUR_PROJECT_ID].supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` | Supabase anon/public key |
| `VITE_OPENAI_API_KEY` | `sk-proj-...` | OpenAI API key for GPT-4 Vision |

**How to find Supabase credentials:**
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy **Project URL** (for `VITE_SUPABASE_URL`)
4. Copy **anon public** key (for `VITE_SUPABASE_PUBLISHABLE_KEY`)

**Important:**
- Check **Production**, **Preview**, and **Development** for all variables
- The `VITE_` prefix is required for Vite to expose env vars to the browser
- These are public keys (safe to expose in client-side code)

### 3. Update Supabase URLs for Production

After deploying, update Supabase authentication URLs:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update:
   - **Site URL**: `https://platecheck.vercel.app` (your Vercel URL)
   - **Redirect URLs**:
     - `https://platecheck.vercel.app/auth/callback`
     - `https://platecheck.vercel.app/auth/reset-password`
     - `https://platecheck.vercel.app`

### 4. Deploy

1. **Automatic deployment:**
   - Push changes to your `main` branch
   - Vercel automatically deploys

2. **Manual deployment:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

### 5. Verify Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://platecheck.vercel.app`)
2. Test sign-up flow with a real email
3. Verify email confirmation works
4. Test sign-in
5. Try test user: `test@platecheck.app` (any password)

## Environment Variables Reference

### Required Variables

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase public/anon key

### Optional Variables

- `VITE_OPENAI_API_KEY` - OpenAI API key (for production meal analysis)
- `VITE_APP_ENV` - Environment identifier (`development`, `staging`, `production`)

## Troubleshooting

### Blank Page on Production

**Symptom:** Visiting your Vercel URL shows a blank page

**Solution:**
1. Check that environment variables are set in Vercel
2. Go to **Deployments** tab
3. Click three dots (`...`) on latest deployment → **Redeploy**
4. Uncheck "Use existing Build Cache"
5. Click **Redeploy**

### Authentication Not Working

**Symptom:** Users can't sign up or sign in

**Solutions:**
1. Verify Supabase **Site URL** matches your Vercel URL
2. Verify **Redirect URLs** include your Vercel domain
3. Check that `VITE_SUPABASE_*` variables are set in Vercel
4. Ensure email provider is enabled in Supabase Dashboard

### Environment Variables Not Taking Effect

**Cause:** Environment variables only affect **new builds**, not existing deployments

**Solution:**
1. After adding/changing env vars, you must **redeploy**
2. Push a new commit OR manually trigger redeploy in Vercel dashboard

## Post-Deployment

### Custom Domain (Optional)

1. Go to Vercel Project Settings → **Domains**
2. Add your custom domain
3. Configure DNS records as shown
4. Update Supabase URLs to match custom domain

### Monitoring

Vercel provides built-in analytics:
- Go to **Analytics** tab for page views and performance
- Use **Logs** tab for runtime logs and errors
- Enable Vercel Analytics SDK for detailed insights

### CI/CD

PlateCheck uses automatic deployments:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments
- Pull requests → Automatic preview URLs

## Local Development

To run PlateCheck locally:

```bash
# Clone repository
git clone https://github.com/tanmald/plate-check.git
cd plate-check

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# Start development server
npm run dev
# Open http://localhost:8080
```

## Security Considerations

### Environment Variables
- ✅ Never commit `.env` file to git (already in `.gitignore`)
- ✅ Supabase anon key is safe to expose client-side
- ⚠️ OpenAI API key should be used server-side in production (Supabase Edge Functions)

### Supabase RLS (Row Level Security)
- Ensure RLS policies are enabled on all tables
- Users can only access their own data
- Test user bypass only works in development mode

### Production Checklist
- [ ] Enable email confirmation
- [ ] Set strong password requirements
- [ ] Enable refresh token rotation
- [ ] Configure CORS properly in Supabase
- [ ] Set up rate limiting (Supabase Edge Functions)
- [ ] Review and test RLS policies
- [ ] Rotate credentials if exposed in git history

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or [Vercel documentation](https://vercel.com/docs).
