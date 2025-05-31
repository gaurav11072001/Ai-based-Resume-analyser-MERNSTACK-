module.exports = (req, res, next) => {
  // Check if user is admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
  }
};
