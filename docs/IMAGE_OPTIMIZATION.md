# 🖼️ Automatic Image Optimization

## Overview

Your CDN Worker now automatically optimizes images during upload! Images are compressed, resized, and converted to AVIF format for maximum performance and storage efficiency.

---

## ✨ Features

- ✅ **Automatic Detection** - Images are automatically detected and optimized
- ✅ **AVIF Conversion** - All images converted to modern AVIF format
- ✅ **Smart Resizing** - Max width 1920px (maintains aspect ratio)
- ✅ **Size Reduction** - Typically 60-80% smaller file sizes
- ✅ **Quality Preservation** - Visually identical to original (Quality: 70)
- ✅ **Timeout Protection** - 10-second timeout prevents worker hangs
- ✅ **Graceful Fallback** - Original file uploaded if optimization fails
- ✅ **Detailed Logging** - Console logs show optimization statistics

---

## 🎯 How It Works

### Automatic Optimization

When you upload an image via `POST /api/files`:

1. **Detection**: Worker checks if file is an image
2. **Size Check**: Only images < 5MB are optimized
3. **Optimization**: Image is resized and converted to AVIF
4. **Upload**: Optimized image is uploaded to Google Drive
5. **Response**: You receive optimization statistics

### What Gets Optimized?

**✅ Optimized:**
- JPEG images (`.jpg`, `.jpeg`)
- PNG images (`.png`)
- WebP images (`.webp`)
- Files under 5MB

**❌ Not Optimized:**
- Images already in AVIF format
- Images larger than 5MB
- Non-image files (videos, documents, etc.)
- GIF animations (to preserve animation)

---

## 📊 Optimization Settings

| Setting | Value | Description |
|---------|-------|-------------|
| **Max Width** | 1920px | Images wider than this are resized |
| **Format** | AVIF | Modern, efficient image format |
| **Quality** | 70 | Excellent visual quality |
| **Size Threshold** | 5MB | Only files under this size are optimized |
| **Timeout** | 10 seconds | Maximum processing time |

---

## 🚀 Usage Examples

### Example 1: Upload Image (Automatic Optimization)

```bash
curl -X POST https://cdn-bengalart.darkwayrider.workers.dev/api/files \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "file=@photo.jpg" \
  -F 'metadata={"name":"photo.jpg"}'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "1ABC123xyz",
    "name": "photo.avif",
    "mimeType": "image/avif",
    "size": "245678",
    "rawUrl": "https://cdn.bengalart.click/files/1ABC123xyz",
    "optimization": {
      "applied": true,
      "originalSize": 1234567,
      "optimizedSize": 245678,
      "savings": "80.1",
      "processingTime": 2345
    }
  }
}
```

**Notice:**
- ✅ Filename changed from `photo.jpg` → `photo.avif`
- ✅ MimeType changed to `image/avif`
- ✅ Size reduced by 80.1%
- ✅ Processing took 2.3 seconds

---

### Example 2: Upload Large Image (No Optimization)

```bash
curl -X POST https://cdn-bengalart.darkwayrider.workers.dev/api/files \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "file=@large-photo.jpg" \
  -F 'metadata={"name":"large-photo.jpg"}'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "1XYZ789abc",
    "name": "large-photo.jpg",
    "mimeType": "image/jpeg",
    "size": "8234567",
    "rawUrl": "https://cdn.bengalart.click/files/1XYZ789abc"
  }
}
```

**Notice:**
- ✅ Original format preserved (too large to optimize)
- ✅ No `optimization` field in response
- ✅ Console logs: "Skipped: large-photo.jpg (7.85 MB) - exceeds 5.00 MB threshold"

---

### Example 3: Upload Non-Image File

```bash
curl -X POST https://cdn-bengalart.darkwayrider.workers.dev/api/files \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -F "file=@document.pdf" \
  -F 'metadata={"name":"document.pdf"}'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "1DEF456ghi",
    "name": "document.pdf",
    "mimeType": "application/pdf",
    "size": "123456",
    "rawUrl": "https://cdn.bengalart.click/files/1DEF456ghi"
  }
}
```

**Notice:**
- ✅ Original format preserved (not an image)
- ✅ No optimization applied

---

## 📈 Before & After Examples

### JPEG Photo
```
Before:  photo.jpg      2.5 MB  (JPEG)
After:   photo.avif     450 KB  (AVIF)
Savings: 82% smaller
```

### PNG Screenshot
```
Before:  screenshot.png  1.8 MB  (PNG)
After:   screenshot.avif 320 KB  (AVIF)
Savings: 82% smaller
```

### WebP Image
```
Before:  image.webp     1.2 MB  (WebP)
After:   image.avif     280 KB  (AVIF)
Savings: 77% smaller
```

---

## 🔍 Console Logs

When optimization happens, you'll see detailed logs:

### Successful Optimization
```
[Image Optimizer] Processing: photo.jpg (2.50 MB)
[Image Optimizer] ✓ Success: photo.jpg → photo.avif
  Original: 2.50 MB
  Optimized: 450.23 KB
  Savings: 82.0%
  Time: 2345ms
```

### Skipped (Too Large)
```
[Image Optimizer] Skipped: large-photo.jpg (7.85 MB) - exceeds 5.00 MB threshold
```

### Skipped (Already AVIF)
```
[Image Optimizer] Skipped: image.avif - already AVIF format
```

### Failed (Fallback to Original)
```
[Image Optimizer] Processing: corrupted.jpg (1.20 MB)
[Image Optimizer] ✗ Failed: corrupted.jpg
  Error: Invalid image data
  Time: 156ms
  Falling back to original
```

---

## 🛠️ Integration with Node.js Backend

### Upload with Optimization Tracking

