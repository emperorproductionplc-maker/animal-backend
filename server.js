require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serves your frontend files

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Pet Schema
const petSchema = new mongoose.Schema({
    name: String,
    type: String,
    age: Number,
    description: String,
    image: String,
    contact: String
});

const Pet = mongoose.model('Pet', petSchema);

// --- ROUTES ---

// 1. Get all pets (Public)
app.get('/api/pets', async (req, res) => {
    try {
        const pets = await Pet.find();
        res.json(pets);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch pets" });
    }
});

// 2. Add a new pet (Password Protected)
app.post('/api/pets', async (req, res) => {
    const clientPassword = req.headers['admin-password']; // Get password from request header

    // Check if password matches the one saved in Render Environment Variables
    if (!clientPassword || clientPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: "Unauthorized: Incorrect Admin Password" });
    }

    try {
        const newPet = new Pet(req.body);
        await newPet.save();
        res.status(201).json({ message: "Pet added successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Failed to add pet" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
