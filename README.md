# Facebook Ads Manager

A modern web application for managing Facebook advertising campaigns with CSV import, bulk campaign creation, and real-time monitoring.

## 🚀 Features

- **🔐 Authentication**: Secure login with email/password or Facebook access tokens
- **🏢 Account Management**: User registration, login, and Facebook account sync
- **🎯 Ad Account Selection**: Load and select Facebook ad accounts from Settings
- **📊 Dashboard**: Modern admin interface with campaign statistics per user/account
- **📄 CSV Import**: Upload and validate campaign data in CSV format (no access_token required)
- **👀 Preview**: Review campaign data before pushing to Facebook
- **🚀 Bulk Creation**: Automatically create campaigns, ad sets, creatives, and ads
- **📈 Monitoring**: Real-time tracking of campaign creation status
- **💾 Data Storage**: MongoDB integration for user-specific logs and statistics
- **⚙️ Settings**: Configure Facebook App credentials, manage long-lived tokens, and select ad accounts
- **🔄 Token Management**: Exchange short-lived tokens for long-lived tokens (60 days)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Facebook Integration**: Facebook Graph API v23.0
- **File Processing**: PapaParse for CSV handling

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- Facebook Developer Account
- Facebook App with Ads Management permissions

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd facebook-ads-manager/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=facebook_ads_manager
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
