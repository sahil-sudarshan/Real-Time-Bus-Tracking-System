require("dotenv").config(); 
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const Bus = require("./models/Bus");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- MIDDLEWARE ---
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: 'SeriouslySecureSecret', // use .env in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    //name: 'sid',                // Optional but helps
    sameSite: 'lax',            // Good for cross-page
    secure: false,              // Only true on HTTPS
    httpOnly: true,             // Prevent client-side JS access
  }
}));

// --- AUTH MIDDLEWARE ---
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// --- STATIC FILES ---
app.use('/login.html', express.static(path.join(__dirname, 'public', 'login.html')));
app.use('/register.html', express.static(path.join(__dirname, 'public', 'register.html')));
app.use('/admin.html', express.static(path.join(__dirname, 'public', 'admin.html')));




app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES ---
app.use('/api/auth', authRoutes);

app.get('/api/user', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ username: req.session.user.username, role: req.session.user.role });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// --- MONGODB CONNECT ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// --- SOCKET.IO SETUP ---
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

      io.emit("busLocationUpdate", data);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// --- SIMULATED LOCATION UPDATES ---
setInterval(() => {
  const buses = [
    { busId: "BUS101", lat: 28.6448 + Math.random() * 0.01, lng: 77.2167 + Math.random() * 0.01 },
    { busId: "BUS102", lat: 28.645 + Math.random() * 0.01, lng: 77.217 + Math.random() * 0.01 },
    { busId: "BUS103", lat: 28.646 + Math.random() * 0.01, lng: 77.218 + Math.random() * 0.01 },
  ];

  buses.forEach((bus) => {
    Bus.findOneAndUpdate(
      { busId: bus.busId },
      { lat: bus.lat, lng: bus.lng, updatedAt: new Date() },
      { upsert: true, new: true }
    )
      .then(() => {
        io.emit("busLocationUpdate", bus);
        console.log("🛰️ Simulated Location Sent:", bus);
      })
      .catch((err) => console.error("Simulated location update error:", err));
  });
}, 5000);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
