import jwt from "jsonwebtoken";

// Doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    // Get token from header
    const dtoken = req.headers.dtoken || req.headers["authorization"]?.split(" ")[1];

    if (!dtoken) {
      return res.status(401).json({ success: false, message: "Not authorized. Token missing." });
    }

    // Verify token
    const token_decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

    // Attach doctor ID to request object
    req.doctor = { id: token_decoded.id };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Login again." });
    }

    return res.status(401).json({ success: false, message: "Invalid token. Login again." });
  }
};

export default authDoctor;
