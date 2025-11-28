# 📮 Postman Collection Guide

Complete guide for using the Google Drive CDN Worker API with Postman.

## 🚀 Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the `POSTMAN_COLLECTION.json` file from the `docs/` folder
4. Click **Import**

### 2. Configure Variables

After importing, configure the collection variables:

1. Click on the **Google Drive CDN Worker API** collection
2. Go to the **Variables** tab
3. Set the following variables:

| Variable | Current Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `https://your-worker.workers.dev` | Your Cloudflare Worker URL |
| `apiToken` | `your-api-token-here` | Your API authentication token |

**Example:**
```
baseUrl: https://cdn-bengalart.darkwayrider.workers.dev
apiToken: abc123xyz456def789
```

### 3. Start Testing!

You're ready to make API requests. The collection includes:

- ✅ 8 pre-configured endpoints
- ✅ Authentication setup
- ✅ Example requests and responses
- ✅ Automatic variable management
- ✅ Test scripts for automation

---

## 📚 Available Endpoints

### Files Management

#### 1. **Upload File (Multipart)**
- **Method:** `POST /api/files`
- **Auth:** Required (Bearer Token or API Key)
- **Max Size:** 20MB
- **Use Case:** Upload small to medium files

**How to use:**
1. Select the request
2. Go to **Body** → **form-data**
3. Click **Select Files** for the `file` field
4. (Optional) Modify the `metadata` JSON
5. Click **Send**

**Auto-saved variables:**
- `fileId` - The uploaded file's ID
- `cdnUrl` - The public CDN URL

---

#### 2. **Initialize Resumable Upload**
- **Method:** `POST /api/uploads`
- **Auth:** Required
- **Use Case:** Upload large files (> 20MB)

**How to use:**
1. Modify the request body with your file details
2. Click **Send**
3. Use the returned `uploadUrl` to upload chunks

**Auto-saved variables:**
- `uploadUrl` - Google Drive upload URL
- `uploadId` - Upload session ID
- `fileId` - File ID for the upload

---

#### 3. **Get File Metadata**
- **Method:** `GET /api/files/{id}`
- **Auth:** Required
- **Use Case:** Retrieve file information

**How to use:**
1. The `{{fileId}}` variable is auto-populated after upload
2. Or manually replace `{{fileId}}` with your file ID
3. Click **Send**

---

#### 4. **Delete File**
- **Method:** `DELETE /api/files/{id}`
- **Auth:** Required
- **Use Case:** Remove files from Google Drive

**How to use:**
1. Ensure `{{fileId}}` is set
2. Click **Send**
3. Confirm deletion in the response

---

### Public Access

#### 5. **Access File (Public)**
- **Method:** `GET /files/{id}`
- **Auth:** Not required
- **Use Case:** Download or stream files publicly

**Features:**
- ✅ No authentication needed
- ✅ Supports Range requests
- ✅ Video streaming compatible

---

#### 6. **Get File Headers (HEAD)**
- **Method:** `HEAD /files/{id}`
- **Auth:** Not required
- **Use Case:** Check file metadata without downloading

---

### Dashboard & Statistics

#### 7. **Get Dashboard Summary**
- **Method:** `GET /api/dashboard/summary`
- **Auth:** Not required
- **Returns:** Stats, storage quota, file counts

---

#### 8. **List Files**
- **Method:** `GET /api/dashboard/files`
- **Auth:** Not required
- **Features:** Pagination, filtering, search

**Query Parameters:**
- `pageSize` - Files per page (default: 24)
- `pageToken` - Next page token
- `type` - Filter: `all`, `images`, `video`, `audio`, `documents`, `code`, `data`
- `search` - Search query

---

## 🔐 Authentication

The collection supports two authentication methods:

### Method 1: Bearer Token (Default)
```
Authorization: Bearer YOUR_API_TOKEN
```

This is configured at the collection level. All requests inherit this authentication.

### Method 2: API Key Header
```
x-api-key: YOUR_API_TOKEN
```

To use this method:
1. Go to request **Headers** tab
2. Add header: `x-api-key` with your token value

---

## 🎯 Example Workflows

### Workflow 1: Upload and Access File

1. **Upload File**
   - Use `POST /api/files`
   - Select your file
   - Send request
   - Note the `cdnUrl` in response

