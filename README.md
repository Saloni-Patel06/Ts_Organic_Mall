<img width="1919" height="962" alt="products" src="https://github.com/user-attachments/assets/b72a7aa8-e4b5-46f2-ab39-04142915be12" /># 🛒 TS Organic Mall – MERN Stack E-Commerce Platform for Fruits & Vegetables

A modern full-stack grocery e-commerce web application built using **React, Node.js, Express, and MongoDB**.  
It supports dynamic product listing, cart management, authentication, and secure payment integration.

---

## 🌐 Live Links

- 🖥️ Frontend (Live Site): https://tsorganicmall.netlify.app/
- ⚙️ Backend API: https://ts-organic-mall-backend.onrender.com
- 📦 GitHub Repository: https://github.com/Saloni-Patel06/Ts_Organic_Mall

---

## 🚀 Features

### 🛍️ User Features
- Dynamic product listing (Fruits & Vegetables)
- Category-wise filtering system
- Real-time search functionality
- Add to cart / increase / decrease quantity
- Stock validation system
- Live cart counter
- Fully responsive UI (Mobile + Desktop)

### ⚙️ System Features
- REST API architecture (Node.js + Express)
- MongoDB database integration
- Modular and reusable React components
- Centralized image management system
- Secure authentication system (JWT-based)
- Production deployment (Netlify + Render)

---

## 🧰 Tech Stack

### 🎨 Frontend
- React.js
- React Router DOM
- Bootstrap
- Custom CSS / SCSS

### ⚙️ Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- REST API

### 🚀 Deployment
- Netlify (Frontend)
- Render (Backend)
- GitHub (Version Control)

---

## 💳 Payment Integration
- Razorpay payment gateway integration
- Secure payment verification system
- Order status tracking

---

## 🔐 Authentication
- JWT-based login system
- Secure password hashing
- Role-based access control (User / Admin / Agent)

---
## 🖥️ Project Screenshots

### 🏠 Home Page
<img width="1917" height="966" alt="HomePage" src="https://github.com/user-attachments/assets/7c153a24-fea9-4667-bed0-d57cc32d9d24" />


### 🛍️ Product Page
<img width="1919" height="962" alt="products" src="https://github.com/user-attachments/assets/3edeb1b3-d3cf-4679-aa87-388a66426921" />


### 🛒 Cart Page
<img width="1920" height="1080" alt="Screenshot (163)" src="https://github.com/user-attachments/assets/254309bf-28fa-42f0-aceb-649277a58f59" />



## 📁 Project Structure

ts-organic-mall/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── mail.js
│   ├── controllers/
│   │   ├── agentregController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── contactController.js
│   │   ├── orderController.js
│   │   ├── ordercompletedController.js
│   │   ├── productController.js
│   │   ├── supportController.js
│   │   ├── userController.js
│   │   ├── verifyPaymentController.js
│   │   ├── walletController.js
│   │   └── withdrawController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── razorpay.js
│   │   └── validationMiddleware.js
│   ├── routes/
│   │   ├── agentregRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── ordercompletedRoutes.js
│   │   ├── productRoutes.js
│   │   ├── supportRoutes.js
│   │   ├── userRoutes.js
│   │   ├── verifyPaymentRoutes.js
│   │   ├── walletRoutes.js
│   │   └── withdrawRoutes.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── otp.js
│   │   └── sendEmail.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── css/
│   │   ├── js/
│   │   ├── lib/
│   │   └── img/
│   │       ├── Fruits/
│   │       └── Vegetables/
│   ├── src/
│   │   ├── components/
│   │   ├── Context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── scss/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── README.md
└── TODO.md
