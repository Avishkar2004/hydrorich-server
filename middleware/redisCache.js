import redisClient from "../config/redis.js";

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store original res.json
      const originalJson = res.json;

      // Override res.json method
      res.json = function (body) {
        // Store in cache
        redisClient.setEx(key, duration, JSON.stringify(body));

        // Call original res.json
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error("Redis Cache Error:", error);
      next();
    }
  };
};

export default cacheMiddleware;
