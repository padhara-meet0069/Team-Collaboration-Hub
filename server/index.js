import express from "express";
import cors from "cors";
import User from "./mongodb/models/register.js";
import connectDB from "./mongodb/connection.js";
// import * as dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Registration route
app.post("/api/register", async (req, res) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users route
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Hello, this is the backend.");
});

// Start server
const startServer = async () => {
  try {
    
    await connectDB(process.env.MONGO_URI);
    app.listen(5000, () => {
      console.log("Server is listening on port 5000");
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
