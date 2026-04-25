const { getUserFromToken } = require("../services/authService");

async function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = await getUserFromToken(token, "-password");
    next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({ message: error.message || "Invalid authorization token" });
  }
}

module.exports = { protect };