```javascript
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

async function uploadImage(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('metadata', JSON.stringify({
    name: 'my-photo.jpg',
    description: 'Uploaded via API'
  }));

  const response = await axios.post(
    'https://cdn-bengalart.darkwayrider.workers.dev/api/files',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${process.env.CDN_API_KEY}`,
        ...formData.getHeaders()
      }
    }
  );

  const { data } = response.data;
  
  if (data.optimization) {
    console.log(`✓ Image optimized!`);
    console.log(`  Original: ${(data.optimization.originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Optimized: ${(data.optimization.optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Savings: ${data.optimization.savings}%`);
  }

  return data.rawUrl;
}
```

---

## ⚙️ Technical Details

### WASM Library

Uses `wasm-image-optimization` - a WebAssembly-based image processing library specifically designed for Cloudflare Workers.

**Why WASM?**
- ✅ Fast processing at the edge
- ✅ No external dependencies
- ✅ Works in Cloudflare Workers environment
- ✅ Supports multiple formats

### AVIF Format

**Why AVIF?**
- ✅ 50% smaller than JPEG at same quality
- ✅ Supported by all modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Better compression than WebP
- ✅ Royalty-free, open standard

**Browser Support:**
- Chrome 85+ ✅
- Firefox 93+ ✅
- Safari 16+ ✅
- Edge 121+ ✅

### Performance Impact

| Operation | Time |
|-----------|------|
| Small image (< 500KB) | 1-2 seconds |
| Medium image (1-2MB) | 2-4 seconds |
| Large image (3-5MB) | 4-8 seconds |
| Very large (> 5MB) | Skipped (no optimization) |

---

## 🚨 Troubleshooting

### Issue: Optimization Not Applied

**Possible Causes:**
1. File is larger than 5MB
2. File is not an image
3. File is already in AVIF format
4. Optimization failed (check logs)

**Solution:**
Check console logs for detailed information about why optimization was skipped.

---

### Issue: Optimization Takes Too Long

**Possible Causes:**
1. Large image file (close to 5MB)
2. Complex image with many details

**Solution:**
- Reduce image size before uploading
- Use lower resolution images
- Consider pre-optimizing very large images

---

### Issue: Optimized Image Quality Too Low

**Current Settings:**
- Quality: 70 (on scale of 0-100)

**To Adjust:**
Edit `src/lib/image-optimizer.js`:
```javascript
const AVIF_QUALITY = 80; // Increase for better quality (larger file size)
```

---

### Issue: Need Original Format

If you need to preserve original format for specific files:

**Option 1:** Upload files > 5MB (won't be optimized)

**Option 2:** Add custom logic to skip optimization:
```javascript
// In metadata, add skipOptimization flag
{
  "name": "photo.jpg",
  "skipOptimization": true
}
```

Then modify `shouldOptimizeImage()` in `image-optimizer.js`:
```javascript
export function shouldOptimizeImage(file, metadata) {
  if (metadata?.skipOptimization) {
    return false;
  }
  // ... rest of logic
}
```

---

## 📊 Statistics & Monitoring

### Response Fields

When optimization is applied, the response includes:

```json
{
  "optimization": {
    "applied": true,
    "originalSize": 1234567,      // Bytes
    "optimizedSize": 245678,      // Bytes
    "savings": "80.1",            // Percentage
    "processingTime": 2345        // Milliseconds
  }
}
```

### Tracking Optimization

Save these statistics to your database to track:
- Total data saved
- Average compression ratio
- Processing times
- Optimization success rate

---

## 🎯 Best Practices

1. **Upload High-Quality Originals**
   - Upload the best quality you have
   - Let the optimizer handle compression
   - Don't pre-compress images

2. **Monitor Logs**
   - Check console logs for optimization stats
   - Track failed optimizations
   - Adjust settings if needed

3. **Test Browser Compatibility**
   - AVIF is supported in modern browsers
   - Consider fallback for older browsers
   - Use `<picture>` element with fallbacks

4. **Optimize Before Upload (Optional)**
   - For very large images (> 5MB), pre-resize before upload
   - This ensures optimization is applied

---

## 🔧 Configuration

### Current Settings

Located in `src/lib/image-optimizer.js`:

```javascript
const SIZE_THRESHOLD = 5 * 1024 * 1024; // 5MB
const MAX_WIDTH = 1920;                  // pixels
const AVIF_QUALITY = 70;                 // 0-100
const OPTIMIZATION_TIMEOUT = 10000;      // 10 seconds
```

### Customization

**Increase Size Threshold:**
```javascript
const SIZE_THRESHOLD = 10 * 1024 * 1024; // 10MB
```

**Change Max Width:**
```javascript
const MAX_WIDTH = 2560; // 2K resolution
```

**Adjust Quality:**
```javascript
const AVIF_QUALITY = 80; // Higher quality, larger file
```

**Extend Timeout:**
```javascript
const OPTIMIZATION_TIMEOUT = 15000; // 15 seconds
```

---

## 📝 Summary

**What Changed:**
- ✅ Images < 5MB are automatically optimized
- ✅ Converted to AVIF format
- ✅ Resized to max 1920px width
- ✅ 60-80% size reduction typical
- ✅ Response includes optimization statistics
- ✅ Graceful fallback if optimization fails

**What Stayed the Same:**
- ✅ API endpoints unchanged
- ✅ Authentication unchanged
- ✅ Non-image files work as before
- ✅ Large files (> 5MB) work as before

**Benefits:**
- 🚀 Faster page loads
- 💾 Less storage usage
- 💰 Lower bandwidth costs
- 🌍 Better user experience

---

**Optimization is now live! Upload an image to see it in action.** 🎉
