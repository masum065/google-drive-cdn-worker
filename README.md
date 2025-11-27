# 🚀 Google Drive CDN Worker

![Google Drive CDN Worker](src/assets/cdcw.png)

<div align="center">

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/masum065/google-drive-cdn-worker?style=social)](https://github.com/masum065/google-drive-cdn-worker)

**Transform your Google Drive into a lightning-fast global CDN**

[Live Demo](https://cdn-bengalart.darkwayrider.workers.dev) • [Documentation](#-documentation) • [Quick Start](#-quick-start)

</div>

---

## ✨ Features

- 🌍 **Global CDN** - Serve files through Cloudflare's edge network
- 📤 **API Upload** - Upload files programmatically with authentication
- 🔄 **Auto-Rotation** - Automatically rotate between multiple Google service accounts
- 📊 **Beautiful Dashboard** - Monitor stats, browse files, and manage your CDN
- 🎬 **Video Streaming** - Full support for range requests and video streaming
- 🔒 **Secure** - Token-based authentication for uploads
- ⚡ **Fast** - Cached responses with instant delivery

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Cloudflare Account](https://dash.cloudflare.com/sign-up)
- [Google Cloud Project](https://console.cloud.google.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

```bash
# Clone the repository
git clone https://github.com/masum065/google-drive-cdn-worker.git
cd google-drive-cdn-worker

# Install dependencies
npm install
```

### Setup

#### 1. Run Bootstrap Script

```bash
npm run bootstrap:google
```

This interactive script will:
- ✅ Authenticate with Google OAuth
- ✅ Enable Drive API access
- ✅ Import service account credentials
- ✅ Create a shared Drive folder
- ✅ Generate `src/service-accounts.json`

#### 2. Configure Wrangler

Update `wrangler.toml` with your settings:

```toml
name = "your-cdn-worker-name"

[vars]
DRIVE_UPLOAD_ROOT = "your-drive-folder-id"
API_TOKENS = "your-secret-token"
CDN_BASE_URL = "https://your-worker.workers.dev"
```

#### 3. Deploy to Cloudflare

```bash
npm run deploy
```

Your CDN is now live! 🎉

---

## 📖 Documentation

### API Endpoints

#### Upload File

```bash
POST /api/upload
Authorization: Bearer YOUR_API_TOKEN
Content-Type: multipart/form-data

# Example
curl -X POST https://your-worker.workers.dev/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "file-id",
    "name": "image.jpg",
    "cdnUrl": "https://your-worker.workers.dev/files/file-id",
    "driveUrl": "https://drive.google.com/file/d/file-id/view"
  }
}
```

#### Get File

```bash
GET /files/{fileId}

# Example
curl https://your-worker.workers.dev/files/abc123
```

#### Dashboard

```bash
GET /

# Opens the beautiful dashboard UI
```

#### API Summary

```bash
GET /api/dashboard/summary

# Returns statistics and storage info
```

---

## 🎨 Dashboard Features

The dashboard provides a modern, dark-themed interface with:

- 📊 **Real-time Statistics** - Uploads, requests, storage usage
- 🗂️ **File Browser** - View and manage all uploaded files
- 🔍 **Type Filters** - Filter by Images, Videos, Documents, etc.
- 📋 **Quick Copy** - Copy CDN and Drive URLs with one click
- 🎯 **File Details** - Click any file to view detailed information
- 📱 **Responsive Design** - Works perfectly on all devices

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DRIVE_UPLOAD_ROOT` | Google Drive folder ID | ✅ Yes |
| `API_TOKENS` | Comma-separated auth tokens | ✅ Yes |
| `CDN_BASE_URL` | Your worker's public URL | ✅ Yes |

### Service Accounts

Place your Google service account JSON files in `src/service-accounts.json`:

```json
[
  {
    "type": "service_account",
    "project_id": "your-project",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...",
    "client_email": "account@project.iam.gserviceaccount.com"
  }
]
```

> **💡 Tip:** You can use up to 100 service accounts for better quota distribution!

---

## 🔐 Security Best Practices

> [!WARNING]
> **Important Security Considerations**
> 
> - 🔒 **Never commit** `src/service-accounts.json` to public repositories
> - 🔑 **Rotate API tokens** regularly for enhanced security
> - 🛡️ **Use strong tokens** - Generate cryptographically secure random strings
> - 📝 **Monitor access logs** through the Cloudflare dashboard
> - 🚫 **Restrict CORS** if you only need specific domains to access files

### Generating Secure Tokens

```bash
# Generate a secure random token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🛠️ Development

### Local Development

```bash
# Start local development server
npm run dev

# Access at http://localhost:8787
```

### Build

```bash
# Build the worker
npm run build
```

### Deploy

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

---

## 📁 Project Structure

```
google-drive-cdn-worker/
├── src/
│   ├── assets/
│   │   ├── main.css          # Dashboard styles
│   │   ├── main.js           # Dashboard JavaScript
│   │   └── cdcw.png          # Banner image
│   ├── index.html            # Dashboard HTML
│   ├── worker-api.js         # Main worker logic
│   ├── drive-client.js       # Google Drive API client
│   └── service-accounts.json # Service account credentials
├── wrangler.toml             # Cloudflare configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Disclaimer

> [!CAUTION]
> **Important Legal Notice**
> 
> This software is provided "as is" for educational and personal use purposes only. The author and contributors:
> 
> - ❌ **Are NOT responsible** for any misuse or abuse of this code
> - ❌ **Are NOT liable** for any damages, data loss, or legal issues arising from use
> - ❌ **Do NOT endorse** using this software for illegal activities or violating terms of service
> - ❌ **Do NOT provide warranties** of any kind, express or implied
> 
> **By using this software, you agree that:**
> - ✅ You are solely responsible for your use of this code
> - ✅ You will comply with Google Drive's Terms of Service
> - ✅ You will comply with Cloudflare's Terms of Service
> - ✅ You will not use this for copyright infringement or illegal content
> - ✅ You understand the risks and accept full responsibility
> 
> **Use at your own risk. The author assumes no liability whatsoever.**

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Summary:** You are free to use, modify, and distribute this software, but the author provides no warranty and is not liable for any damages.

---

## 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [Google Drive API](https://developers.google.com/drive) - File storage
- [TailwindCSS](https://tailwindcss.com/) - UI styling

---

## 📧 Contact

**Masum Billah**

- GitHub: [@masum065](https://github.com/masum065)
- Project Link: [https://github.com/masum065/google-drive-cdn-worker](https://github.com/masum065/google-drive-cdn-worker)

---

<div align="center">

**Made with ❤️ by [masum065](https://github.com/masum065)**

If you found this project helpful, please consider giving it a ⭐!

</div>
