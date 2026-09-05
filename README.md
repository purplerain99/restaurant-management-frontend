Vue 3 SPA frontend for the Restaurant Management System.

The frontend provides the customer QR ordering interface, shopping cart, permanent order slip, admin dashboard, order management, kitchen display system, role-based navigation, and realtime notifications.

---

## Tech Stack

- Vue 3
- Vite
- JavaScript
- Pinia
- Vue Router
- Axios
- Tailwind CSS
- Laravel Echo
- Pusher JS

---

# Features

## Customer

- QR table menu
- Category filtering
- Menu search
- Menu item cards
- Add to cart
- Quantity management
- Special notes
- Guest name
- Guest phone
- Order notes
- Cart persistence after refresh
- Multiple orders per table
- Permanent order slip
- Realtime order status

## Admin

- Admin dashboard
- Today's orders
- Today's sales
- Pending orders
- Orders dashboard
- Search orders
- Status filtering
- Date filtering
- Pagination
- Realtime new order notification badge
- Category management
- Menu management
- Table management
- QR code management
- Kitchen display

## Staff

- Orders
- Kitchen display
- Realtime order updates
- Cannot access admin-only management features

---

# Requirements

Install:

- Node.js 18+
- npm
- Git

The Laravel backend must also be running.

Backend:

