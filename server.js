const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Added this so you can view your HTML files

// --- DATABASE CONNECTION ---
// Now correctly pulling from your .env file
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const petSchema = new mongoose.Schema({
  name: String,
  location: String,
  image: String
});
const Pet = mongoose.model('Pet', petSchema);

// --- API ROUTES ---
app.get('/api/pets', async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pets" });
  }
});

app.post('/api/pets', async (req, res) => {
  try {
    const newPet = new Pet(req.body);
    await newPet.save();
    res.status(201).json(newPet);
  } catch (err) {
    res.status(500).send(err);
  }
});

// --- SERVER START ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🌍 Website available at http://localhost:${PORT}`);
});
