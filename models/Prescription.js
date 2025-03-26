const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add medication name']
  },
  dosage: {
    type: String,
    required: [true, 'Please add dosage']
  },
  frequency: {
    type: String,
    required: [true, 'Please add frequency']
  },
  duration: {
    type: String,
    required: [true, 'Please add duration']
  },
  instructions: {
    type: String
  }
});

const PrescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  medications: [MedicationSchema],
  instructions: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);