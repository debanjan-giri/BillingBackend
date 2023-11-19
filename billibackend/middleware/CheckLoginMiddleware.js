import jwt from "jsonwebtoken";

const CheckLogin = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

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

    // create request.tokendetails and give decode data
    req.tokenDetails = decoded;
    next();
  });
};

export default CheckLogin;
