import { body, validationResult } from "express-validator";

// ✅ NEW — common result-checker. Har validation chain ke array ke aakhir me yeh lagao.
// Agar koi validation fail hui ho, controller tak request pohchne hi nahi degi.
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg, // sabse pehli error ka message — frontend ke liye direct dikhane layak
            errors: errors.array(), // saari errors (agar frontend field-wise dikhana chahe)
        });
    }
    next();
};

// ✅ NEW — Register
const registerValidation = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone")
        .notEmpty().withMessage("Phone number is required")
        .isLength({ min: 10, max: 10 }).withMessage("Phone number must be exactly 10 digits")
        .isNumeric().withMessage("Phone number must contain only digits"),
    validateRequest,
];

// ✅ NEW — Login
const loginValidation = [
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest,
];

// ✅ NEW — Forgot password
const forgotPasswordValidation = [
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    validateRequest,
];

// ✅ NEW — Reset password
const resetPasswordValidation = [
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validateRequest,
];

// ✅ NEW — Doctor: generate slots
const generateSlotsValidation = [
    body("date")
        .notEmpty().withMessage("Date is required")
        .isISO8601().withMessage("Date must be in YYYY-MM-DD format"),
    body("startTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("startTime must be in HH:mm 24-hour format"),
    body("endTime")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("endTime must be in HH:mm 24-hour format"),
    body("slotDuration")
        .isInt({ min: 5, max: 180 }).withMessage("Slot duration must be between 5 and 180 minutes"),
    validateRequest,
];

// ✅ NEW — Patient: book a slot
const bookSlotValidation = [
    body("userID").notEmpty().withMessage("userID is required").isMongoId().withMessage("Invalid userID"),
    body("slotId").notEmpty().withMessage("slotId is required").isMongoId().withMessage("Invalid slotId"),
    validateRequest,
];

export {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    generateSlotsValidation,
    bookSlotValidation,
};