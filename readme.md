# ASD Workshop — Product Catalog API

> **Author**: Mohammad Arshiyan ([@arshiyank-lab1](https://github.com/arshiyank-lab1))  
> **Course/Workshop**: Agile & Software Development (ASD) Workshop  
> **Stack**: Node.js, Express 5, In-Memory Caching, File-based JSON Database

---

## 📌 Project Overview

This repository contains a RESTful Product Catalog Service built with **Express.js**. The application follows a clean layered architecture, incorporating:
- **Layered Architecture**: Clear separation of concerns between Controllers, Services, and Database layers.
- **In-Memory Caching Middleware**: Custom caching layer with Time-To-Live (TTL = 60s), cache hit/miss tracking via `X-Cache` headers, and automatic cache invalidation on write operations (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Input Validation & Error Handling**: Comprehensive request payload and route parameter validation returning appropriate HTTP status codes (200, 201, 204, 400, 404, 500).
- **Automated Test Suite**: Integration tests covering all CRUD endpoints, input validation, and caching behavior.

---

## 🏗️ Architecture & Project Structure

```
ASD_workshop/
├── controllers/
│   └── product.controller.js   # Request handling, input validation, and response formatting
├── database/
│   └── database.js             # File system data access layer (CRUD on db.json)
├── middleware/
│   └── cache.middleware.js      # In-memory caching middleware with TTL & cache clearing
├── routes/
│   └── product.routes.js       # Express router definitions
├── services/
│   └── product.service.js      # Business logic layer
├── .gitignore                  # Git ignore rules (node_modules, logs, etc.)
├── db.json                     # JSON database file
├── package.json                # Project dependencies and npm scripts
├── readme.md                   # Project documentation
├── server.js                   # Application entry point and server startup
└── test.js                     # Automated test suite
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/arshiyank-lab1/ASD_workshop.git
cd ASD_workshop
npm install
```

### 3. Running the Server

#### Production / Standard Start:
```bash
npm start
```

#### Development (Auto-reload with nodemon):
```bash
npm run server
```

The server will be available at: `http://localhost:3000`

---

## 🧪 Running Tests

An automated test suite is included to verify all API endpoints, validation logic, and cache headers:

```bash
npm test
```

### Test Coverage:
1. `GET /` - Root API overview
2. `GET /health` - Health check status
3. `GET /products` - Cache MISS verification
4. `GET /products` - Immediate second call Cache HIT verification (`X-Cache: HIT`)
5. `POST /products` - Input validation rejection with `400 Bad Request`
6. `POST /products` - Product creation (`201 Created`) and cache invalidation
7. `GET /products/:id` - Fetching product by ID
8. `PUT /products/:id` - Updating product data
9. `DELETE /products/:id` - Deleting product (`204 No Content`) and `404` confirmation

---

## 📖 API Documentation

### Base Endpoints

| Method | Endpoint | Description | Cacheable |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API service overview and available routes | No |
| `GET` | `/health` | Server health check and uptime status | No |

### Product Endpoints

| Method | Endpoint | Description | Cacheable | Cache Invalidation |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | Retrieve all products | Yes (`X-Cache: HIT/MISS`) | No |
| `GET` | `/products/:id` | Retrieve product by ID | Yes (`X-Cache: HIT/MISS`) | No |
| `POST` | `/products` | Create a new product | No | Yes (Clears cache) |
| `PUT` | `/products/:id` | Update product details | No | Yes (Clears cache) |
| `PATCH` | `/products/:id` | Partial update product details | No | Yes (Clears cache) |
| `DELETE` | `/products/:id` | Delete product by ID | No | Yes (Clears cache) |

---

## 💡 Example Requests

### 1. Health Check
```bash
curl -i http://localhost:3000/health
```
**Response (200 OK):**
```json
{
  "status": "UP",
  "uptime": 12.34,
  "timestamp": "2026-10-04T01:05:00.000Z"
}
```

### 2. Get All Products (Inspect Cache Header)
```bash
curl -i http://localhost:3000/products
```
**Headers:**
```http
HTTP/1.1 200 OK
X-Cache: MISS (first call) / X-Cache: HIT (subsequent calls within 60s)
Content-Type: application/json; charset=utf-8
```

### 3. Create Product
```bash
curl -i -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Mechanical Keyboard", "price": 79.99}'
```
**Response (201 Created):**
```json
{
  "id": 1791057565063,
  "name": "Mechanical Keyboard",
  "price": 79.99
}
```

### 4. Update Product
```bash
curl -i -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 44.99}'
```

### 5. Delete Product
```bash
curl -i -X DELETE http://localhost:3000/products/1
```
**Response (204 No Content)**

---

## ⚡ Caching Behavior

- **Storage**: In-memory key-value cache keyed by `req.originalUrl || req.url`.
- **TTL**: Entries expire automatically after 60,000 ms (1 minute).
- **Header**: Every cache-enabled response includes the `X-Cache` header:
  - `X-Cache: HIT`: Response served instantly from memory without database lookup.
  - `X-Cache: MISS`: Response loaded from database and stored in cache.
- **Eviction / Invalidation**: Whenever a product is created, updated, or deleted, `clearCache()` is triggered, ensuring stale data is never served.

---

## 📄 License

ISC License
