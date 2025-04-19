# Vegetable Ordering System

A full-stack web application for ordering fresh vegetables with user authentication, shopping cart functionality, order management, and admin capabilities.

## 🌱 Overview

This application allows users to browse and order vegetables online. It features a user-friendly interface, secure authentication, order tracking, and an admin panel for managing products and orders.

## ✨ Features

### User Features
- **User Authentication**: Register, login, and logout functionality
- **Product Browsing**: View all available vegetables with details
- **Shopping Cart**: Add items, adjust quantities, and view total
- **Order Placement**: Secure checkout with delivery details
- **Order Tracking**: Monitor order status (Pending, In Progress, Delivered)
- **Email Notifications**: Receive updates when order status changes

### Admin Features
- **Product Management**: Add, edit, and delete products
- **Order Management**: View all customer orders
- **Status Updates**: Change order status with automated customer notifications
- **User Management**: View registered users

## 🛠️ Tech Stack

### Frontend
- React.js
- Context API for state management
- Axios for API requests
- CSS for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose for database
- JWT for authentication
- Bcrypt.js for password hashing
- Nodemailer for email notifications

## 📋 Prerequisites

- Node.js (v14.0.0 or later)
- MongoDB account
- npm or yarn

## 🚀 Installation & Setup

### Clone the repository
```bash
git clone https://github.com/pratyek/grocery-app.git
cd grocery-app
```

### Backend setup
```bash
# Navigate to server directory (if applicable)
cd server

# Install dependencies
npm install

# Create .env file with the following variables
# PORT=5000
# MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.example.mongodb.net/vegetable_ordering_db
# JWT_SECRET=your_jwt_secret_key
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password

# Start the server
npm start
```

### Frontend setup
```bash
# Navigate to client directory (if applicable)
cd ../client

# Install dependencies
npm install

# Start the client
npm start
```

## 📊 Database Schema

### User
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (hashed)
- `role`: String (buyer or admin)

### Product
- `name`: String
- `description`: String
- `price`: Number
- `image`: String (URL)

### Order
- `orderId`: String (unique)
- `userId`: ObjectId (reference to User)
- `username`: String
- `products`: Array of product objects
- `totalAmount`: Number
- `status`: String (Pending, In Progress, Delivered)
- `deliveryDetails`: Object (address, phone)
- `createdAt`: Date

## 🌐 API Endpoints

### Authentication
- `POST /api/register`: Register a new user
- `POST /api/login`: Login a user
- `POST /api/logout`: Logout a user
- `GET /api/user`: Get current user details

### Products
- `GET /api/products`: Get all products
- `POST /api/products`: Add a new product (admin only)
- `DELETE /api/products/:id`: Delete a product (admin only)

### Orders
- `POST /api/orders`: Create a new order
- `GET /api/orders`: Get current user's orders
- `GET /api/admin/orders`: Get all orders (admin only)
- `PUT /api/orders/:id/status`: Update order status (admin only)

## 📷 Screenshots

*[Add screenshots of your application here]*

## ⚙️ Configuration

### Email Notifications
This application uses Nodemailer to send order status update emails to customers. To configure email functionality:

1. Set up your email provider (Gmail recommended for testing)
2. For Gmail, generate an App Password:
   - Go to Google Account > Security
   - Enable 2-Step Verification
   - Create an App Password for the application
3. Add credentials to your .env file

## 📈 Future Improvements

- Mobile app version
- Payment gateway integration
- Product categories and search functionality
- User reviews and ratings
- Delivery tracking with maps integration
- Subscription model for regular deliveries

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Node.js](https://nodejs.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
