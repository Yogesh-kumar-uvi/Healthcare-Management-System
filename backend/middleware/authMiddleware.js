import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const isUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Auth failed, no token", success: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if (err) {
            return res.status(401).json({ message: "Auth failed", success: false });
        }
        req.body.userID = decode.id;
        next();
    });
});

const isDoctor = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Auth failed, no token", success: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if (err) {
            return res.status(401).json({ message: "Auth failed", success: false });
        }
        req.body.doctorID = decode.id;
        next();
    });
});

export { isUser, isDoctor };