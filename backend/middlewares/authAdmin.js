import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }

    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // ✅ Now check if email and password match
    if (
      decoded.email !== process.env.ADMIN_EMAIL ||
      decoded.password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ success: false, message: "Not authorized. Login again." });
    }

    // Optional: attach admin info to request object
    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authAdmin;
