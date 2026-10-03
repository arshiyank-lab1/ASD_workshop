const cache = {};
const TTL_MS = 60 * 1000; // 1 minute TTL in milliseconds

const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl || req.url;
  const cachedItem = cache[key];

  if (cachedItem) {
    const isExpired = Date.now() - cachedItem.createdAt > TTL_MS;
    if (!isExpired) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedItem.data);
    } else {
      // Expired entry: evict from cache and fetch fresh data from database
      delete cache[key];
    }
  }

  res.setHeader('X-Cache', 'MISS');
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache[key] = {
        data: body,
        createdAt: Date.now(),
      };
    }
    return originalJson.call(this, body);
  };
  next();
};

const clearCache = () => {
  Object.keys(cache).forEach((key) => delete cache[key]);
};

// Middleware to invalidate cache on successful POST, PUT, PATCH, DELETE operations
const invalidateCacheMiddleware = (req, res, next) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 400) {
      clearCache();
    }
  });
  next();
};

module.exports = {
  cache,
  TTL_MS,
  cacheMiddleware,
  clearCache,
  invalidateCacheMiddleware,
};