const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.id;
        req.role = decoded.role; 

         return next();

    } catch (error) {
      console.error(error.message);
      return res.status(401).json({
        message: "Token not valid",
      });
    }
  }
  return res.status(401).json({
    success: false,
    message: "No token provided",
  });
  
};

module.exports = authMiddleware;

