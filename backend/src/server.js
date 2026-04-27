import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import institutionRoutes from "./routes/institutionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import panelRoutes from "./routes/panelRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import protocolRoutes from "./routes/protocolRoutes.js";
import programTypeRoutes from "./routes/programTypeRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import appointmentTypeRoutes from "./routes/appointmentTypeRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(path.dirname(__dirname), "uploads")),
);

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "OryxTHealth.ai API Server",
    version: "1.0.0",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/panels", panelRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/protocols", protocolRoutes);
app.use("/api/program-types", programTypeRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/appointment-types", appointmentTypeRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
});
