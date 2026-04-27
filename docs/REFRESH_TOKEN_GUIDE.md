# How to Generate New Google Drive OAuth Refresh Token

## Step-by-Step Guide

### 1. Open Google OAuth 2.0 Playground

Visit: https://developers.google.com/oauthplayground/

### 2. Configure OAuth Settings

Click the **⚙️ Settings icon** (top right) and:

1. ✅ Check **"Use your own OAuth credentials"**
2. Enter your credentials:
   - **OAuth Client ID:** `YOUR_CLIENT_ID`
   - **OAuth Client Secret:** `YOUR_CLIENT_SECRET`
3. Click **Close**

### 3. Select Google Drive API Scope

In **Step 1** (Select & authorize APIs):

1. Find **"Drive API v3"** in the list
2. Expand it
3. Select: `https://www.googleapis.com/auth/drive`
4. Click **"Authorize APIs"** button

### 4. Authorize Access

1. Google will ask you to sign in
2. Choose your Google account
3. Click **"Allow"** to grant permissions
4. You'll be redirected back to OAuth Playground

### 5. Exchange Authorization Code

In **Step 2** (Exchange authorization code for tokens):

1. Click **"Exchange authorization code for tokens"** button
2. You'll see the response with:
   - `access_token`
   - **`refresh_token`** ← This is what you need!

### 6. Copy the Refresh Token

Copy the **refresh_token** value (it looks like: `1//0gXXXXXXXXXXXXXXX...`)

---

## Update Cloudflare Worker

### Option A: Using Wrangler CLI

```bash
cd /Users/user/Desktop/inside-mine/Google-drive-cdn-worker

# Set the refresh token as a secret
npx wrangler secret put GOOGLE_REFRESH_TOKEN
# Paste the refresh token when prompted

# Also set client ID and secret if not already set
npx wrangler secret put GOOGLE_CLIENT_ID
# Paste your Client ID

npx wrangler secret put GOOGLE_CLIENT_SECRET
# Paste your Client Secret
```

### Option B: Using Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Select your account
3. Go to **Workers & Pages**
4. Click on **cdn-bengalart**
5. Go to **Settings** → **Variables**
6. Add/Update these secrets:
   - `GOOGLE_CLIENT_ID`: `YOUR_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`: `YOUR_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`: `[your new refresh token]`

---

## Deploy Worker

```bash
npm run deploy
```

---

## Test the Fix

```bash
# Test file upload
curl -X POST https://your-worker-url.workers.dev/api/files \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "file=@README.md"

# Should return success with file ID and URL
```

---

## Important Notes

⚠️ **Security:**
- Never commit `credentials.json` to git (already in `.gitignore`)
- Store secrets in Cloudflare, not in code
- Refresh tokens don't expire unless revoked

✅ **After Fix:**
- File uploads will work
- Dashboard will load files
- All API endpoints will function normally

---

## Troubleshooting

**If refresh token generation fails:**
1. Make sure you're using the correct Google account
2. Verify OAuth credentials are correct
3. Check that Google Drive API is enabled in your project

**If worker still fails after update:**
1. Check Cloudflare Worker logs: `npx wrangler tail`
2. Verify all three secrets are set correctly
3. Redeploy the worker
