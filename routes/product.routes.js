const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const {
  cacheMiddleware,
  invalidateCacheMiddleware,
} = require("../middleware/cache.middleware");

// GET endpoints wrapped with cacheMiddleware (Route -> Middleware -> Controller -> Service -> Database)
router.get("/", cacheMiddleware, (req, res) =>
  productController.getAllProducts(req, res),
);
router.get("/:id", cacheMiddleware, (req, res) =>
  productController.getProductById(req, res),
);

// Mutating endpoints with cache invalidation (Route -> Middleware -> Controller -> Service -> Database)
router.post("/", invalidateCacheMiddleware, (req, res) =>
  productController.createProduct(req, res),
);
router.put("/:id", invalidateCacheMiddleware, (req, res) =>
  productController.updateProduct(req, res),
);
router.patch("/:id", invalidateCacheMiddleware, (req, res) =>
  productController.updateProduct(req, res),
);
router.delete("/:id", invalidateCacheMiddleware, (req, res) =>
  productController.deleteProduct(req, res),
);

module.exports = router;