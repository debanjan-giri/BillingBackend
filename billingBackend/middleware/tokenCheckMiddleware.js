import jwt from "jsonwebtoken";

const tokenCheck = (req, res, next) => {
  const token = req.headers.authorization;

  // Check the token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is missing",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Check specific errors
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }

      // error responce
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // send decoded data to next middleware
    req.tokenDetails = decoded;
    next();
  });
};

export default tokenCheck;
