require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const roleRoutes = require("./src/modules/role/role.routes");
const adminRoutes = require("./src/modules/admin/admin.routes");
const auditRoutes = require("./src/modules/audit/audit.routes");
const userRoutes = require("./routes/userRoutes");


connectDB();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

global.io = io;

app.use("/images", express.static(path.join(__dirname, "public/images")));


app.use(cors());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.json({ message: "Fashion Store API is running..." });
});


app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
