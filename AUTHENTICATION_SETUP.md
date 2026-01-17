# Authentication Setup - Dashboard Configuration

This guide covers the manual configuration steps you need to complete in the Supabase Dashboard.

## Part 1: Enable Email Authentication

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/phnygsbbvcixnxwrbdhx
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider
4. Click to configure:
   - ✅ **Enable Email provider**: ON
   - ✅ **Confirm email**: ON (recommended for security)
   - ✅ **Secure email change**: ON (optional, adds extra security)
   - **Site URL**: Set to `http://localhost:8080` for development (update to production URL later)
   - **Redirect URLs**: Add:
     - `http://localhost:8080/auth/callback`
     - `http://localhost:8080/auth/reset-password`
5. Click **Save**

## Part 2: Configure Email Templates

Navigate to **Authentication** → **Email Templates** and customize the templates:

### Confirm Signup Template

**Subject:**
```
Confirm your PlateCheck account
```

**Body (HTML):**
```html
<h2>Welcome to PlateCheck!</h2>

<p>Hi there,</p>

<p>Thanks for signing up for PlateCheck - the easiest way to know whether you're following your nutrition plan.</p>

<p>Click the link below to confirm your email address and get started:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't sign up for PlateCheck, you can safely ignore this email.</p>

<p>Best,<br>
PlateCheck Team</p>
```

### Magic Link Template (Optional)

**Subject:**
```
Your PlateCheck sign-in link
```

**Body (HTML):**
```html
<h2>Sign in to PlateCheck</h2>

<p>Hi there,</p>

<p>Click the link below to sign in to your PlateCheck account:</p>

<p><a href="{{ .ConfirmationURL }}">Sign in to PlateCheck</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this link, you can safely ignore this email.</p>

<p>Best,<br>
PlateCheck Team</p>
```

### Reset Password Template

**Subject:**
```
Reset your PlateCheck password
```

**Body (HTML):**
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

<p>Best,<br>
PlateCheck Team</p>
```

## Part 3: Additional Settings (Optional)

### Authentication Settings

Navigate to **Authentication** → **Settings**:

- **JWT expiry**: 3600 seconds (1 hour) - default is fine
- **Refresh token rotation**: Enabled (recommended)
- **Minimum password length**: 8 characters (recommended)
- **Password requirements**: Consider setting to "Lower + upper letters + digits"

### Site URL and Redirect URLs

Navigate to **Authentication** → **URL Configuration**:

**For Development:**
- **Site URL**: `http://localhost:8080`
- **Redirect URLs**:
  - `http://localhost:8080/auth/callback`
  - `http://localhost:8080/auth/reset-password`
  - `http://localhost:8080`

**For Production (update when deploying):**
- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**:
  - `https://yourdomain.com/auth/callback`
  - `https://yourdomain.com/auth/reset-password`
  - `https://yourdomain.com`

## Part 4: Test Authentication

After configuring the dashboard settings:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:8080/onboarding

3. Try signing up with a test email

4. Check your email for the confirmation link

5. Click the confirmation link to verify

6. Try signing in with your credentials

## Code Implementation (Already Done)

The following files have been created for you:

- ✅ `src/contexts/AuthContext.tsx` - Auth state management
- ✅ `src/hooks/use-auth.ts` - Auth hooks
- ✅ `src/components/ProtectedRoute.tsx` - Route protection
- ✅ `src/App.tsx` - Updated with AuthProvider and ProtectedRoute
- ✅ `src/lib/supabase.ts` - Supabase client

## Usage in Components

### Sign Up Example
```typescript
import { useAuth } from '@/hooks/use-auth';

function SignUpForm() {
  const { signUp } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await signUp(email, password);
      // Show success message
      toast.success('Check your email to confirm your account');
    } catch (error) {
      toast.error('Sign up failed');
    }
  };
}
```

### Sign In Example
```typescript
import { useAuth } from '@/hooks/use-auth';

function SignInForm() {
  const { signIn } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // Redirect happens automatically via ProtectedRoute
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };
}
```

### Sign Out Example
```typescript
import { useAuth } from '@/hooks/use-auth';

function SettingsPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to /onboarding happens automatically
    } catch (error) {
      toast.error('Sign out failed');
    }
  };
}
```

### Get Current User
```typescript
import { useAuth } from '@/hooks/use-auth';

function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Welcome, {user.email}</div>;
}
```

## Next Steps

1. Complete the dashboard configuration above
2. Update your Onboarding page to include sign-up/sign-in forms
3. Add sign-out functionality to Settings page
4. Test the complete auth flow
5. When deploying to production, update Site URL and Redirect URLs in dashboard
