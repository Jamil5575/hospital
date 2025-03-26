const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Please add item description']
  },
  amount: {
    type: Number,
    required: [true, 'Please add item amount']
  }
});

const BillSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment'
  },
  items: [BillItemSchema],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'insurance', 'bank_transfer', 'upi']
  },
  paymentDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total before saving
BillSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.total = this.items.reduce((sum, item) => sum + item.amount, 0);
  }
  next();
});

module.exports = mongoose.model('Bill', BillSchema);