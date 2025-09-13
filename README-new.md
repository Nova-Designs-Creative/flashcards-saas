# StudyAI - AI-Powered Flashcard Generator

A modern web application that transforms your study notes into AI-powered flashcards using OpenAI's GPT technology. Built with Next.js, Supabase, and TypeScript.

## Features

### 🧠 AI-Powered Flashcard Generation
- Convert study notes into intelligent question-answer flashcards
- Powered by OpenAI GPT-4 for smart content analysis
- Automatic difficulty scoring and context-aware answers

### 📚 Interactive Study Mode
- Flip-card animations for engaging study sessions
- Progress tracking and performance analytics
- Spaced repetition algorithms for optimal learning

### 💎 Tier-Based Access
- **Free Tier**: 10 flashcards per month
- **Premium Tier**: Unlimited flashcards, priority processing, advanced features
- Secure payment processing via Cryptomus integration

### 🛡️ Security & Authentication
- Supabase authentication with Row Level Security
- Protected routes and API endpoints
- Secure user data management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **AI**: OpenAI GPT-4 API
- **Authentication**: Supabase Auth
- **Payments**: Cryptomus (placeholder implementation)

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API key
- Cryptomus account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cryptomus
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Cryptomus
CRYPTOMUS_MERCHANT_ID=your_merchant_id
CRYPTOMUS_API_KEY=your_api_key
CRYPTOMUS_PAYMENT_URL=https://api.cryptomus.com/v1/payment

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
FREE_TIER_MONTHLY_LIMIT=10
PREMIUM_TIER_MONTHLY_LIMIT=1000
```

4. Set up the database:
Run the SQL script in `supabase-schema.sql` in your Supabase SQL editor to create the necessary tables and set up Row Level Security.

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main tables:

- **users**: User profiles with tier information and usage tracking
- **flashcard_sets**: Collections of flashcards with metadata
- **flashcards**: Individual question-answer pairs with study statistics
- **payment_transactions**: Payment history and subscription management

## API Endpoints

### Flashcards
- `POST /api/flashcards/generate` - Generate flashcards from notes
- `GET /api/flashcards/sets` - Get user's flashcard sets
- `GET /api/flashcards/sets/[id]` - Get specific flashcard set
- `PUT /api/flashcards/sets/[id]` - Update flashcard set
- `DELETE /api/flashcards/sets/[id]` - Delete flashcard set
- `POST /api/flashcards/[id]/review` - Track flashcard review

### User Management
- `GET /api/user/usage` - Get usage statistics and tier info
- `POST /api/user/upgrade` - Upgrade user to premium

### Payments
- `POST /api/payments/create` - Create payment session
- `POST /api/payments/webhook` - Handle payment webhooks (placeholder)

## Key Features Implementation

### AI Integration
The app uses OpenAI's GPT-4 to analyze study notes and generate intelligent flashcards. The AI prompt is optimized to:
- Extract key concepts and definitions
- Create varied question types
- Assign appropriate difficulty levels
- Generate comprehensive answers

### Tier-Based Limits
- Free users: 10 flashcards/month
- Premium users: Unlimited flashcards
- Automatic monthly reset functionality
- Usage tracking and enforcement

### Study Analytics
- Track review sessions and accuracy
- Performance insights and progress tracking
- Spaced repetition recommendations

## Deployment

The application is ready for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]

## Support

For support or questions, please [create an issue](link-to-issues) or contact [your-email].

---

Built with ❤️ using Next.js, Supabase, and OpenAI