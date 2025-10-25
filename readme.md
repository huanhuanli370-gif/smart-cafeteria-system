
# 333 - Smart Cafeteria System

## Member information

- Huanhuan Li & 25000360 & Team Leader & 3459731470@qq.com
- Xiaoyu Li & 24006086 & Frontend & Lxy050904@qq.com
- Bingqi Yao & 24005067 & Backend & 2784323362@qq.com
- Xin Zhang & 25021747 & Backend & 2665004983@qq.com
- Zihao Li & 24005065 & Frontend & 3082732552@qq.com

A **Full-Stack Smart Cafeteria System** that provides a seamless digital dining experience for students, faculty, and cafeteria staff. 
It includes real-time order management, menu browsing, admin menu editing, AI chatbot assistance, and role-based access control.

---

## 📋 1. Project Overview

**Project Name:** Smart Cafeteria System 
**Goal:** Digitize the cafeteria workflow with real-time order tracking, secure authentication, and intelligent user assistance.

This project delivers a **complete end-to-end solution**:
- Customers can browse menus, add items to a cart, and place orders.
- Kitchen staff receive and complete orders.
- Admins can manage menus and system data.
- Faculty members automatically receive discounts.
- **AI Assistant powered by Gemini** helps users with interactive, context-aware conversations.

---

## ⚙️ 2. Tech Stack

### **Frontend (Mobile App)**
- **React Native (Expo)**
- **React Navigation**
- **Axios**
- **Ionicons (via @expo/vector-icons)**
- **AsyncStorage / SecureStore** for token persistence
- **Gemini API (Google Generative AI)** for intelligent chatbot responses

### **Backend**
- **Node.js + Express.js**
- **MySQL (mysql2/promise)**
- **Socket.IO** for real-time order notifications
- **JWT (jsonwebtoken)** for authentication
- **bcryptjs** for password hashing
- **dotenv** for environment configuration

### **Database**
- MySQL  
  - Tables: `users`, `menus`, `orders`  
  - Includes seeding and reset scripts for easy initialization

---

## 🗂️ 3. Project Structure


```

project-root/
├── backend/
│   ├── index.js                # Server entry point
│   ├── routes/
│   │   ├── menus.js            # Menu CRUD + Search
│   │   ├── orders.js           # Place order, complete order, list orders
│   │   └── auth.js             # Login, user profile, JWT auth
│   ├── middlewares/
│   │   └── auth.js             # Role-based access control middleware
│   └── db/
│       ├── db.js               # MySQL connection pool
│       ├── resetDB.js          # Recreate all tables
│       └── dataSeed.js         # Insert demo users, menus, orders
│
└── frontend/
├── App.js                  # Root component & AuthProvider
├── context/
│   └── AuthContext.js      # JWT storage, login/logout, user state
├── lib/
│   └── api.js              # Axios instance with token interceptor
├── navigation/
│   ├── AppNavigator.js     # Dynamic navigation based on user role
│   ├── OrderStack.js
│   ├── KitchenStack.js
│   ├── SettingStack.js
│   ├── AIStack.js
│   └── AuthStack.js
├── screens/
│   ├── LoginScreen.js
│   ├── OrderPage.js
│   ├── KitchenPage.js
│   ├── SettingPage.js
│   ├── OrderStatusPage.js
│   ├── OrderHistoryPage.js
│   ├── OrderDetailPage.js
│   ├── ProfileDetail.js
│   ├── MenuEditorPage.js
│   └── AIScreen.js         # Gemini-powered AI Chat Assistant
└── components/
└── SearchBar.js

```
---

## 🚀 4. Setup Instructions

### 🧩 Prerequisites
- Node.js (v18+)
- MySQL running locally
- Expo CLI (`npm install -g expo-cli`)
- npm or yarn

---

### 🖥️ Backend Setup

```bash
cd backend
npm install

```

#### Configure Environment (.env)

```
PORT=3000
DB_HOST=localhost
DB_USER=cafeteria_user
DB_PASS=cafeteria_pass
DB_NAME=cafeteria
JWT_SECRET=supersecret_change_me
TOKEN_EXPIRES=7d
RESET_DB=false   # Set true for initial schema + seed

```

#### Start the server

```
npm run dev
# or
node index.js

```

