### Project Name : Vehicle Rental System – Backend API

GitHub Repo: [Repo Link](https://github.com/sujonbiswasdev/nextlevel-assignment-2.git)

Live URL = [Repo Link](https://nextlevel-assignment-2.vercel.app)

##  Features
### Authentication & Authorization
- User Signup & Login (JWT based)
- Password hashing using bcrypt
- Role-based access control (Admin & Customer)

### Vehicle Management
- POST – Add new vehicle (Admin only)
- GET – Get all vehicles (Public)
- GET – Get single vehicle by ID (Public)
- PUT – Update vehicle (Admin only)
- DELETE – Delete vehicle (Admin only)
### User Management
 - GET – All users (Admin only)
 - PUT – Update user (Admin or Own)
 - DELETE – Delete user (Admin only)
### Booking System
- Create booking (Admin/Customer)
- GET – Get bookings (Admin = all bookings, Customer = own bookings)
- PUT – Update booking status (Role-based: Admin/Customer)
## Technology Stack
####  **Backend**
- Node.js  
- TypeScript  
- Express.js
#### **Database**
- PostgreSQL 
#### **Security**
- bcrypt (Password Hashing)  
- JWT (Authentication)

### Setup & Usage Instructions
### Step 1. Clone the Repository
```bash
git clone https://github.com/sujonbiswasdev/nextlevel-assignment-2.git
cd nextlevel-assignment-2
```
### Step 2. Install Dependencies
```bash
npm install
```
### Step 3. Setup Environment Variables
Create .env file:
```env
PORT=5000
DATABASE_URL=your_postgres_connection_url
JWT_secret=your_jwt_secret

```

### Step 4. Run Application
```bash
npm run dev
```

