# 📁 Google Drive Folder ID Guide

## 🔍 Method 1: Browser থেকে Folder ID পাওয়া (সবচেয়ে সহজ)

### Step 1: Google Drive খুলুন
1. https://drive.google.com এ যান
2. আপনার `bengal-upload` folder খুঁজুন
3. Folder টিতে ক্লিক করুন

### Step 2: URL থেকে ID কপি করুন
Browser এর address bar এ URL দেখবেন:
```
https://drive.google.com/drive/folders/1ABC123xyz456DEF789
                                        ^^^^^^^^^^^^^^^^^^^
                                        এটাই Folder ID
```

**Example:**
```
URL: https://drive.google.com/drive/folders/1SELX_mb_H-ec3jbLsIHk1_urEBVwHm5C
Folder ID: 1SELX_mb_H-ec3jbLsIHk1_urEBVwHm5C
```

---

## 🔍 Method 2: API দিয়ে Folder খুঁজে বের করা

### Using cURL:
```bash
# List all folders
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://cdn-bengalart.darkwayrider.workers.dev/api/dashboard/files?type=all&search=bengal-upload"
```

### Response থেকে Folder ID পাবেন:
```json
{
  "files": [
    {
      "id": "1ABC123xyz456DEF789",  // এটাই Folder ID
      "name": "bengal-upload",
      "mimeType": "application/vnd.google-apps.folder"
    }
  ]
}
```

---

## 📮 Postman এ Folder ID ব্যবহার করা

### Single File Upload:

```json
{
  "name": "my-image.jpg",
  "description": "Uploaded via Postman",
  "parents": ["1ABC123xyz456DEF789"]  // আপনার folder ID এখানে
}
```

### Example Request:
```bash
curl -X POST https://cdn-bengalart.darkwayrider.workers.dev/api/files \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@image.jpg" \
  -F 'metadata={"name":"my-image.jpg","parents":["1ABC123xyz456DEF789"]}'
```

---

## 🎯 Common Folder IDs

আপনার current setup এ:

| Folder Name | Folder ID | Usage |
|-------------|-----------|-------|
| Root (Main Drive) | `root` | Default upload location |
| Upload Root | `1SELX_mb_H-ec3jbLsIHk1_urEBVwHm5C` | Your configured upload folder |
| bengal-upload | `???` | আপনার custom folder (খুঁজে বের করুন) |

---

## 🔧 Folder তৈরি করা (যদি না থাকে)

### Google Drive Web UI দিয়ে:
1. https://drive.google.com এ যান
2. **New** > **Folder** ক্লিক করুন
3. Name: `bengal-upload`
4. Create করুন
5. Folder খুলে URL থেকে ID কপি করুন

### API দিয়ে (Advanced):
```javascript
// This CDN worker doesn't support folder creation
// Use Google Drive API directly or create via web UI
```

---

## ✅ Verification

Folder ID সঠিক কিনা check করুন:

```bash
# Replace FOLDER_ID with your actual folder ID
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://cdn-bengalart.darkwayrider.workers.dev/api/files/FOLDER_ID
```

যদি সঠিক হয়, folder এর metadata পাবেন:
```json
{
  "status": "success",
  "data": {
    "id": "1ABC123xyz456DEF789",
    "name": "bengal-upload",
    "mimeType": "application/vnd.google-apps.folder"
  }
}
```

---

## 📝 Quick Reference

### Root folder এ upload:
```json
{"parents": ["root"]}
```

### Specific folder এ upload:
```json
{"parents": ["1ABC123xyz456DEF789"]}
```

### Multiple parent folders (Google Drive supports this):
```json
{"parents": ["1ABC123xyz", "1DEF456ghi"]}
```

---

**💡 Tip:** Folder ID একবার পেয়ে গেলে environment variable হিসেবে save করে রাখুন!
