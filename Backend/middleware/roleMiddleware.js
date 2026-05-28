/**
 * Role-based access control middleware
 * Restricts access to routes based on user roles
 */

/**
 * Check if user has required role
 * @param {String|Array} roles - Required role(s) to access the route
 * @returns {Function} Middleware function
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // Ensure user exists (should be added by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user found'
      });
    }

    // Convert roles parameter to array if it's a string
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has any of the required roles
    const hasRole = req.user.roles.some(role => requiredRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized, insufficient role permissions'
      });
    }

    next();
  };
};

/**
 * Check if user's active role matches required role
 * @param {String|Array} roles - Required active role(s) to access the route
 * @returns {Function} Middleware function
 */
const checkActiveRole = (roles) => {
  return (req, res, next) => {
    // Ensure user exists (should be added by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user found'
      });
    }

    // Convert roles parameter to array if it's a string
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user's active role is one of the required roles
    if (!requiredRoles.includes(req.user.activeRole)) {
      return res.status(403).json({
        success: false,
        message: `This action requires ${requiredRoles.join(' or ')} role`
      });
    }

    next();
  };
};

module.exports = {
  checkRole,
  checkActiveRole
};