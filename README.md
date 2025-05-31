# AI-Powered Resume Analyzer with Gemini

![image](https://github.com/user-attachments/assets/ea6b2869-2701-4744-8810-ce2344b578a5)

![image](https://github.com/user-attachments/assets/d793cf60-39dc-42df-8eee-5f25f014a0c7)

![image](https://github.com/user-attachments/assets/9a935e12-ef16-4f7f-9c7e-87b239756417)

![image](https://github.com/user-attachments/assets/079da81f-c352-4b32-a704-f76c06a98f72)

![image](https://github.com/user-attachments/assets/3b119e21-396e-4ef9-b990-fc34963de7db)






A MERN stack application that leverages Google's Gemini AI to analyze resumes, provide ATS compatibility scores, suggest improvements, and match job roles based on extracted skills.

## Features

- Resume upload and analysis using Gemini AI
- ATS compatibility scoring
- Resume improvement suggestions
- Job role matching based on AI-extracted skills
- Admin panel to train the system with hiring data

## Tech Stack

- **Frontend**: React.js, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI/ML**: Google Gemini AI API for intelligent resume parsing
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
resume-analyzer/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── middleware/         # Custom middleware
└── uploads/                # Temporary storage for uploaded resumes
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd server
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd client
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```
2. Start the frontend development server:
   ```
   cd client
   npm start
   ```

## License

MIT
