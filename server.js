const express = require('express');
const productRoutes = require('./routes/product.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root endpoint: API overview
app.get('/', (req, res) => {
  res.json({
    name: 'ASD Workshop API',
    description: 'Product Catalog Management Service with In-Memory Caching',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      getAllProducts: 'GET /products',
      getProductById: 'GET /products/:id',
      createProduct: 'POST /products',
      updateProduct: 'PUT /products/:id or PATCH /products/:id',
      deleteProduct: 'DELETE /products/:id',
    },
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Product routes
app.use('/products', productRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
  });
}

module.exports = app;