# 🔐 API Key Setup এবং Security Guide

## 📍 API Key কোথায় পাবেন?

API key আপনাকে **নিজেই তৈরি করতে হবে**। এটা একটা secret password যা শুধুমাত্র আপনি জানবেন।

### ✅ Step 1: Secure API Key তৈরি করুন

একটা strong, random API key generate করুন:

#### Option 1: Terminal দিয়ে (সবচেয়ে secure)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output Example:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

#### Option 2: Online Generator (সাবধানে ব্যবহার করুন)
- [RandomKeygen.com](https://randomkeygen.com/)
- "Fort Knox Passwords" section থেকে একটা নিন

#### Option 3: নিজে তৈরি করুন
- কমপক্ষে 32 characters লম্বা
- Letters, numbers, এবং special characters মিক্স করুন
- Example: `MyS3cur3T0k3n_2024_XyZ!@#$%`

---

## 🛠️ Step 2: API Key Configure করুন

### Local Development এর জন্য:

আপনার `wrangler.toml` file এ:

```toml
[vars]
API_TOKENS = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

### Production Deployment এর জন্য:

Cloudflare Dashboard থেকে set করুন (আরো secure):

```bash
# Cloudflare Dashboard > Workers > Your Worker > Settings > Variables
# Add environment variable:
# Name: API_TOKENS
# Value: your-secret-key
```

অথবা Wrangler CLI দিয়ে:

```bash
wrangler secret put API_TOKENS
# Prompt আসবে, আপনার key paste করুন
```

---

## 🔒 Multiple API Keys (Optional)

একাধিক API key ব্যবহার করতে চাইলে comma দিয়ে আলাদা করুন:

```toml
API_TOKENS = "key1-for-app1,key2-for-app2,key3-for-testing"
```

**Use Cases:**
- ✅ Different apps এর জন্য আলাদা key
- ✅ Team members দের জন্য আলাদা key
- ✅ Testing এবং production এর জন্য আলাদা key

---

## 📮 Postman এ API Key ব্যবহার করুন

### Method 1: Bearer Token (Recommended)

1. Postman collection খুলুন
2. **Variables** tab এ যান
3. `apiToken` variable এ আপনার key set করুন:
   ```
   apiToken: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

সব requests automatically এই header পাঠাবে:
```
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Method 2: x-api-key Header

Request এর **Headers** tab এ:
```
x-api-key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## ⚠️ API Key Expose হলে কি সমস্যা?

### 🚨 বড় সমস্যা হবে! কারণ:

1. **Unauthorized Access**
   - যে কেউ আপনার Google Drive এ file upload করতে পারবে
   - আপনার storage ভরে যাবে
   - Malicious files upload হতে পারে

2. **Cost Issues**
   - Cloudflare Workers এর free tier শেষ হয়ে যেতে পারে
   - Google Drive quota শেষ হয়ে যাবে

3. **Security Breach**
   - Spam/malware files upload হতে পারে
   - আপনার CDN abuse হতে পারে
   - Legal issues হতে পারে

4. **Data Loss**
   - কেউ আপনার files delete করতে পারবে
   - Important data হারিয়ে যেতে পারে

---

## 🛡️ Security Best Practices

### ✅ DO (করবেন):

1. **Strong API Key ব্যবহার করুন**
   - কমপক্ষে 32 characters
   - Random generated

2. **Secret রাখুন**
   - GitHub এ commit করবেন না
   - Public places এ share করবেন না
   - Environment variables ব্যবহার করুন

3. **Regular Rotation**
   - প্রতি 3-6 মাসে key change করুন
   - Suspicious activity দেখলে তৎক্ষণাৎ change করুন

4. **Monitor Usage**
   - `/api/stats` endpoint check করুন
   - Unusual uploads দেখুন
   - Cloudflare Analytics দেখুন

5. **Use .gitignore**
   - `wrangler.toml` gitignore করুন
   - শুধু `wrangler.toml.example` commit করুন

### ❌ DON'T (করবেন না):

1. ❌ GitHub এ API key commit করবেন না
2. ❌ Public forums এ share করবেন না
3. ❌ Simple/predictable keys ব্যবহার করবেন না (যেমন: `123456`, `password`)
4. ❌ Same key সব জায়গায় ব্যবহার করবেন না
5. ❌ Frontend code এ hardcode করবেন না

---

## 🔍 Cross-Check: অন্য কেউ POST করতে পারবে কিনা?

### ✅ সঠিক Setup থাকলে:

**না, পারবে না!** কারণ:

1. **Authentication Required**
   ```javascript
   // worker-api.js এ check করা হয়
   if (!isAuthorized(request, config.API_TOKENS)) {
       return errorResponse('unauthorized', 'API key required', 401);
   }
   ```

2. **Public Endpoints (শুধু এগুলো)**
   - `GET /files/{id}` - File download (read-only)
   - `HEAD /files/{id}` - File headers
   - `GET /api/stats` - Statistics
   - `GET /api/dashboard/summary` - Dashboard data
   - `GET /api/dashboard/files` - File listing

3. **Protected Endpoints (API key লাগবে)**
   - `POST /api/files` - File upload ⚠️
   - `POST /api/uploads` - Resumable upload ⚠️
   - `DELETE /api/files/{id}` - File delete ⚠️
   - `GET /api/files/{id}` - File metadata ⚠️

### 🧪 Test করুন:

```bash
# Without API Key - হবে না ❌
curl -X POST https://your-worker.workers.dev/api/files \
  -F "file=@test.jpg"

# Response:
# {
#   "status": "error",
#   "error": {
#     "code": "unauthorized",
#     "message": "API key required. Use Authorization: Bearer <token> or x-api-key header."
#   }
# }

# With API Key - হবে ✅
curl -X POST https://your-worker.workers.dev/api/files \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@test.jpg"
```

---

## 🔐 Additional Security Measures

### 1. IP Whitelisting (Advanced)

Cloudflare Workers এ IP restriction add করতে পারেন:

```javascript
// worker-api.js এ add করুন
const ALLOWED_IPS = ['203.0.113.1', '198.51.100.1'];

if (!ALLOWED_IPS.includes(request.headers.get('CF-Connecting-IP'))) {
    return errorResponse('forbidden', 'IP not allowed', 403);
}
```

### 2. Rate Limiting

Cloudflare Dashboard থেকে rate limiting enable করুন:
- Settings > Security > Rate Limiting
- Example: 100 requests per minute per IP

### 3. CORS Configuration

শুধু specific domains থেকে access allow করুন:

```javascript
// worker-api.js এ modify করুন
const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://yourdomain.com', // শুধু আপনার domain
    // বর্তমানে '*' আছে - সব domain থেকে access করা যায়
};
```

---

## 📊 Monitoring এবং Alerts

### Cloudflare Analytics দেখুন:

1. **Workers Dashboard** > Your Worker > **Analytics**
2. Check করুন:
   - Request count
   - Error rates
   - Response times
   - Geographic distribution

### Suspicious Activity Signs:

⚠️ এগুলো দেখলে সতর্ক হন:
- Sudden spike in uploads
- Unusual file sizes
- Unknown geographic locations
- High error rates (401/403)
- Midnight uploads (যদি আপনি না করেন)

---

## 🆘 API Key Compromised হলে কি করবেন?

### Immediate Actions:

1. **নতুন API Key তৈরি করুন**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Cloudflare এ update করুন**
   ```bash
   wrangler secret put API_TOKENS
   # নতুন key paste করুন
   ```

3. **Deploy করুন**
   ```bash
   npm run deploy
   ```

4. **Postman collection update করুন**
   - Variables tab > `apiToken` > নতুন key

5. **Check করুন**
   - `/api/stats` দেখুন
   - Unauthorized files delete করুন
   - Analytics check করুন

---

## 📝 Quick Reference

### API Key তৈরি:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Set করুন (Local):
```toml
# wrangler.toml
API_TOKENS = "your-generated-key"
```

### Set করুন (Production):
```bash
wrangler secret put API_TOKENS
```

### Use করুন (Postman):
```
Authorization: Bearer your-generated-key
```

### Test করুন:
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
  https://your-worker.workers.dev/api/stats
```

---

## ✅ Checklist

- [ ] Strong API key তৈরি করেছি (32+ characters)
- [ ] `wrangler.toml` এ set করেছি
- [ ] Production এ secret হিসেবে deploy করেছি
- [ ] Postman collection এ configure করেছি
- [ ] Test করে দেখেছি কাজ করছে
- [ ] `.gitignore` এ `wrangler.toml` আছে
- [ ] Backup নিয়ে রেখেছি (secure location এ)
- [ ] Team members দের share করেছি (যদি দরকার হয়)

---

**🔒 Remember: API Key হলো আপনার CDN এর চাবি। এটা যত্নে রাখুন!**
