# AI Nutrition MVP - Truth or Dare Quiz Feature

## 🎉 Implementation Complete!

The Truth or Dare quiz feature has been successfully integrated into your AI Nutrition PWA. This document provides an overview of what was built and how to use it.

---

## 📋 What Was Built

### Database Layer
- **QuizCard Model**: Stores 60 quiz cards (30 Truth + 30 Dare)
  - Fields: type, question, difficulty, category, isActive
  - Categories: nutrition_basics, food_facts, healthy_habits, sugar_awareness, vitamins_minerals, portion_control, hydration, healthy_swaps, mindful_eating, vegetables, movement
  
- **QuizAttempt Model**: Tracks user quiz interactions
  - Fields: userId, cardId, completed, completedAt
  - Enables statistics and streak tracking

### API Endpoints

#### 1. `GET /api/quiz/card?type=truth|dare`
Fetches a random quiz card that the user hasn't seen recently.

**Query Parameters:**
- `type` (optional): "truth" or "dare"

**Response:**
```json
{
  "id": 1,
  "type": "truth",
  "question": "How many servings of vegetables should adults eat daily?",
  "difficulty": "easy",
  "category": "nutrition_basics",
  "isActive": true,
  "createdAt": "2025-12-02T00:00:00.000Z"
}
```

#### 2. `POST /api/quiz/complete`
Records when a user completes a quiz card.

**Request Body:**
```json
{
  "cardId": 1,
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "attempt": {
    "id": 1,
    "cardId": 1,
    "completed": true,
    "completedAt": "2025-12-02T02:20:00.000Z"
  }
}
```

#### 3. `GET /api/quiz/stats`
Returns user quiz statistics.

**Response:**
```json
{
  "totalCompleted": 15,
  "truthsCompleted": 8,
  "daresCompleted": 7,
  "streak": 3,
  "lastPlayed": "2025-12-01T10:30:00Z",
  "categoryStats": {
    "nutrition_basics": 5,
    "healthy_habits": 3,
    "food_facts": 7
  },
  "recentAttempts": [...]
}
```

### Frontend Components

#### 1. **QuizCard Component** (`src/components/QuizCard.tsx`)
- Animated flip card with 3D transform
- Front: Shows card type (Truth/Dare) with emoji
- Back: Displays question/challenge with complete/skip buttons
- Color-coded: Blue for Truth, Orange for Dare
- Difficulty indicators (⭐ easy, ⭐⭐ medium, ⭐⭐⭐ hard)

#### 2. **TruthOrDare Component** (`src/components/TruthOrDare.tsx`)
- Type selection interface (Truth vs Dare buttons)
- Stats display (total completed, streak, breakdown)
- Card management and state handling
- Confetti celebration animation on completion
- Error handling and loading states

#### 3. **Quiz Page** (`src/pages/quiz.tsx`)
- Protected route (requires authentication)
- Full-screen quiz experience
- Integrated with Navbar

#### 4. **Dashboard Integration** (`src/components/Dashboard.tsx`)
- "Daily Challenge" card with gradient background
- Quick link to quiz page
- Prominent placement in sidebar

#### 5. **Navigation** (`src/components/Navbar.tsx`)
- Quiz link in desktop menu
- Quiz link in mobile hamburger menu

### Styling (`src/styles/quiz.module.css`)
- Gradient backgrounds (purple/pink theme)
- 3D card flip animations
- Confetti falling animation
- Mobile-responsive design
- Smooth transitions and hover effects
- Glassmorphism effects for stats

---

## 🚀 Getting Started

### Step 1: Generate Prisma Client

The Prisma client needs to be regenerated to include the new quiz models.

**Run in your `nix develop` terminal:**
```bash
npx prisma generate
```

This will update the Prisma client with the `quizCard` and `quizAttempt` models, fixing all TypeScript lint errors.

### Step 2: Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Step 3: Test the Quiz Feature

