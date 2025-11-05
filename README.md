# LinkedIn OAuth 2.0 Demo - Next.js + TypeScript + MongoDB

A fully functional LinkedIn OAuth 2.0 authentication application built with **Next.js**, **TypeScript**, **MongoDB**, and **JWT sessions**. Features secure profile data storage, encrypted refresh tokens, and a beautiful modern UI.

## ✨ Features

✅ **LinkedIn OAuth 2.0** - Authorization Code Flow with OIDC support  
✅ **Secure Authentication** - JWT sessions in HTTP-only cookies  
✅ **Profile Management** - Store and display LinkedIn profile data  
✅ **Encrypted Tokens** - AES-256-GCM encryption for refresh tokens  
✅ **Token Refresh** - Programmatic access token rotation  
✅ **Onboarding Flow** - Collect missing email/picture on signup  
✅ **Responsive UI** - Beautiful modern design with professional styling  
✅ **TypeScript** - Full type safety across the codebase  
✅ **Production Ready** - Environment-based configuration and security hardening  

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **MongoDB** (Atlas recommended for cloud-hosted)
- **LinkedIn App** credentials from https://www.linkedin.com/developers/apps

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd linkedinauth-app
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# LinkedIn App Credentials (from LinkedIn Developers)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Your deployed URL (http://localhost:3000 for local dev)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# JWT Secret (any random string, min 32 chars)
JWT_SECRET=your_random_secret_key_here_min_32_characters

# Optional: Refresh Token Encryption Key (for production use KMS)
REFRESH_TOKEN_ENCRYPTION_KEY=optional_encryption_key
```

### 3. LinkedIn App Setup

1. Go to https://www.linkedin.com/developers/apps and create an app
2. In **Auth** settings, add Authorized redirect URLs:
   - Local: `http://localhost:3000/api/auth/callback`
   - Production: `https://yourdomain.com/api/auth/callback`
3. Ensure **OpenID Connect** product is enabled
4. Copy your **Client ID** and **Client Secret** to `.env.local`

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000 and click "Sign in with LinkedIn"

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
linkedinauth-app/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── linkedin.ts          ← Start OAuth
│   │   │   ├── callback.ts          ← Handle callback
│   │   │   ├── logout.ts            ← Clear session
│   │   │   └── refresh.ts           ← Refresh tokens
│   │   ├── me.ts                    ← Get current user
│   │   └── onboarding/
│   │       └── complete.ts          ← Update profile
│   ├── index.tsx                    ← Home page
│   ├── profile.tsx                  ← Profile page
│   ├── onboarding.tsx               ← Onboarding page
│   └── _app.tsx                     ← App wrapper
├── lib/
│   └── mongodb.ts                   ← MongoDB connection
├── models/
│   └── User.ts                      ← User type
├── utils/
│   ├── jwt.ts                       ← Session JWT logic
│   └── crypto.ts                    ← Token encryption/decryption
├── styles/
│   └── globals.css                  ← Global styles
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.example                     ← Env template
├── .env.local                       ← Your secrets (git-ignored)
├── .gitignore                       ← Git ignore patterns
└── README.md                        ← This file
```

---

## 🔑 API Endpoints

### Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/linkedin` | GET | Redirect to LinkedIn |
| `/api/auth/callback` | GET | Handle OAuth callback |
| `/api/auth/logout` | POST | Clear session & cache |
| `/api/auth/refresh` | POST | Refresh access token |

### User Data

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/me` | GET | Get current user profile |
| `/api/onboarding/complete` | POST | Update profile data |

---

## 🔐 Security Features

✅ **HTTP-Only Cookies** - Session tokens stored securely  
✅ **JWT Signing** - Sessions signed with `JWT_SECRET`  
✅ **CSRF Protection** - State validation in OAuth flow  
✅ **Encrypted Refresh Tokens** - AES-256-GCM encryption  
✅ **Secure Headers** - SameSite=Lax on cookies  
✅ **Environment Isolation** - Secrets in `.env.local`  
✅ **Automatic Cache Clearing** - localStorage cleared on logout  

### Production Checklist

- [ ] Set `Secure` flag in cookies (HTTPS only)
- [ ] Use KMS for refresh token encryption instead of dev key
- [ ] Set strong `JWT_SECRET` (32+ random chars)
- [ ] Enable HTTPS/SSL
- [ ] Update `NEXT_PUBLIC_BASE_URL` to your domain
- [ ] Configure LinkedIn app with production redirect URI
- [ ] Set `NODE_ENV=production`
- [ ] Add rate limiting
- [ ] Enable monitoring/logging

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial LinkedIn OAuth app"
   git branch -M main
   git remote add origin https://github.com/yourusername/linkedinauth-app.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Add environment variables:
     - `LINKEDIN_CLIENT_ID`
     - `LINKEDIN_CLIENT_SECRET`
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app`
   - Deploy!

