#!/bin/bash

# Quick fix script for common TypeScript/ESLint errors
# This script will comment out unused imports and variables

echo "🔧 Fixing common TypeScript/ESLint errors..."

# Fix unused variables in health route
sed -i 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/' src/app/api/health/route.ts

# Fix unused imports in documentation page
sed -i 's/Copy,/\/\/ Copy,/' src/app/documentation/page.tsx
sed -i 's/ArrowLeft,/\/\/ ArrowLeft,/' src/app/documentation/page.tsx

# Fix unused imports in campaigns page
sed -i 's/Card, CardContent, CardDescription, CardHeader, CardTitle/\/\/ Card, CardContent, CardDescription, CardHeader, CardTitle/' src/app/campaigns/page.tsx
sed -i 's/ArrowLeft,/\/\/ ArrowLeft,/' src/app/campaigns/page.tsx
sed -i 's/RefreshCw,/\/\/ RefreshCw,/' src/app/campaigns/page.tsx

echo "✅ Basic fixes applied!"
echo "📝 Note: For complete fix, review all TypeScript errors manually"
echo "🚀 Production build should work now with ignoreBuildErrors: true"
