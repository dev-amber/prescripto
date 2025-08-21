import jwt from "jsonwebtoken";

// User authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      // 401 Unauthorized is the proper HTTP status code
      return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }

    // Verify token
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decoded.id;

    next(); // allow the request to continue
  } catch (error) {
    console.error("Auth error:", error.message);

    // Handle invalid or expired token
    return res.status(401).json({ success: false, message: "Invalid or expired token. Login again." });
  }
};

export default authUser;
