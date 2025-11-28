# 🚀 Node.js Express Backend Integration

Complete guide for integrating Google Drive CDN Worker with your Express backend.

---

## 📦 Installation

```bash
npm install express multer axios form-data dotenv
```

**Dependencies:**
- `express` - Web framework
- `multer` - File upload handling
- `axios` - HTTP client for API calls
- `form-data` - Multipart form data
- `dotenv` - Environment variables

---

## 🔧 Setup

### 1. Create `.env` file:

```env
# CDN Configuration
CDN_API_URL=https://cdn-bengalart.darkwayrider.workers.dev
CDN_API_KEY=f7060fdf29b38104def6e7e9f9c628144fa5f9f49715d4b0fe8128aba1e84e25

# Google Drive Folders
DRIVE_FOLDER_BENGAL_UPLOAD=1ABC123xyz456DEF789
DRIVE_FOLDER_ROOT=root

# Server Configuration
PORT=3000
```

---

## 📁 Project Structure

```
your-backend/
├── .env
├── package.json
├── server.js
├── config/
│   └── cdn.config.js
├── services/
│   └── cdn.service.js
├── controllers/
│   └── upload.controller.js
├── routes/
│   └── upload.routes.js
└── uploads/  (temporary storage)
```

---

## 🛠️ Implementation

### 1. Config File (`config/cdn.config.js`)

```javascript
require('dotenv').config();

module.exports = {
  cdnApiUrl: process.env.CDN_API_URL,
  cdnApiKey: process.env.CDN_API_KEY,
  folders: {
    bengalUpload: process.env.DRIVE_FOLDER_BENGAL_UPLOAD,
    root: process.env.DRIVE_FOLDER_ROOT,
  },
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'application/pdf',
  ],
};
```

---

### 2. CDN Service (`services/cdn.service.js`)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cdnConfig = require('../config/cdn.config');

class CDNService {
  constructor() {
    this.apiUrl = cdnConfig.cdnApiUrl;
    this.apiKey = cdnConfig.cdnApiKey;
  }

  /**
   * Upload single file to CDN
   * @param {Object} file - Multer file object
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, options = {}) {
    try {
      const formData = new FormData();
      
      // Add file
      formData.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      // Add metadata
      const metadata = {
        name: options.name || file.originalname,
        description: options.description || '',
        parents: options.parents || [cdnConfig.folders.root],
      };
      formData.append('metadata', JSON.stringify(metadata));

      // Make API request
      const response = await axios.post(
        `${this.apiUrl}/api/files`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.apiKey}`,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      // Clean up temporary file
      fs.unlinkSync(file.path);

      return response.data;
    } catch (error) {
      // Clean up on error
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Upload multiple files to CDN
   * @param {Array} files - Array of Multer file objects
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleFiles(files, options = {}) {
    const uploadPromises = files.map((file, index) => {
      const fileOptions = {
        name: options.names?.[index] || file.originalname,
        description: options.descriptions?.[index] || options.description || '',
        parents: options.parents || [cdnConfig.folders.root],
      };
      
      return this.uploadFile(file, fileOptions);
    });

    try {
      // Upload all files in parallel
      const results = await Promise.allSettled(uploadPromises);
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return {
            success: true,
            file: files[index].originalname,
            data: result.value.data,
          };
        } else {
          return {
            success: false,
            file: files[index].originalname,
            error: result.reason.message,
          };
        }
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload multiple files sequentially (with progress)
   * @param {Array} files - Array of Multer file objects
   * @param {Object} options - Upload options
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleFilesSequential(files, options = {}, onProgress = null) {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileOptions = {
        name: options.names?.[i] || file.originalname,
        description: options.descriptions?.[i] || options.description || '',
        parents: options.parents || [cdnConfig.folders.root],
      };

      try {
        const result = await this.uploadFile(file, fileOptions);
        results.push({
          success: true,
          file: file.originalname,
          data: result.data,
        });

        // Call progress callback
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            file: file.originalname,
            success: true,
          });
        }
      } catch (error) {
        results.push({
          success: false,
          file: file.originalname,
          error: error.message,
        });

        // Call progress callback
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: files.length,
            file: file.originalname,
            success: false,
            error: error.message,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get file metadata
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(fileId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete file
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(fileId) {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/api/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // API returned error response
      const apiError = new Error(
        error.response.data?.error?.message || 'CDN API Error'
      );
      apiError.status = error.response.status;
      apiError.code = error.response.data?.error?.code;
      return apiError;
    } else if (error.request) {
      // Request made but no response
      return new Error('CDN API not responding');
    } else {
      // Other errors
      return error;
    }
  }
}

module.exports = new CDNService();
```

---

### 3. Upload Controller (`controllers/upload.controller.js`)

```javascript
const cdnService = require('../services/cdn.service');
const cdnConfig = require('../config/cdn.config');

class UploadController {
  /**
   * Upload single file
   */
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const options = {
        name: req.body.name || req.file.originalname,
        description: req.body.description || '',
        parents: req.body.folderId 
          ? [req.body.folderId] 
          : [cdnConfig.folders.bengalUpload],
      };

