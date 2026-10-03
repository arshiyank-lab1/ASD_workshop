const express = require('express');
const productRoutes = require('./routes/product.routes');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use('/products', productRoutes);
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/products`);
});