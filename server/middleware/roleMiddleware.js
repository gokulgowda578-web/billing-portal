// Middleware factory for Role-Based Access Control (RBAC)
// Usage: authorize('admin') or authorize('admin', 'finance')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not permitted to access this resource.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