      const result = await cdnService.uploadFile(req.file, options);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Upload multiple files (parallel)
   */
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const options = {
        description: req.body.description || '',
        parents: req.body.folderId 
          ? [req.body.folderId] 
          : [cdnConfig.folders.bengalUpload],
        names: req.body.names ? JSON.parse(req.body.names) : null,
      };

      const results = await cdnService.uploadMultipleFiles(req.files, options);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.status(201).json({
        success: true,
        message: `Uploaded ${successCount} files successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount,
        },
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Upload multiple files (sequential with progress)
   */
  async uploadMultipleSequential(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      const options = {
        description: req.body.description || '',
        parents: req.body.folderId 
          ? [req.body.folderId] 
          : [cdnConfig.folders.bengalUpload],
        names: req.body.names ? JSON.parse(req.body.names) : null,
      };

      // For real-time progress, you'd use WebSockets or Server-Sent Events
      // This is a simple example
      const results = await cdnService.uploadMultipleFilesSequential(
        req.files,
        options,
        (progress) => {
          console.log(`Progress: ${progress.current}/${progress.total} - ${progress.file}`);
        }
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.status(201).json({
        success: true,
        message: `Uploaded ${successCount} files successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount,
        },
      });
    } catch (error) {
      console.error('Sequential upload error:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get file metadata
   */
  async getFile(req, res) {
    try {
      const { fileId } = req.params;
      const result = await cdnService.getFileMetadata(fileId);

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error('Get file error:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete file
   */
  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      const result = await cdnService.deleteFile(fileId);

      res.json({
        success: true,
        message: 'File deleted successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new UploadController();
```

---

### 4. Routes (`routes/upload.routes.js`)

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/upload.controller');
const cdnConfig = require('../config/cdn.config');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: cdnConfig.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    if (cdnConfig.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

// Routes
router.post('/upload/single', upload.single('file'), uploadController.uploadSingle);
router.post('/upload/multiple', upload.array('files', 10), uploadController.uploadMultiple);
router.post('/upload/sequential', upload.array('files', 10), uploadController.uploadMultipleSequential);
router.get('/files/:fileId', uploadController.getFile);
router.delete('/files/:fileId', uploadController.deleteFile);

module.exports = router;
```

---

### 5. Main Server (`server.js`)

```javascript
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
app.use('/api', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 CDN API: ${process.env.CDN_API_URL}`);
});
```

---

## 🧪 Usage Examples

### 1. Single File Upload

```bash
curl -X POST http://localhost:3000/api/upload/single \
  -F "file=@image.jpg" \
  -F "name=my-image.jpg" \
  -F "description=Uploaded from backend" \
  -F "folderId=1ABC123xyz456DEF789"
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "1xyz789abc",
    "name": "my-image.jpg",
    "mimeType": "image/jpeg",
    "size": "524288",
    "rawUrl": "https://cdn.bengalart.click/files/1xyz789abc"
  }
}
```

---

### 2. Multiple Files Upload (Parallel)

```bash
curl -X POST http://localhost:3000/api/upload/multiple \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg" \
  -F "folderId=1ABC123xyz456DEF789" \
  -F "description=Batch upload"
```

**Response:**
```json
{
  "success": true,
  "message": "Uploaded 3 files successfully",
  "results": [
    {
      "success": true,
      "file": "image1.jpg",
      "data": {
        "id": "1file1",
        "rawUrl": "https://cdn.bengalart.click/files/1file1"
      }
    },
    {
      "success": true,
      "file": "image2.jpg",
      "data": {
        "id": "1file2",
        "rawUrl": "https://cdn.bengalart.click/files/1file2"
      }
    },
    {
      "success": true,
      "file": "image3.jpg",
      "data": {
        "id": "1file3",
        "rawUrl": "https://cdn.bengalart.click/files/1file3"
      }
    }
  ],
  "summary": {
    "total": 3,
    "success": 3,
    "failed": 0
  }
}
```

---

### 3. Frontend Integration (React Example)

```javascript
// UploadForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

function UploadForm() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('folderId', '1ABC123xyz456DEF789'); // bengal-upload folder
    formData.append('description', 'Uploaded from React app');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/upload/multiple',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setResults(response.data);
      alert(`Uploaded ${response.data.summary.success} files!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload to bengal-upload Folder</h2>
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange}
        disabled={uploading}
      />
      <button onClick={handleUpload} disabled={uploading || files.length === 0}>
        {uploading ? 'Uploading...' : `Upload ${files.length} files`}
      </button>
      
      {results && (
        <div>
          <h3>Results:</h3>
          <p>Success: {results.summary.success}</p>
          <p>Failed: {results.summary.failed}</p>
          <ul>
            {results.results.map((result, index) => (
              <li key={index}>
                {result.file}: {result.success ? '✅' : '❌'}
                {result.success && (
                  <a href={result.data.rawUrl} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UploadForm;
```

---

## 📊 Comparison: Parallel vs Sequential

| Feature | Parallel Upload | Sequential Upload |
|---------|----------------|-------------------|
| **Speed** | ⚡ Faster (all at once) | 🐢 Slower (one by one) |
| **Progress Tracking** | ❌ Difficult | ✅ Easy |
| **Error Handling** | ⚠️ All or nothing | ✅ Continue on error |
| **Server Load** | 🔥 High | 💚 Low |
| **Best For** | Few files (<5) | Many files (>5) |

---

## 🎯 Best Practices

### 1. Use Environment Variables
```javascript
// ✅ Good
const folderId = process.env.DRIVE_FOLDER_BENGAL_UPLOAD;

// ❌ Bad
const folderId = "1ABC123xyz456DEF789";
```

### 2. Clean Up Temp Files
```javascript
// Always clean up after upload
fs.unlinkSync(file.path);
```

### 3. Validate Files
```javascript
const allowedTypes = ['image/jpeg', 'image/png'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
```

### 4. Handle Errors Gracefully
```javascript
try {
  await cdnService.uploadFile(file);
} catch (error) {
  console.error('Upload failed:', error);
  // Don't expose internal errors to client
  res.status(500).json({ message: 'Upload failed' });
}
```

### 5. Use Batch Uploads for Multiple Files
```javascript
// ✅ Good - Batch upload
const results = await Promise.allSettled(uploadPromises);

// ❌ Bad - Sequential in loop without error handling
for (const file of files) {
  await uploadFile(file); // Stops on first error
}
```

---

## 🔒 Security Considerations

1. **Validate File Types**
   ```javascript
   const allowedMimeTypes = ['image/jpeg', 'image/png'];
   ```

2. **Limit File Size**
   ```javascript
   limits: { fileSize: 20 * 1024 * 1024 } // 20MB
   ```

3. **Sanitize Filenames**
   ```javascript
   const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
   ```

4. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const uploadLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/upload', uploadLimiter);
   ```

---

## 📝 Complete Example

Check the `examples/` folder for:
- ✅ Full Express server setup
- ✅ React frontend integration
- ✅ Vue.js example
- ✅ Next.js API route example

---

**🎉 You're all set! Start uploading to your `bengal-upload` folder!**
