/**
 * Lightweight admin protection for write operations (POST/PUT/PATCH/DELETE)
 * on the admin-only routes. The dashboard sends the key in the
 * "x-admin-key" header on every request; it's set once in admin.html
 * and cached in localStorage.
 *
 * NOTE: This is intentionally simple for a single-owner boutique app.
 * For a multi-staff production deployment, replace this with proper
 * session/JWT-based authentication (e.g. express-session + bcrypt, or
 * a JWT issued after a real login form).
 */
function adminAuth(req, res, next) {
  const providedKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    console.warn('⚠️  ADMIN_KEY is not set in .env — admin routes are unprotected!');
    return next();
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid or missing admin key.' });
  }

  next();
}

module.exports = adminAuth;
