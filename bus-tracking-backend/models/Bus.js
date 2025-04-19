// models/Bus.js
/*const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busId: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bus", busSchema);
*/
const mongoose = require('mongoose');

// Your schema and model
const BusLocationSchema = new mongoose.Schema({
  busId: String,
  lat: Number,
  lng: Number,
});

const BusLocation = mongoose.model('BusLocation', BusLocationSchema);

// Insert a document
const busLocation = new BusLocation({
  busId: 'BUS101',
  lat: 28.6448,
  lng: 77.2167,
});

const saveBusLocation = async () => {
    try {
      await busLocation.save();
      console.log('Data inserted successfully');
    } catch (err) {
      console.log('Error inserting data:', err);
    }
  };
  
  saveBusLocation();
  

