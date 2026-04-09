import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },

    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["Doctor", "Health Worker", "Coordinator"],
    },
    sex: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    address: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: [true, "Institution is required"],
    },
    institutionAccess: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
      },
    ],
    registrationNumber: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: "",
    },
    signatureImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (v) {
          return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~]).{8,}$/.test(
            v,
          );
        },
        message:
          "Password must be at least 8 characters long and contain at least one letter, one number, and one special character",
      },
      select: false,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },

    refreshToken: {
      type: String,
      select: false, // security
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================
   PASSWORD HASHING
========================================= */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* =========================================
   DOCTOR VALIDATION
========================================= */

userSchema.pre("validate", function (next) {
  if (this.role === "Doctor") {
    if (!this.registrationNumber) return next(new Error("Registration number is required for Doctors"));
    if (!this.specialization) return next(new Error("Specialization is required for Doctors"));
    if (!this.designation) return next(new Error("Designation is required for Doctors"));
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
