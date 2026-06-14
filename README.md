# 💳 Role-Based SaaS Billing Portal

A full-stack internship-level project demonstrating a production-style SaaS billing system with role-based access control, subscription management, invoice generation, and an analytics dashboard.

---

## 📁 Project Structure

```
billing-portal/
├── client/                     # React.js frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Alert.js
│   │   │   ├── Layout.js       # Sidebar + topbar shell
│   │   │   ├── PlanCard.js
│   │   │   ├── Spinner.js
│   │   │   └── StatCard.js
│   │   ├── context/
│   │   │   └── AuthContext.js  # Global auth state (React Context)
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── PlansPage.js
│   │   │   ├── BillingPage.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminPlansPage.js
│   │   │   ├── AdminUsersPage.js
│   │   │   └── FinancePage.js
│   │   ├── services/
│   │   │   └── api.js          # Axios instance + all API calls
│   │   ├── App.js              # Routes + guards
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── server/                     # Node.js / Express backend
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── controllers/
    │   ├── authController.js
    │   ├── planController.js
    │   ├── subscriptionController.js
    │   ├── invoiceController.js
    │   └── userController.js
    ├── middleware/
    │   ├── authMiddleware.js    # JWT protect
    │   ├── roleMiddleware.js    # RBAC authorize()
    │   └── errorMiddleware.js
    ├── models/
    │   ├── User.js
    │   ├── Plan.js
    │   ├── Subscription.js
    │   └── Invoice.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── planRoutes.js
    │   ├── subscriptionRoutes.js
    │   ├── invoiceRoutes.js
    │   └── userRoutes.js
    ├── seed/
    │   └── seed.js             # Creates admin, finance user & sample plans
    ├── .env.example
    ├── package.json
    └── server.js
```

---

## 🚀 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Tailwind CSS, Axios, React Router v6 |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB with Mongoose ODM               |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| PDF       | PDFKit                                  |

---

## 👥 User Roles

| Role    | Capabilities |
|---------|-------------|
| **admin**   | Full access: manage plans, view all users, change roles, see all invoices & analytics |
| **user**    | Register/login, browse plans, subscribe/cancel, view own invoices, download PDFs, update profile |
| **finance** | View all invoices, download PDFs, view revenue analytics dashboard |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas connection string
- npm or yarn

---

### 1. Clone / Extract the project

```bash
unzip billing-portal.zip
cd billing-portal
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/billing_portal
JWT_SECRET=your_super_secret_key_here
PORT=5000
ADMIN_EMAIL=admin@billingportal.com
ADMIN_PASSWORD=Admin@123
```

**Seed the database** (creates admin, finance user, and 3 plans):

```bash
npm run seed
```

**Start the server:**

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

The API will be running at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Edit `client/.env` (default is fine for local dev):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Start the React app:**

```bash
npm start
```

The app opens at `http://localhost:3000`.

---

## 🔐 Demo Accounts (after seeding)

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Admin   | admin@billingportal.com      | Admin@123    |
| Finance | finance@billingportal.com    | Finance@123  |
| User    | Register via `/register`     | your choice  |

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### 🔑 Auth

| Method | Endpoint         | Access  | Description               |
|--------|-----------------|---------|---------------------------|
| POST   | /auth/register  | Public  | Register new user         |
| POST   | /auth/login     | Public  | Login, returns JWT        |
| GET    | /auth/me        | Private | Get logged-in user        |
| PUT    | /auth/me        | Private | Update name/password      |

**POST /auth/register** body:
```json
{ "name": "Jane", "email": "jane@example.com", "password": "secret123" }
```

**POST /auth/login** body:
```json
{ "email": "jane@example.com", "password": "secret123" }
```

---

### 📦 Plans

| Method | Endpoint        | Access       | Description              |
|--------|----------------|--------------|--------------------------|
| GET    | /plans          | Private      | Get active plans         |
| GET    | /plans/all      | Admin        | Get all plans (incl. inactive) |
| POST   | /plans          | Admin        | Create plan              |
| PUT    | /plans/:id      | Admin        | Update plan              |
| DELETE | /plans/:id      | Admin        | Delete plan              |

**POST /plans** body:
```json
{
  "name": "Pro",
  "priceMonthly": 29.99,
  "priceYearly": 299.99,
  "features": ["Unlimited Projects", "Priority Support"],
  "isActive": true
}
```

---

### 📋 Subscriptions

| Method | Endpoint              | Access  | Description               |
|--------|-----------------------|---------|---------------------------|
| POST   | /subscriptions        | Private | Subscribe to a plan       |
| GET    | /subscriptions/me     | Private | My active subscription    |
| PUT    | /subscriptions/cancel | Private | Cancel my subscription    |
| GET    | /subscriptions        | Admin   | All subscriptions         |

**POST /subscriptions** body:
```json
{ "planId": "<planId>", "billingCycle": "monthly" }
```

---

### 🧾 Invoices

| Method | Endpoint                | Access         | Description              |
|--------|------------------------|----------------|--------------------------|
| GET    | /invoices/me            | Private        | My invoices              |
| GET    | /invoices               | Admin/Finance  | All invoices             |
| GET    | /invoices/analytics     | Admin/Finance  | Revenue analytics        |
| GET    | /invoices/:id/pdf       | Owner/Admin/Finance | Download PDF        |

---

### 👥 Users (Admin)

| Method | Endpoint             | Access | Description       |
|--------|---------------------|--------|-------------------|
| GET    | /users               | Admin  | All users         |
| PUT    | /users/:id/role      | Admin  | Change user role  |

**PUT /users/:id/role** body:
```json
{ "role": "finance" }
```

---

## 🌟 Features Summary

- ✅ JWT authentication with 7-day expiry
- ✅ Role-based access control (admin / user / finance)
- ✅ Subscription management (subscribe, switch, cancel)
- ✅ Monthly & yearly billing toggle with savings display
- ✅ Mock payment gateway (auto-marks invoices as "paid")
- ✅ PDF invoice generation and download (PDFKit)
- ✅ Admin analytics: revenue by plan, revenue by month, user breakdown
- ✅ Finance dashboard: all invoices + revenue charts
- ✅ Responsive UI with Tailwind CSS
- ✅ Sidebar navigation filtered by role
- ✅ Seed script for quick demo setup
- ✅ Centralized error handling

---

## 🛠️ Common Commands

```bash
# Server
cd server
npm run dev        # start with nodemon
npm start          # start in production
npm run seed       # seed DB with admin + plans

# Client
cd client
npm start          # start React dev server
npm run build      # production build
```

---

## 📌 Notes for Interviewers / Reviewers

- **Security**: Passwords are hashed with bcrypt (salt rounds = 10). Tokens are verified server-side on every protected request.
- **RBAC**: The `authorize()` middleware factory makes it trivial to add new roles.
- **Mock Payments**: Subscriptions immediately generate a "paid" invoice — in production, replace this with Stripe or Razorpay webhook logic.
- **PDF**: PDFKit streams the PDF directly to the HTTP response; no temp files are written.
- **Error Handling**: A global Express error handler catches all async errors; a 404 handler catches unknown routes.
