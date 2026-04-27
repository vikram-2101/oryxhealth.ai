/**
 * requireRole — composable route-level role guard.
 *
 * Usage:
 *   router.get('/customers', protect, requireRole('super_admin'), customerController.getAll);
 *   router.get('/users',     protect, requireRole('super_admin', 'account', 'institution'), userController.getAll);
 *
 * Must be used AFTER the `protect` middleware so that req.userRole is available.
 */
export const requireRole = (...allowedRoles) =>
  (req, res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