2. **Access File Publicly**
   - Copy the `cdnUrl` from previous response
   - Open in browser or use `GET /files/{id}`

3. **Get Metadata**
   - Use `GET /api/files/{id}` (fileId auto-populated)
   - View file details

4. **Delete File** (optional)
   - Use `DELETE /api/files/{id}`

---

### Workflow 2: Large File Upload

1. **Initialize Upload**
   - Use `POST /api/uploads`
   - Provide file metadata
   - Get `uploadUrl`

2. **Upload Chunks** (via cURL or custom script)
   ```bash
   curl -X PUT "{{uploadUrl}}" \
     -H "Content-Type: video/mp4" \
     -H "Content-Range: bytes 0-524287/104857600" \
     --data-binary @chunk1.bin
   ```

3. **Verify Upload**
   - Use `GET /api/files/{id}`
   - Check file status

---

### Workflow 3: Browse and Filter Files

1. **Get Dashboard Summary**
   - Use `GET /api/dashboard/summary`
   - View overall statistics

2. **List All Images**
   - Use `GET /api/dashboard/files?type=images`
   - Browse image files

3. **Search Files**
   - Use `GET /api/dashboard/files?search=vacation`
   - Find specific files

4. **Paginate Results**
   - Use `nextPageToken` from response
   - Add `pageToken` parameter for next page

---

## 🧪 Test Scripts

The collection includes automated test scripts:

### Upload File Test
```javascript
// Automatically saves file ID and CDN URL
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('fileId', response.data.id);
    pm.environment.set('cdnUrl', response.data.rawUrl);
}
```

### Global Test
```javascript
// Logs response time for all requests
console.log('Response time:', pm.response.responseTime, 'ms');
```

---

## 📊 Response Formats

### Success Response
```json
{
  "status": "success",
  "data": {
    "id": "1abc123xyz",
    "name": "example.jpg",
    "mimeType": "image/jpeg",
    "size": "524288",
    "rawUrl": "https://your-worker.workers.dev/files/1abc123xyz"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "payload_too_large",
    "message": "file exceeds 20971520 bytes, use /api/uploads"
  }
}
```

---

## 🛠️ Troubleshooting

### Issue: "Unauthorized" Error

**Solution:**
1. Check that `apiToken` variable is set correctly
2. Verify your token is valid
3. Ensure authentication is enabled for the request

---

### Issue: File Upload Fails

**Solution:**
1. Check file size (max 20MB for multipart)
2. Use resumable upload for larger files
3. Verify file field name is `file`

---

### Issue: Variables Not Auto-Populating

**Solution:**
1. Check the **Tests** tab for the request
2. Ensure test scripts are enabled
3. View Console (View → Show Postman Console)

---

## 🎨 Tips & Best Practices

### 1. Use Environments
Create different environments for development and production:

**Development Environment:**
```
baseUrl: http://localhost:8787
apiToken: dev-token-123
```

**Production Environment:**
```
baseUrl: https://cdn.example.com
apiToken: prod-token-xyz
```

### 2. Organize with Folders
The collection is already organized into folders:
- Files
- Public Files
- Dashboard
- Statistics

### 3. Save Example Responses
After making requests, save responses as examples:
1. Click **Save Response**
2. Click **Save as Example**
3. Name it descriptively

### 4. Use Collection Runner
Test multiple requests in sequence:
1. Click collection → **Run**
2. Select requests to run
3. Set iterations and delays
4. Click **Run Google Drive CDN Worker API**

### 5. Monitor API Performance
Use Postman Monitor to track:
- Response times
- Success rates
- Error patterns

---

## 📖 Additional Resources

- **API Documentation:** Visit `/docs` or `/swagger` on your worker
- **OpenAPI Spec:** `GET /api/openapi.json`
- **GitHub Repository:** [google-drive-cdn-worker](https://github.com/masum065/google-drive-cdn-worker)

---

## 🤝 Support

If you encounter issues:

1. Check the [README.md](../README.md) for setup instructions
2. Review the [OpenAPI specification](https://your-worker.workers.dev/api/openapi.json)
3. Open an issue on [GitHub](https://github.com/masum065/google-drive-cdn-worker/issues)

---

**Happy Testing! 🚀**
