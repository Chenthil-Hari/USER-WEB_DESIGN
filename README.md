# User-Seller Platform

A web application for managing products with role-based access control for Users, Sellers, and Admins.

## Features

- **User Role**: Submit product details with budget
- **Admin Role**: Review products, modify budgets, and approve/reject products
- **Seller Role**: View approved products with admin-modified budgets and receive notifications
- **Authentication**: Separate login pages for each role
- **Notifications**: Sellers receive notifications when admin modifies budgets
- **Protected Routes**: Role-based access control

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Users
1. Go to `/login/user` or click "Login as User" on the home page
2. Register a new account or login
3. Submit product details with your budget
4. View your submitted products and their status

### For Sellers
1. Go to `/login/seller` or click "Login as Seller" on the home page
2. Register a new account or login
3. View approved products with admin-modified budgets
4. Receive notifications when new products are approved

### For Admins
1. Go to `/login/admin` or click "Login as Admin" on the home page
2. Register a new account or login
3. View all pending products
4. Modify budgets and approve/reject products
5. Sellers will be automatically notified when you approve a product

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `users.json` - User accounts
- `products.json` - Product submissions
- `notifications.json` - Seller notifications

## Security Note

This is a development application. For production use:
- Change the JWT_SECRET in `lib/auth.ts` or use an environment variable
- Use a proper database instead of JSON files
- Implement additional security measures






