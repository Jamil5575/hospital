const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Delete role-specific profile
  if (user.role === 'doctor') {
    await Doctor.findOneAndDelete({ user: user._id });
  } else if (user.role === 'patient') {
    await Patient.findOneAndDelete({ user: user._id });
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all doctors
// @route   GET /api/v1/admin/doctors
// @access  Private/Admin
exports.getDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.find().populate({
    path: 'user',
    select: 'name email'
  });

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

// @desc    Get all patients
// @route   GET /api/v1/admin/patients
// @access  Private/Admin
exports.getPatients = asyncHandler(async (req, res, next) => {
  const patients = await Patient.find().populate({
    path: 'user',
    select: 'name email'
  });

  res.status(200).json({
    success: true,
    count: patients.length,
    data: patients
  });
});

// @desc    Get all appointments
// @route   GET /api/v1/admin/appointments
// @access  Private/Admin
exports.getAppointments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get all prescriptions
// @route   GET /api/v1/admin/prescriptions
// @access  Private/Admin
exports.getPrescriptions = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get all bills
// @route   GET /api/v1/admin/bills
// @access  Private/Admin
exports.getBills = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Generate reports
// @route   GET /api/v1/admin/reports
// @access  Private/Admin
exports.generateReports = asyncHandler(async (req, res, next) => {
  const { type, startDate, endDate } = req.query;

  if (!type || !startDate || !endDate) {
    return next(
      new ErrorResponse('Please provide report type, start date and end date', 400)
    );
  }

  let reportData;

  if (type === 'appointments') {
    reportData = await generateAppointmentReport(startDate, endDate);
  } else if (type === 'revenue') {
    reportData = await generateRevenueReport(startDate, endDate);
  } else if (type === 'patients') {
    reportData = await generatePatientReport(startDate, endDate);
  } else {
    return next(
      new ErrorResponse('Invalid report type. Use appointments, revenue or patients', 400)
    );
  }

  res.status(200).json({
    success: true,
    data: reportData
  });
});

// Helper function to generate appointment report
const generateAppointmentReport = async (startDate, endDate) => {
  const appointments = await Appointment.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  const statusCounts = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };

  const doctorAppointments = {};

  appointments.forEach(appt => {
    statusCounts[appt.status]++;
    
    if (!doctorAppointments[appt.doctorName]) {
      doctorAppointments[appt.doctorName] = 0;
    }
    doctorAppointments[appt.doctorName]++;
  });

  return {
    total: appointments.length,
    statusCounts,
    doctorAppointments
  };
};

// Helper function to generate revenue report
const generateRevenueReport = async (startDate, endDate) => {
  const bills = await Bill.find({
    paymentDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    status: 'paid'
  });

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);

  const paymentMethods = {};

  bills.forEach(bill => {
    const method = bill.paymentMethod || 'unknown';
    paymentMethods[method] = (paymentMethods[method] || 0) + bill.total;
  });

  return {
    totalRevenue,
    totalBills: bills.length,
    averageBill: totalRevenue / bills.length || 0,
    paymentMethods
  };
};

// Helper function to generate patient report
const generatePatientReport = async (startDate, endDate) => {
  const patients = await Patient.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).populate({
    path: 'user',
    select: 'name email'
  });

  const bloodGroups = {};

  patients.forEach(patient => {
    const bg = patient.bloodGroup || 'Unknown';
    bloodGroups[bg] = (bloodGroups[bg] || 0) + 1;
  });

  return {
    totalPatients: patients.length,
    bloodGroups
  };
};