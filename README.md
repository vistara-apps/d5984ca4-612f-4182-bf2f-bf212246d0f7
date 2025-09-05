# Pocket Rights - Base Mini App

A mobile-first application for individuals to quickly access state-specific legal rights information and document interactions with law enforcement.

## 🛡️ Features

### Core Features
- **State-Specific Rights Guides**: One-page, mobile-optimized guides detailing user rights during police stops, tailored to specific US states
- **"Do's and Don'ts" Scripts**: Pre-written, easily shareable scripts in English and Spanish for common law enforcement interaction scenarios
- **One-Tap Incident Recording**: Quick-access button to instantly start audio/video recording or log basic interaction details
- **Shareable Interaction Summary**: Auto-generates concise, shareable summary cards with key interaction details

### Premium Features
- Unlimited interaction logging
- AI-powered custom script generation
- Advanced shareable cards with legal references
- Multi-language support (English & Spanish)
- Cloud backup and sync
- Priority customer support
- Farcaster Frame integration

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: Privy (Web3 wallet authentication)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Payments**: Stripe
- **Social**: Farcaster integration via Neynar API
- **Blockchain**: Base (Coinbase L2)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Privy account and app
- OpenAI API key
- Stripe account (for payments)
- Neynar API key (for Farcaster integration)

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd pocket-rights
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Farcaster Integration
NEYNAR_API_KEY=your_neynar_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration file in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```

### 4. Privy Configuration

1. Create a Privy app at [privy.io](https://privy.io)
2. Configure your app settings:
   - Enable wallet login methods
   - Set your app domain
   - Configure embedded wallets if needed

### 5. Stripe Setup

1. Create a Stripe account
2. Create a product and price for the Premium subscription ($5/month)
3. Set up webhooks pointing to `/api/stripe/webhook`
4. Configure the webhook to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 6. OpenAI Setup

1. Get an API key from [OpenAI](https://platform.openai.com)
2. Ensure you have access to GPT-4 (required for script generation)

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── interactions/  # Interaction logging
│   │   ├── rights-guides/ # State rights data
│   │   ├── ai/           # AI-powered features
│   │   ├── stripe/       # Payment processing
│   │   └── farcaster/    # Social sharing
│   ├── dashboard/        # User dashboard
│   ├── pricing/          # Pricing page
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
├── lib/                 # Utilities and configurations
│   ├── context/         # React context providers
│   ├── supabase.ts      # Database client
│   ├── types.ts         # TypeScript types
│   └── constants.ts     # App constants
├── supabase/           # Database migrations
└── public/             # Static assets
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth` - Authenticate user with Privy
- `GET /api/auth` - Get user by wallet address

### Rights Guides
- `GET /api/rights-guides` - Get all state rights guides
- `GET /api/rights-guides?state=California` - Get specific state guide

### Interactions
- `POST /api/interactions` - Create new interaction log
- `GET /api/interactions` - Get user's interaction logs

### AI Features
- `POST /api/ai/generate-script` - Generate custom scripts
- `POST /api/ai/generate-summary` - Generate interaction summaries

### Payments
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Social
- `POST /api/farcaster/share` - Share to Farcaster
- `GET /api/farcaster/share` - Get Frame metadata

## 🎨 Design System

The app uses a custom design system with:
- **Colors**: Dark theme with purple/pink accents
- **Typography**: Responsive text scales
- **Components**: Glass morphism cards, gradient buttons
- **Motion**: Smooth transitions and animations
- **Layout**: Mobile-first responsive design

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Wallet-based authentication via Privy
- API route protection with JWT verification
- Stripe webhook signature verification
- Input validation with Zod schemas

## 📱 Mobile Optimization

- Progressive Web App (PWA) ready
- Touch-friendly interface
- Optimized for mobile screens
- Fast loading with Next.js optimizations

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact support for Premium users

## 🔮 Roadmap

- [ ] Voice recording functionality
- [ ] GPS location integration
- [ ] Offline mode support
- [ ] Additional language support
- [ ] Legal resource library
- [ ] Community features
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

---

**Disclaimer**: This application provides general information about legal rights and is not a substitute for professional legal advice. Always consult with a qualified attorney for specific legal situations.
