const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Get patient's appointments
// @route   GET /api/v1/patient/appointments
// @access  Private/Patient
exports.getAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({ patient: req.user.patientProfile._id })
    .sort('-date')
    .populate({
      path: 'doctor',
      select: 'name specialization'
    });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc    Get single appointment
// @route   GET /api/v1/patient/appointments/:id
// @access  Private/Patient
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patient: req.user.patientProfile._id
  }).populate({
    path: 'doctor',
    select: 'name specialization'
  });

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc    Create appointment
// @route   POST /api/v1/patient/appointments
// @access  Private/Patient
exports.createAppointment = asyncHandler(async (req, res, next) => {
  // Add patient to request body
  req.body.patient = req.user.patientProfile._id;
  req.body.patientName = req.user.name;

  const appointment = await Appointment.create(req.body);

  res.status(201).json({
    success: true,
    data: appointment
  });
});

// @desc    Cancel appointment
// @route   PUT /api/v1/patient/appointments/:id/cancel
// @access  Private/Patient
exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: req.params.id,
      patient: req.user.patientProfile._id,
      status: { $in: ['pending', 'confirmed'] }
    },
    { status: 'cancelled' },
    { new: true, runValidators: true }
  );

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc    Get patient's prescriptions
// @route   GET /api/v1/patient/prescriptions
// @access  Private/Patient
exports.getPrescriptions = asyncHandler(async (req, res, next) => {
  const prescriptions = await Prescription.find({ patient: req.user.patientProfile._id })
    .sort('-date')
    .populate({
      path: 'doctor',
      select: 'name specialization'
    });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Get patient's medical history
// @route   GET /api/v1/patient/medical-history
// @access  Private/Patient
exports.getMedicalHistory = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.user.patientProfile._id)
    .select('medicalHistory bloodGroup allergies');

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Update patient profile
// @route   PUT /api/v1/patient/profile
// @access  Private/Patient
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(
    req.user.patientProfile._id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Get patient's bills
// @route   GET /api/v1/patient/bills
// @access  Private/Patient
exports.getBills = asyncHandler(async (req, res, next) => {
  const bills = await Bill.find({ patient: req.user.patientProfile._id })
    .sort('-paymentDate');

  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills
  });
});

// @desc    Pay bill
// @route   PUT /api/v1/patient/bills/:id/pay
// @access  Private/Patient
exports.payBill = asyncHandler(async (req, res, next) => {
  const { paymentMethod } = req.body;

  const bill = await Bill.findOneAndUpdate(
    {
      _id: req.params.id,
      patient: req.user.patientProfile._id,
      status: 'pending'
    },
    {
      status: 'paid',
      paymentMethod,
      paymentDate: Date.now()
    },
    { new: true, runValidators: true }
  );

  if (!bill) {
    return next(
      new ErrorResponse(`Bill not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bill
  });
});