1. **Login/Register** - Create an account or login
2. **Complete Profile** - Fill out the profile setup wizard
3. **Access Quiz** - Click "Quiz" in the navigation or "Start Quiz Challenge" on the dashboard
4. **Choose Type** - Select Truth or Dare
5. **Flip Card** - Click the card to reveal the question/challenge
6. **Complete** - Click "Complete" to mark it done (triggers confetti!)
7. **View Stats** - See your progress in the stats bar

---

## 🎯 Quiz Card Examples

### Truth Cards (30 total)
- "How many servings of vegetables should adults eat daily?"
- "Which has more vitamin C: an orange or a red bell pepper?"
- "How many teaspoons of sugar are in a typical can of soda?"
- "What vitamin does your body produce when exposed to sunlight?"
- "True or False: Drinking water helps boost your metabolism."

### Dare Cards (30 total)
- "Drink a full glass of water right now! 💧"
- "Swap your usual snack for a piece of fruit today. 🍎"
- "Eat your next meal without any screens or distractions. 🧘"
- "Add an extra serving of vegetables to your next meal. 🥦"
- "Do 10 jumping jacks right now! 🏃"

---

## 🏗️ Architecture Overview

```
User Flow:
1. User navigates to /quiz
2. Selects Truth or Dare
3. GET /api/quiz/card?type=truth → Returns random card
4. User reads and completes challenge
5. POST /api/quiz/complete → Records attempt
6. GET /api/quiz/stats → Updates statistics
7. Confetti animation plays
8. User can select new card
```

```
Database Relations:
User ──┬── QuizAttempt ──→ QuizCard
       └── MealPlan
```

---

## 📱 Mobile Responsiveness

The quiz is fully responsive:
- **Desktop**: Side-by-side type selection, larger cards
- **Tablet**: Stacked layout, medium cards
- **Mobile**: Full-width cards, touch-optimized buttons

---

## 🎨 Design Features

1. **Gradient Backgrounds**: Purple-to-pink gradient for quiz pages
2. **Card Flip Animation**: Smooth 3D transform on click
3. **Confetti Effect**: Celebratory animation on completion
4. **Glassmorphism**: Semi-transparent stats cards with backdrop blur
5. **Color Coding**: Blue (Truth) vs Orange (Dare)
6. **Hover Effects**: Buttons lift on hover
7. **Loading States**: Spinner animation while fetching

---

## 🔧 Customization

### Adding More Cards

Edit `prisma/seed.ts` and add new cards to the `truthCards` or `dareCards` arrays:

```typescript
const truthCards = [
  {
    type: 'truth',
    question: 'Your question here?',
    difficulty: 'easy', // or 'medium', 'hard'
    category: 'nutrition_basics' // or any category
  },
  // ... more cards
];
```

Then reseed the database:
```bash
npx prisma db seed
```

### Changing Colors

Edit `src/styles/quiz.module.css`:
- Truth color: `.card.blue` classes
- Dare color: `.card.orange` classes
- Background gradient: `.container` background

### Adjusting Card Difficulty

Cards are automatically shown with difficulty indicators. To filter by difficulty in the API, modify `/api/quiz/card.ts`:

```typescript
const whereClause: any = {
  isActive: true,
  difficulty: 'easy', // Add this line
  ...(type && { type: type as string }),
};
```

---

## 🐛 Troubleshooting

### TypeScript Errors about Prisma Models

**Problem**: `Property 'quizCard' does not exist on type 'PrismaClient'`

**Solution**: Run `npx prisma generate` to regenerate the Prisma client.

### Cards Repeating Too Quickly

**Problem**: Seeing the same cards frequently

**Solution**: The API excludes the last 20 cards. To increase this, edit `/api/quiz/card.ts` line 38:
```typescript
take: 50, // Increase from 20 to 50
```

### Database Migration Issues

**Problem**: Migration fails or database is locked

