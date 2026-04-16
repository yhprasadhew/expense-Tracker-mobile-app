
import ratelimiter from "../config/upstash.js";

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // 🔥 FIX: correct IP detection (works for mobile + web)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const { success } = await ratelimiter.limit(ip);

    if (!success) {
      return res.status(429).json({
        error: "Too many requests, please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export default rateLimiterMiddleware;