------

### 📱 Frontend Setup

```
cd frontend
npm install

```

#### Environment (.env)

```
API_BASE=http://<your-local-IP>:3000
GEMINI_API_KEY=your_google_gemini_api_key

```

> ⚠️ Use your LAN IP for Expo real device testing.

#### Run the app

```
npx expo start -c

```

------

## 💡 5. Key Features

### 👩‍🎓 Student / Faculty

- Browse menus (real-time)
- Add / remove items from cart
- Faculty users receive 20% discount automatically
- Place orders and track order status
- View order history and details

### 👨‍🍳 Kitchen Staff

- View current (`preparing`) and completed (`done`) orders
- Mark orders as completed (`PUT /api/orders/:id/complete`)
- SectionList UI for grouped orders
- Final price display for accurate billing

### 👨‍💼 Admin

- Manage menu items (create / edit / delete)
- Inline editing with dirty-state tracking
- Add new dishes with image, category, and stock
- Real-time refresh after operations
- Role-based API security

### 🔔 Real-Time Notifications

- WebSocket system (Socket.IO)
- Users receive *“Kitchen has read your order”* notification
- Kitchen page auto-updates on order completion

### 🤖 AI Assistant (Gemini Integration)

- Fully functional **AI Chat Assistant**
- Built with **Google Gemini API**
- Context-aware responses with current order or menu context
- Located in a dedicated **AI Assistant tab** in the navigation bar
- Can answer questions like:
  - “What’s today’s most popular dish?”
  - “Show me vegetarian options.”
  - “How long will my order take?”
  - “What’s in the Chicken Teriyaki Bowl?”

------

## 🧱 6. Database Schema (Simplified)

| Table      | Columns                                  |
| ---------- | ---------------------------------------- |
| **users**  | id, name, email, password (hashed), role |
| **menus**  | id, name, description, price, image, category, stock, is_available |
| **orders** | id, items (JSON), status, customer_id, customer_name, original_price, discount, final_price, is_viewed, created_at |

------

## 🔐 7. Authentication & Roles

| Role              | Access                                   |
| ----------------- | ---------------------------------------- |
| Student / Faculty | Browse menus, place orders, view history |
| Staff             | View / complete orders                   |
| Admin             | Manage menus, users, and orders          |
| Guest             | Read-only menus                          |

**JWT-based authentication**
Frontend stores tokens securely and attaches them to all Axios requests.
401 responses trigger logout and redirect to the login page.

------

## 🌐 8. API Endpoints

| Method | Endpoint                   | Description           | Auth        |
| ------ | -------------------------- | --------------------- | ----------- |
| GET    | `/api/health`              | Health check          | Public      |
| POST   | `/api/auth/login`          | Login & get JWT       | Public      |
| GET    | `/api/auth/me`             | Get current user info | ✅           |
| GET    | `/api/menus?q=keyword`     | Get or search menu    | Public      |
| POST   | `/api/menus`               | Add new menu item     | Admin       |
| PUT    | `/api/menus/:id`           | Edit menu item        | Admin       |
| DELETE | `/api/menus/:id`           | Delete menu item      | Admin       |
| GET    | `/api/orders`              | Get all orders        | Staff/Admin |
| POST   | `/api/orders`              | Submit new order      | Auth        |
| PUT    | `/api/orders/:id/complete` | Mark as completed     | Staff/Admin |

------

## 🧰 9. Development Notes

- **AI Integration:** Uses Gemini REST API for conversational context.
- **API Client (lib/api.js)** handles JWT token injection & global error handling.
- **AuthContext** manages login persistence and user role switching.
- **RESET_DB** enables one-click schema rebuild for testing.
- **UI:** iOS-style design with tabs, cards, and animations.

------

## 🧭 10. Troubleshooting

### ❌ MySQL Access Denied

```
CREATE USER 'cafeteria_user'@'localhost' IDENTIFIED BY 'cafeteria_pass';
GRANT ALL PRIVILEGES ON cafeteria.* TO 'cafeteria_user'@'localhost';
FLUSH PRIVILEGES;
```

### ⚠️ Expo Metro Cache Issues

```
npx expo start -c
```

### ⚙️ Reinstall Node Modules (Windows)

```
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npx expo start -c
```