3. **Update LinkedIn App**
   - Add redirect URL: `https://your-app.vercel.app/api/auth/callback`

### Other Hosting Options

- **Render**: Similar to Vercel, connect GitHub repo
- **Railway**: Simple deployment with env var setup
- **Fly.io**: Docker-based deployment
- **AWS Amplify**: AWS-native deployment

---

## 🧪 Testing the Flow

1. **Home Page** (`http://localhost:3000`)
   - See welcome screen
   - Click "Sign in with LinkedIn"

2. **LinkedIn Login**
   - Redirected to LinkedIn
   - Approve authorization
   - Redirected back to `/api/auth/callback`

3. **Profile Page** (`/profile`)
   - Name, email, headline displayed
   - Profile picture shown (if available)
   - Option to update profile

4. **Onboarding** (`/onboarding`)
   - Add missing email or picture
   - Data encrypted and stored

5. **Logout**
   - Click "Sign Out"
   - Cache cleared
   - Session cleared
   - Redirected to home

---

## 🛠️ Troubleshooting

### "Invalid redirect_uri"

Check:
1. `.env.local` → `NEXT_PUBLIC_BASE_URL` matches actual domain
2. LinkedIn app settings → exact redirect URL configured
3. Protocol (http:// vs https://) matches

### "ACCESS_DENIED: me.GET.NO_VERSION"

- Normal with OIDC apps!
- App uses id_token fallback
- Profile extracted from OIDC token

### "MONGODB_URI not set"

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster and database
3. Get connection string
4. Add to `.env.local`

### "Cannot find module"

```bash
npm install
```

---

## 📚 Technologies

- **Framework**: Next.js 13+ (Pages Router)
- **Language**: TypeScript 5+
- **Database**: MongoDB with official Node driver
- **Auth**: JWT (jsonwebtoken)
- **Crypto**: Node.js crypto (AES-256-GCM)
- **HTTP**: Axios
- **Styling**: Custom CSS utilities

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINKEDIN_CLIENT_ID` | ✅ | LinkedIn Developers |
| `LINKEDIN_CLIENT_SECRET` | ✅ | LinkedIn Developers |
| `NEXT_PUBLIC_BASE_URL` | ✅ | App URL |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `SESSION_COOKIE_NAME` | ❌ | Cookie name (default: li_session) |
| `LINKEDIN_SCOPES` | ❌ | OAuth scopes |
| `REFRESH_TOKEN_ENCRYPTION_KEY` | ❌ | Token encryption key |

---

## 🔄 How It Works

### Authorization Flow

```
User → "Sign in with LinkedIn" → LinkedIn Authorization
    ↓
LinkedIn → Redirects to /api/auth/callback with code
    ↓
Callback exchanges code for tokens
    ↓
User stored in MongoDB
    ↓
JWT session cookie set
    ↓
Redirected to /profile
```

### Token Management

```
Access Token
  └─ Used for API calls to LinkedIn
  └─ Expires in 1-2 hours

Refresh Token
  └─ Encrypted with AES-256-GCM
  └─ Stored in MongoDB
  └─ Used to get new access token

JWT Session Token
  └─ Signed with JWT_SECRET
  └─ Stored in HTTP-only cookie
  └─ Verified on each request
```

---

## 📦 Dependencies

```json
{
  "next": "13.4.10",
  "react": "18.2.0",
  "typescript": "^5.5.6",
  "mongodb": "^6.8.0",
  "axios": "^1.4.0",
  "jsonwebtoken": "^9.0.0"
}
```

---

## 🤝 Contributing

Fork, improve, and submit PRs!

## 📄 License

MIT - Free for personal and commercial use

---

## 📞 Support

- **LinkedIn API**: https://docs.microsoft.com/en-us/linkedin/
- **MongoDB**: https://docs.mongodb.com
- **Next.js**: https://nextjs.org/docs

---

**Built with ❤️ using Next.js, TypeScript, and LinkedIn OAuth 2.0**
