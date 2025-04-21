# COURSECRED

A video course sharing platform with AI-powered content analysis and credit system.

## Features

- User authentication and authorization
- Video upload and management
- AI-powered video content analysis
- Credit-based system for video sharing
- Admin dashboard for platform management
- Content uniqueness detection
- Secure file storage and access control

## Tech Stack

### Frontend
- React 18.3 with Vite 5.4
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- AOS for scroll animations

### Backend
#### Node.js Server (Express)
- User authentication (JWT)
- Video management
- Database operations
- API routing

#### Python Server (Flask)
- Video processing
- AI analysis
- Content uniqueness detection
- Credit calculation
- Frame extraction

### Database
- MongoDB

## Prerequisites

- Node.js (Latest LTS version)
- Python 3.8+
- MongoDB
- npm or yarn

## Environment Variables

Create `.env` files in both frontend and backend directories.

### Backend `.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Installation

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```
The frontend will run on http://localhost:5173

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Node.js server:
```bash
npm start
```
The backend will run on http://localhost:5000

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── assets/
│   └── public/
└── backend/
    ├── routes/
    ├── models/
    ├── middleware/
    ├── config/
    └── uploads/
```

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Protected routes
- Secure file storage
- Access control
- Duplicate content detection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License.