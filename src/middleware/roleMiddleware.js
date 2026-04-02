

const isOwner = (req, res, next) => {
 
  if (req.role !== "owner") {
    return res.status(403).json({ message: "Access denied. Owners only." });
  }
  next();
};

const isMember = (req, res, next) => {

  if (req.role !== "member") {
    return res.status(403).json({ message: "Access denied. Members only." });
  }
  next();
};

// for routes accessible by multiple roles
const isAny = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${roles.join(", ")}`
      });
    }
    next();
  };
};

module.exports = { isOwner, isMember, isAny };