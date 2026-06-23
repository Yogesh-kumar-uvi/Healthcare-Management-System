import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  { 
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: Number,
      required: [true, "phone is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [4, "Password must be at least 4 characters"],
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

export default userModel;