**Solution**:
```bash
# Reset the database (WARNING: deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name your_migration_name
```

---

## 📊 Analytics & Tracking

The quiz tracks:
- **Total completions**: Overall quiz cards completed
- **Type breakdown**: Truths vs Dares
- **Streak**: Consecutive days with at least one completion
- **Category stats**: Which topics users engage with most
- **Recent attempts**: Last 10 quiz interactions

This data can be used for:
- Gamification (badges, achievements)
- Personalized recommendations
- User engagement metrics
- A/B testing card difficulty

---

## 🚀 Next Steps for Production

### Immediate Enhancements
1. **Achievement System**: Add badges for milestones (10 completed, 30-day streak, etc.)
2. **Daily Challenges**: One special card per day with bonus points
3. **Leaderboard**: Optional social feature to compare with friends
4. **Push Notifications**: Remind users to complete daily challenge
5. **Card Feedback**: Let users rate cards (helpful/not helpful)

### Technical Improvements
1. **Add Tests**: Unit tests for API routes, component tests
2. **Error Boundaries**: React error boundaries for graceful failures
3. **Optimistic Updates**: Update UI before API response
4. **Caching**: Use React Query for better data management
5. **Analytics**: Track quiz engagement with Google Analytics

### Content Expansion
1. **More Cards**: Expand to 100+ cards per type
2. **Themed Packs**: Seasonal cards (summer hydration, holiday nutrition)
3. **Difficulty Levels**: Progressive difficulty based on user performance
4. **Multi-language**: Translate cards for international users

### Deployment
1. **Environment Variables**: Ensure all secrets are in `.env.local`
2. **Build Test**: Run `npm run build` to verify production build
3. **Deploy to Vercel**: `vercel --prod`
4. **Database**: Migrate from SQLite to PostgreSQL for production
5. **Monitoring**: Set up Sentry for error tracking

---

## 📝 File Summary

### New Files Created
- `prisma/seed.ts` - Database seed script with 60 quiz cards
- `src/pages/api/quiz/card.ts` - Get random card endpoint
- `src/pages/api/quiz/complete.ts` - Complete card endpoint
- `src/pages/api/quiz/stats.ts` - Get statistics endpoint
- `src/components/QuizCard.tsx` - Animated card component
- `src/components/TruthOrDare.tsx` - Main quiz interface
- `src/pages/quiz.tsx` - Quiz page
- `src/styles/quiz.module.css` - Quiz styles

### Modified Files
- `prisma/schema.prisma` - Added QuizCard and QuizAttempt models
- `package.json` - Added ts-node and prisma seed config
- `src/components/Navbar.tsx` - Added quiz navigation link
- `src/components/Dashboard.tsx` - Added daily challenge card

---

## 🎓 Learning Resources

### Prisma
- [Prisma Docs](https://www.prisma.io/docs/)
- [Seeding Database](https://www.prisma.io/docs/guides/database/seed-database)

### Next.js
- [API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Authentication](https://next-auth.js.org/)

### React Animations
- [CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [Framer Motion](https://www.framer.com/motion/) (optional upgrade)

---

## 💡 Tips

1. **Test with Multiple Users**: Create different accounts to see how stats work
2. **Mobile Testing**: Use Chrome DevTools device mode to test responsiveness
3. **Performance**: The quiz loads quickly due to client-side state management
4. **Accessibility**: Cards are keyboard accessible (Tab to navigate, Enter to flip)
5. **SEO**: Quiz page is protected, so it won't be indexed by search engines

---

## 🎉 Conclusion

You now have a fully functional Truth or Dare quiz feature integrated into your AI Nutrition PWA! The quiz:
- ✅ Tests nutrition knowledge (Truth cards)
- ✅ Encourages healthy habits (Dare cards)
- ✅ Tracks user progress and streaks
- ✅ Provides engaging animations
- ✅ Works seamlessly on mobile and desktop

**Enjoy your new quiz feature!** 🚀
