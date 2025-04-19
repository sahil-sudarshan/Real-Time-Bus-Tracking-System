// index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const Bus = require("./models/Bus");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Update this with frontend origin for production
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  socket.on("busLocationUpdate", async (data) => {
    const { busId, lat, lng } = data;
    console.log("📍 Location update:", data);

    try {
      await Bus.findOneAndUpdate(
        { busId },
        { lat, lng, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      // Broadcast to all clients
      io.emit("busLocationUpdate", data);
    } catch (error) {
      console.error("❌ Error updating location:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
