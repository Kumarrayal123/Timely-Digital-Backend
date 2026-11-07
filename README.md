# Timely Digital - Backend API

Backend service for **Timely Digital** (Healthcare Digital Marketing). Built with Node.js, Express, and MongoDB (Mongoose).

---

## 🛠️ Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **CORS**: Enabled for cross-origin frontend requests
- **Environment**: Dotenv

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create or verify `.env`:
```env
PORT=5001
MONGO_URI=mongodb+srv://saquiba:saquiba123@cluster0.hrgeeif.mongodb.net/TimelyDigital?retryWrites=true&w=majority&appName=TimelyDigital
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Run the Server
- **Development (with hot reload)**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```
- **Test Database Connection**:
  ```bash
  npm run test-db
  ```

---

## 📡 API Endpoints

### 🩺 Health Checks
- `GET /` — Root overview & available endpoints
- `GET /api/health` — Service health and uptime

### 📝 Consultation Leads
- `POST /api/consultation-leads` — Submit a new consultation lead
  - **Body**:
    ```json
    {
      "name": "Dr. Sarah Johnson",
      "businessName": "Johnson Dental Care",
      "phone": "+91 9876543210",
      "email": "sarah@johnsondental.com",
      "businessType": "Clinic",
      "lookingFor": "SEO"
    }
    ```
- `GET /api/consultation-leads` — List all leads (supports `?status=new`, `?search=term`, `?page=1&limit=20`)
- `GET /api/consultation-leads/stats` — Summary statistics of leads
- `GET /api/consultation-leads/:id` — Get single lead by ID
- `PUT /api/consultation-leads/:id` — Update lead status (`new`, `contacted`, `in_progress`, `converted`, `closed`) or notes
- `DELETE /api/consultation-leads/:id` — Delete lead by ID
