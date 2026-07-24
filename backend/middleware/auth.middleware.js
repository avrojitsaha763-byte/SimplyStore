import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const auth = req.headers.authorization || (req.query.token ? `Bearer ${req.query.token}` : null);
    if (auth?.startsWith("Bearer ")) {
        try {
            req.user = jwt.verify(auth.split(" ")[1], JWT_SECRET);
            return next();
        } catch {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    return res.status(401).json({ message: "Not authorized, no token" });
};

export const adminOnly = (req, res, next) =>
    req.user?.role === "admin"
        ? next()
        : res.status(403).json({ message: "Admin only" });

export const vendorOnly = (req, res, next) =>
    req.user?.role === "vendor" || req.user?.role === "admin"
        ? next()
        : res.status(403).json({ message: "Vendor access only" });