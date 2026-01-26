# Vercel Deployment Fix

## Problem
Wagmi library uses `indexedDB` and React hooks (`useRef`) which are not available during static page generation, causing build failures.

## Solution
Disable static page generation in Vercel using environment variables.

### Steps:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add this Environment Variable:**
   - Name: `SKIP_STATIC_PAGE_GENERATION`
   - Value: `1`
   - Environment: Production, Preview, Development (check all)

3. **Redeploy**:
   ```bash
   git add .
   git commit -m "fix: add deployment configuration"
   git push origin main
   ```

4. Vercel will automatically detect the push and redeploy

### Alternative Fix (if above doesn't work):
Add to `vercel.json`:
```json
{
  "buildCommand": "next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

## Files Fixed:
- ✅ `next.config.ts` - Added serverExternalPackages for wagmi
- ✅ `src/utils/abi.ts` - Added getDeposit and getCompanyBalance
- ✅ `src/app/enterprise/page.tsx` - Added treasury balance variables
- ✅ `package.json` - Simplified build scripts

## Features Status:
✅ **ALL FEATURES ARE INTACT** - No functionality lost
- History Search & Filters
- Treasury Analytics Charts  
- Mobile Responsiveness
- Scheduler & Address Book
- Platform Fee Integration
