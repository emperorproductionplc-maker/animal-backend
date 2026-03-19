require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());

// 1. Updated CORS: This is the "Security Pass" 
// It allows your new Vercel Showroom to talk to this Render Warehouse.
app.use(cors()); 

// 2. Serves your static files (like your pet photos)
app.use(express.static(path.join(__dirname, 'public'))); 

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- SCHEMAS (Digital Filing Cabinets) ---

// Pet Storage
const petSchema = new mongoose.Schema({
    name: String,
    type: String,
    age: Number,
    description: String,
    image: String,
    contact: String
});
const Pet = mongoose.model('Pet', petSchema);

// NEW: Message Storage (For Adoption Applications)
const messageSchema = new mongoose.Schema({
    petName: String,
    userName: String,
    userPhone: String,
    userMessage: String,
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- ROUTES (The Hallways) ---

// 1. Get all pets (Public - shown in your Showroom)
app.get('/api/pets', async (req, res) => {
    try {
        const pets = await Pet.find();
        res.json(pets);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch pets" });
    }
});

// 2. Add a new pet (Admin Only)
app.post('/api/pets', async (req, res) => {
    const clientPassword = req.headers['admin-password'];
    if (!clientPassword || clientPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: "Unauthorized: Incorrect Password" });
    }
    try {
        const newPet = new Pet(req.body);
        await newPet.save();
        res.status(201).json({ message: "Pet added successfully!" });
    } catch (err) {
        res.status(400).json({ error: "Failed to add pet" });
    }
});

// 3. NEW: Receive a Message (When a user clicks "Apply" on Vercel)
app.post('/api/apply', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json({ message: "Application sent to Admin!" });
    } catch (err) {
        res.status(400).json({ error: "Failed to send application" });
    }
});

// 4. NEW: Get all Messages (For your Admin Page to see who applied)
app.get('/api/messages', async (req, res) => {
    const clientPassword = req.headers['admin-password'];
    if (!clientPassword || clientPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    try {
        const messages = await Message.find().sort({ date: -1 }); // Newest first
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Warehouse is OPEN on port ${PORT}`);
});
