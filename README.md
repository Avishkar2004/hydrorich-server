# Hydrorich Server

This is the backend server for Hydrorich, built with Node.js, Express, and MySQL. The server provides RESTful APIs, real-time communication, and handles all business logic for the Hydrorich application.

## Prerequisites

- Node.js (v20 or higher)
- Docker and Docker Compose
- MySQL 8.0
- Redis

## Tech Stack

- Node.js with Express
- MySQL (via Sequelize ORM)
- Redis (for caching and session management)
- Socket.io (for real-time communication)
- Passport.js (for authentication)
- Multer (for file uploads)
- Cloudinary (for image storage)
- PDFKit (for invoice generation)

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/Avishkar2004/hydrorich-server
cd server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the server directory with the following variables:

```env
NODE_ENV=development
PORT=8080

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hydrorich
DB_PORT=3307

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (if using nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

4. **Start with Docker**

```bash
docker-compose up --build
```

This will start:

- Node.js application on port 8080
- MySQL database on port 3307
- Redis server on port 6379

5. **Start without Docker (Development)**

```bash
npm run dev
```

## Database Setup Manually

The application uses MySQL as the database. Follow these steps to set up the database manually:

1. **Create Database**

```sql
CREATE DATABASE IF NOT EXISTS hydrorich;
USE hydrorich;
```

2. **Create Users Table**

```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    provider ENUM("local" , "google") DEFAULT "local",
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **Create Products Table**

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_sales INT DEFAULT 0
);
```

4. **Create Product Variants Table**

```sql
CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    variant_name VARCHAR(255),
    unit VARCHAR(50),
    quantity DECIMAL(10, 2),
    price DECIMAL(10, 2),
    discount_percent INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

5. **Create Dosages Table**

```sql
CREATE TABLE dosages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT,
    dosage_per_unit VARCHAR(255),
    usage_instructions TEXT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);
```

6. **Create Product Photos Table**

```sql
CREATE TABLE product_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image_url VARCHAR(500),
    alt_text VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

7. **Create Cart Table**

```sql
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    product_id INT,
    variant_id INT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);
```

8. **Create Wishlist Table**

```sql
CREATE TABLE wishlist (
    id VARCHAR(250) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(255),
    product_id INT,
    variant_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);
```

9. **Create Orders Table**

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    shipping_address JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

10. **Create Order Items Table**

```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);
```

11. **Create Messages Table**

```sql
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

12. **Insert Initial Categories**

```sql
INSERT INTO categories (name) VALUES
('plantgrowthregulator'),
('organicFertilizers'),
('micronutrient'),
('Insecticide'),
('Fungicide');
```

13. **Set this User as a Admin**

```sql
UPDATE users SET role = 'admin' WHERE email = 'avishkarkakde2004@gmail.com';
```

### Sample Data

You can find sample data insertion queries in the `db.txt` file in the server directory. These include:

- Sample products
- Product variants
- Dosage information
- Product photos
- Sample orders and cart items

To insert sample data, you can copy and execute the relevant INSERT statements from the `db.txt` file.

### Database Configuration

Update your `.env` file with the following database configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hydrorich
DB_PORT=3307
```

Note: Make sure to use the correct port (3307) as specified in the docker-compose.yml file.

## Available Scripts

- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (when implemented)

## API Documentation

### Authentication Routes

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/google` - Google OAuth login
- POST `/api/auth/logout` - Logout user

### Product Routes

- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin only)
- PUT `/api/products/:id` - Update product (Admin only)
- DELETE `/api/products/:id` - Delete product (Admin only)

### Order Routes

- GET `/api/orders` - Get user orders
- POST `/api/orders` - Create order
- GET `/api/orders/:id` - Get order details
- PUT `/api/orders/:id/status` - Update order status (Admin only)

### Chat Routes

- GET `/api/messages` - Get chat messages
- POST `/api/messages` - Send message
- GET `/api/messages/:userId` - Get conversation

## Project Structure

```
server/
├── config/                    # Configuration files
│   ├── db.js                 # Database configuration
│   ├── passport.js           # Passport.js authentication config
│   └── redis.js             # Redis configuration
├── controllers/              # Route controllers
│   ├── authController.js
│   ├── cartController.js
│   ├── contactController.js
│   ├── invoiceController.js
│   ├── messageController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── products.js
│   └── wishlistController.js
├── middleware/               # Custom middleware
│   ├── adminAuth.js         # Admin authentication
│   ├── auth.js              # User authentication
│   ├── multer.js           # File upload handling
│   ├── rateLimiter.js      # Rate limiting
│   └── redisCache.js       # Redis caching
├── models/                  # Database models
│   ├── allProductsModel.js
│   ├── cartModel.js
│   ├── FungicideModel.js
│   ├── index.js
│   ├── InsecticodeModel.js
│   ├── message.js
│   ├── messageModel.js
│   ├── micronutrient.js
│   ├── orderModel.js
│   ├── organicFertilizer.js
│   ├── pgr.js
│   ├── Product.js
│   ├── statsModel.js
│   ├── userModel.js
│   └── wishlistModel.js
├── routes/                  # API routes
│   ├── adminRoutes.js
│   ├── allProductsRoute.js
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── contactRoutes.js
│   ├── fungicideRoute.js
│   ├── InsecticideRoutes.js
│   ├── invoiceRoutes.js
│   ├── messageRoutes.js
│   ├── MicronutrientRoutes.js
│   ├── orderRoutes.js
│   ├── organicRoutes.js
│   ├── pgrRoute.js
│   ├── productRoutes.js
│   └── wishlistRoutes.js
├── utils/                   # Utility functions
│   ├── cloudinary.js       # Cloudinary configuration
│   ├── invoiceGenerator.js # PDF invoice generation
│   ├── redisSession.js     # Redis session handling
│   ├── validateContact.js  # Contact form validation
│   └── validateUser.js     # User input validation
├── docker-compose.yml      # Docker configuration
├── Dockerfile             # Docker build file
├── index.js              # Application entry point
├── package.json          # Project dependencies
└── socket.js            # Socket.io configuration
```

## Docker Support

The application includes a `docker-compose.yml` file that sets up:

- Node.js application container
- MySQL database container
- Redis container

All services are configured to work together out of the box.

## Security Features

- Rate limiting
- Session management
- JWT authentication
- Input validation
- File upload restrictions
- CORS configuration

## Error Handling

The application includes centralized error handling with custom error classes and middleware.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
