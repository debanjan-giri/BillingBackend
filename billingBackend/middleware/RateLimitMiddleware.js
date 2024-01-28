import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // handle 100 requests within 15 min
  message: "Your Limit Exceed",
});

export default limiter;
