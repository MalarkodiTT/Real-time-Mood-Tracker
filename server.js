const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config(); // Indha line dhaan .env file-ah read pannum

// Pazhaya line-ku badhula idha podunga
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI)
  .then(() => console.log('DB Connected Successfully!'))
  .catch(err => console.error('DB Connection Error:', err));
// Schema for Mood
const MoodSchema = new mongoose.Schema({
  emotion: String,
  timestamp: { type: Date, default: Date.now }
});

const Mood = mongoose.model('Mood', MoodSchema);

// API Route to save mood
app.post('/save-mood', async (req, res) => {
  const newMood = new Mood({ emotion: req.body.emotion });
  await newMood.save();
  res.send({ status: 'Saved Successfully!' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
