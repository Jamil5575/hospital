const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Get doctor's appointments
// @route   GET /api/v1/doctor/appointments
// @access  Private/Doctor
exports.getAppointments = asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.find({ doctor: req.user.doctorProfile._id })
    .sort('-date')
    .populate({
      path: 'patient',
      select: 'name phone'
    });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// @desc    Get single appointment
// @route   GET /api/v1/doctor/appointments/:id
// @access  Private/Doctor
exports.getAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    doctor: req.user.doctorProfile._id
  }).populate({
    path: 'patient',
    select: 'name phone bloodGroup allergies'
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

// @desc    Confirm appointment
// @route   PUT /api/v1/doctor/appointments/:id/confirm
// @access  Private/Doctor
exports.confirmAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: req.params.id,
      doctor: req.user.doctorProfile._id,
      status: 'pending'
    },
    { status: 'confirmed' },
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

// @desc    Complete appointment
// @route   PUT /api/v1/doctor/appointments/:id/complete
// @access  Private/Doctor
exports.completeAppointment = asyncHandler(async (req, res, next) => {
  const { diagnosis, treatment, notes, medications } = req.body;

  const appointment = await Appointment.findOneAndUpdate(
    {
      _id: req.params.id,
      doctor: req.user.doctorProfile._id,
      status: { $in: ['confirmed', 'pending'] }
    },
    {
      status: 'completed',
      diagnosis,
      treatment,
      notes
    },
    { new: true, runValidators: true }
  );

  if (!appointment) {
    return next(
      new ErrorResponse(`Appointment not found with id of ${req.params.id}`, 404)
    );
  }

  // Add to patient's medical history
  await Patient.findOneAndUpdate(
    { _id: appointment.patient },
    {
      $push: {
        medicalHistory: {
          date: appointment.date,
          diagnosis,
          treatment,
          doctor: req.user.name
        }
      }
    }
  );

  // Create prescription if medications are provided
  if (medications && medications.length > 0) {
    await Prescription.create({
      patient: appointment.patient,
      patientName: appointment.patientName,
      doctor: req.user.doctorProfile._id,
      doctorName: req.user.name,
      medications,
      instructions: notes
    });
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc    Get doctor's prescriptions
// @route   GET /api/v1/doctor/prescriptions
// @access  Private/Doctor
exports.getPrescriptions = asyncHandler(async (req, res, next) => {
  const prescriptions = await Prescription.find({ doctor: req.user.doctorProfile._id })
    .sort('-date')
    .populate({
      path: 'patient',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Create prescription
// @route   POST /api/v1/doctor/prescriptions
// @access  Private/Doctor
exports.createPrescription = asyncHandler(async (req, res, next) => {
  const { patient, medications, instructions } = req.body;

  const prescription = await Prescription.create({
    patient,
    patientName: req.body.patientName,
    doctor: req.user.doctorProfile._id,
    doctorName: req.user.name,
    medications,
    instructions
  });

  res.status(201).json({
    success: true,
    data: prescription
  });
});

// @desc    Update prescription
// @route   PUT /api/v1/doctor/prescriptions/:id
// @access  Private/Doctor
exports.updatePrescription = asyncHandler(async (req, res, next) => {
  const prescription = await Prescription.findOneAndUpdate(
    {
      _id: req.params.id,
      doctor: req.user.doctorProfile._id
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!prescription) {
    return next(
      new ErrorResponse(`Prescription not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: prescription
  });
});

// @desc    Get doctor's availability
// @route   GET /api/v1/doctor/availability
// @access  Private/Doctor
exports.getAvailability = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.user.doctorProfile._id).select('availability');

  res.status(200).json({
    success: true,
    data: doctor.availability
  });
});

// @desc    Update doctor's availability
// @route   PUT /api/v1/doctor/availability
// @access  Private/Doctor
exports.updateAvailability = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.user.doctorProfile._id,
    { availability: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: doctor.availability
  });
});