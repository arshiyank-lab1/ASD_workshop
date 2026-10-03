const cache = {};
const TTL_MS = 60 * 1000; 
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl || req.url;
  const cachedItem = cache[key];
  if (cachedItem) {
    const isExpired = Date.now() - cachedItem.createdAt > TTL_MS;
    if (!isExpired) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedItem.data);
    } else {
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
module.exports = {
  cacheMiddleware,
  clearCache,
};