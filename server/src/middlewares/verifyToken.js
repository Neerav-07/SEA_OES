/**
 * verifyToken middleware
 * Validates the JWT access token from Authorization header or cookie.
 * Attaches decoded payload to req.auth for downstream use.
 */
import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;

  if (!token) return res.status(401).json({ message: 'Access token is required.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'access') return res.status(401).json({ message: 'Invalid token type.' });
    req.auth = decoded; // { userId, email, name, plan, platformRole, type, iat, exp }
    return next();
  } catch {
    return res.status(401).json({ message: 'Access token is invalid or expired.' });
  }
}

/**
 * V2: requireRole middleware
 * Use to restrict routes to specific platform roles.
 *
 * Usage:
 *   router.get('/admin/overview', verifyToken, requireRole('ADMIN'), handler);
 *   router.get('/my/profile', verifyToken, requireRole('EMPLOYEE', 'ADMIN'), handler);
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.auth?.platformRole || 'EMPLOYEE';
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${role}.`,
      });
    }
    return next();
  };
}
