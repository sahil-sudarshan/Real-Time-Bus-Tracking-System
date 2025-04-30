// models/Bus.js
const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bus", busSchema);
