# AI Expense Tracker

An AI-powered Expense Tracker built with React, TypeScript, Vite, Supabase, and Gemini AI. The application helps users manage their finances by tracking expenses and income, automatically categorizing transactions using AI, scanning receipts, and generating financial insights through interactive dashboards.

## Features

- Secure authentication with Supabase
- AI-powered expense categorization using Gemini AI
- Receipt scanning with AI
- Expense and income tracking
- Budget management
- Interactive analytics and charts
- Financial reports and insights
- Responsive design for desktop and mobile
- Progressive Web App (PWA) support
- Dark modern user interface

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend & Database
- Supabase
- PostgreSQL

### AI
- Google Gemini API

### Charts & UI
- Recharts
- Lucide React

### Deployment
- Vercel

---

## Project Structure

```
src/
│
├── components/
├── pages/
├── hooks/
├── lib/
├── services/
├── types/
├── styles/
└── App.tsx

supabase/
└── migrations/
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/dishavreddy/ai-expense-tracker.git
```

Navigate into the project

```bash
cd ai-expense-tracker
```

Install dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## Running the Project

Development

```bash
npm run dev
```

Production Build

```bash
npm run build
```

Preview Production Build

```bash
npm run preview
```

---

## AI Features

- Automatic expense categorization
- Receipt text extraction
- Smart financial summaries
- Personalized spending insights
- Budget recommendations

---

## Screenshots

<img width="1916" height="941" alt="image" src="https://github.com/user-attachments/assets/ca35a8b4-52d7-4503-b9bc-4edb3d8c1c2d" />
<img width="1916" height="930" alt="Screenshot 2026-08-05 225649" src="https://github.com/user-attachments/assets/1181b860-e23f-425a-b5ae-75a09b9f2d81" />
<img width="1915" height="932" alt="Screenshot 2026-08-05 225716" src="https://github.com/user-attachments/assets/24d2e604-9a1e-4fa0-9c28-cc239a7cddaf" />
<img width="1917" height="932" alt="Screenshot 2026-08-05 225737" src="https://github.com/user-attachments/assets/65890342-6564-427c-90b5-15d03c20afc9" />

<img width="1917" height="932" alt="Screenshot 2026-08-05 225806" src="https://github.com/user-attachments/assets/7e815cde-2f41-4067-ae48-8d65a384fa4c" />
<img width="1917" height="931" alt="Screenshot 2026-08-05 225908" src="https://github.com/user-attachments/assets/dcbd3f54-4896-4803-8a79-b7a65182b4df" />

<img width="1916" height="921" alt="Screenshot 2026-08-05 225952" src="https://github.com/user-attachments/assets/33ef3256-507b-41d6-a45d-f9e3a733c1bd" />
<img width="1917" height="932" alt="Screenshot 2026-08-05 230135" src="https://github.com/user-attachments/assets/80737a0e-673c-41f5-9d94-9089a23ea44c" />

---

## Deployment

Deploy easily using Vercel.

Add the following environment variables in your deployment platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

---

## Future Improvements

- Multi-currency support
- Export reports as PDF
- Shared family budgets
- Bank account integration
- Voice expense logging
- Monthly email reports
- Offline synchronization
- AI spending predictions

---

## License

This project is licensed under the MIT License.

---

## Author

**Disha V Reddy**

GitHub: https://github.com/dishavreddy