```text
http://localhost:8000
Installation
1. Clone Repository
git clone https://github.com/YOUR_USERNAME/restaurant-management-frontend.git
cd restaurant-management-frontend
2. Install Dependencies
npm install
3. Create Environment File
Windows
copy .env.example .env
macOS / Linux
cp .env.example .env
.env.example
VITE_APP_API_URL=http://localhost:8000

VITE_REVERB_APP_KEY=restaurant-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http

The Reverb application key must match the backend:

REVERB_APP_KEY=restaurant-key
Run Development Server
npm run dev

Frontend:

http://localhost:5173
Production Build
npm run build

Preview:

npm run preview
Application URLs
Admin Login
http://localhost:5173/login
Admin Dashboard
http://localhost:5173/admin
Orders
http://localhost:5173/admin/orders
Kitchen
http://localhost:5173/admin/kitchen
Customer Table
http://localhost:5173/t/TBL_DEMO01
Order Slip
http://localhost:5173/t/TBL_DEMO01/order-success/ORD-20260905-0001/TRACKING_TOKEN
Demo Login
Email: admin@gmail.com
Password: password
Frontend Structure
src/
│
├── components/
│
├── layouts/
│   ├── AdminLayout.vue
│   └── CustomerLayout.vue
│
├── router/
│   └── index.js
│
├── services/
│   ├── axios.js
│   ├── echo.js
│   ├── dashboard.js
│   ├── order.js
│   ├── tables.js
│   └── ...
│
├── stores/
│   ├── auth.js
│   ├── cart.js
│   ├── notification.js
│   └── ...
│
└── views/
    ├── auth/
    ├── admin/
    └── customer/
Architecture

This frontend is a Vue 3 SPA.

Laravel is used only as the REST API backend.

Vue 3 SPA
    │
    ├── Vue Router
    ├── Pinia
    ├── Axios
    └── Laravel Echo
          │
          ↓
     Laravel API
          │
          ├── Sanctum
          ├── MySQL
          └── Reverb
Why SPA?

A SPA was selected instead of Inertia because the project requires a clear separation between frontend and backend.

Benefits:

Independent deployment
REST API reuse
Vue Router navigation
Pinia global state
Easier realtime integration
Future mobile/POS application support
Backend can serve multiple clients
Authentication

Authentication state is managed by:

Pinia

The API uses Laravel Sanctum tokens.

Login:

POST /api/v1/auth/login

Authenticated API requests contain:

Authorization: Bearer TOKEN
Route Protection

Admin routes require authentication.

Example:

/admin
/admin/orders
/admin/kitchen
/admin/menu
/admin/categories
/admin/tables

Customer routes are public:

/t/{table_code}
/t/{table_code}/cart
/t/{table_code}/order-success/{order_number}/{tracking_token}
Role Handling
Admin

Can access:

Dashboard
Orders
Kitchen
Categories
Menu
Tables
Staff

Can access:

Dashboard
Orders
Kitchen

Frontend route guards prevent unauthorized navigation.

Backend API authorization remains the final security layer.

Cart Persistence

Customer cart is managed by Pinia.

Cart data is stored in localStorage.

The storage key is table-specific:

restaurant_cart_{table_code}

Example:

restaurant_cart_TBL_DEMO01

Therefore refreshing the page does not remove the cart.

Customer Ordering
QR Code
   ↓
Table Menu
   ↓
Add Items
   ↓
Cart
   ↓
Guest Information
   ↓
Place Order
   ↓
Permanent Order Slip
Multiple Orders

Customers can create multiple orders from the same table.

Example:

/t/TBL_DEMO01

Order #1
ORD-20260905-0001

Order #2
ORD-20260905-0002

Order #3
ORD-20260905-0003

Each order is stored independently on the backend.

Permanent Order Slip

Order slip URL:

/t/{table_code}/order-success/{order_number}/{tracking_token}

Example:

/t/TBL_DEMO01/order-success/ORD-20260905-0001/trk_xxxxxxxxx

The slip loads order information from the backend, so refreshing the page does not lose the order.

Realtime

Realtime uses:

Laravel Echo
       +
Pusher JS
       +
Laravel Reverb
Realtime Events
New Order

Channel:

restaurant.orders

Event:

order.created

Used by:

Admin
Staff
Orders page
Dashboard
Notification badge
Kitchen Display
Order Status

Channel:

restaurant.orders

Event:

order.status.updated

Used by:

Orders dashboard
Kitchen
Admin
Staff
Customer Tracking

Channel:

orders.{tracking_token}

Used for customer order status updates.

Notification Badge

The admin header displays a realtime red notification badge.

Example:

🔔 1

Multiple new orders:

🔔 5

The notification store maintains:

notifications
notificationCount
unreadCount

Notification sound is not required.

Orders Dashboard

The Orders page supports:

Search

Search by:

Order number
Guest name
Guest phone
Table name
Status Filter
All
Pending
Confirmed
Preparing
Ready
Served
Completed
Cancelled
Date Filter
From Date
To Date
Pagination
10 / page
15 / page
25 / page
50 / page
Kitchen Display System

The Kitchen page contains:

Pending
Preparing
Ready

Order status flow:

Pending
   ↓
Confirmed
   ↓
Preparing
   ↓
Ready
   ↓
Served

Kitchen updates are broadcast through Laravel Reverb.

QR Ordering

Sample table code:

TBL_DEMO01

Sample customer URL:

http://localhost:5173/t/TBL_DEMO01

Scan the QR code to open the customer menu.

API Configuration

Backend API:

VITE_APP_API_URL=http://localhost:8000

The application sends requests to:

http://localhost:8000/api/v1
Reverb Configuration

Frontend:

VITE_REVERB_APP_KEY=restaurant-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http

Backend:

REVERB_APP_KEY=restaurant-key
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

The Reverb application key must match on both sides.

Development

Start the frontend:

npm run dev

Start the Laravel backend:

php artisan serve

Start the queue:

php artisan queue:work

Start Reverb:

php artisan reverb:start
Troubleshooting
API Connection Error

Check:

VITE_APP_API_URL=http://localhost:8000

Make sure Laravel is running:

php artisan serve
Realtime Not Working

Check:

VITE_REVERB_APP_KEY=restaurant-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080

Make sure Reverb is running:

php artisan reverb:start

And the Laravel queue worker is running:

php artisan queue:work
CORS Error

The Laravel backend must allow:

http://localhost:5173

The backend CORS configuration must allow:

broadcasting/auth
api/*
Build

Create production build:

npm run build

The output will be generated in:

dist/
License

For educational , demonstration purposes and junior interview.
