# AI-Powered Nutrition PWA

This project is an AI-powered nutrition Progressive Web App (PWA) built with Next.js and TypeScript. It provides users with personalized meal recommendations and a responsive dashboard, along with user authentication features.

## Features

- User authentication (login and registration)
- AI-generated meal recommendations
- Responsive dashboard displaying user data and meal suggestions
- Progressive Web App capabilities

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-nutrition-pwa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Project Structure

- `src/pages`: Contains the application pages.
  - `_app.tsx`: Custom App component for global providers and styles.
  - `_document.tsx`: Custom HTML document structure.
  - `index.tsx`: Landing page with login and registration links.
  - `dashboard.tsx`: User dashboard with meal recommendations.
  - `auth`: Contains login and registration pages.
  
- `src/components`: Contains reusable components.
  - `Navbar.tsx`: Navigation links.
  - `Dashboard.tsx`: Displays user meal recommendations.
  - `MealRecommendation.tsx`: Shows AI-generated meal suggestions.
  - `AuthForm.tsx`: Handles user authentication.

- `src/lib`: Contains utility functions.
  - `ai.ts`: Functions for interacting with the OpenAI API.
  - `auth.ts`: Functions for authentication logic.

- `src/styles`: Contains CSS files.
  - `globals.css`: Global styles.
  - `dashboard.module.css`: Dashboard-specific styles.

- `src/types`: TypeScript interfaces for the application.
- `src/utils`: Utility functions for PWA features.

## Deployment

For deployment, you can use platforms like Vercel or Netlify. Make sure to configure environment variables for any API keys or secrets.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.