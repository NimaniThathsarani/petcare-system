const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  if (req.method === 'POST') console.log('Body:', { ...req.body, password: '***' });
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date() 
  });
});
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/vaccinations', require('./routes/vaccinationRoutes'));
app.use('/api/medications', require('./routes/medicationRoutes'));
app.use('/api/grooming', require('./routes/groomingRoutes'));
app.use('/api/grooming-services', require('./routes/groomingServiceRoutes'));
app.use('/api/diet', require('./routes/dietRoutes'));
app.use('/api/boarding', require('./routes/boardingRoutes'));
app.use('/api/cages', require('./routes/cageRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/vaccine-prescriptions', require('./routes/vaccinePrescriptionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));