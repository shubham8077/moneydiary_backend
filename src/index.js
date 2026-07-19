import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB, isDBConnected } from "./config/db.js";
import { validateEnv } from "./config/env.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import recurringRoutes from "./routes/recurringRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";

// Load environment variables
dotenv.config();
validateEnv();

// Create Express App
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN === '*' ? '*' : (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Setup API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/reminders", reminderRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// Connect to Database (non-fatal) and start server in any case
const PORT = process.env.PORT || 5000;

connectDB().catch((err) => {
  console.error(
    "Initial DB connection attempt failed (continuing without DB):",
    err && err.message ? err.message : err,
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  try {
    if (isDBConnected()) {
      console.log("MongoDB: connected");
    } else {
      console.warn("MongoDB: not connected — server running in degraded mode.");
    }
  } catch (e) {
    console.warn("MongoDB status unknown.");
  }
});
