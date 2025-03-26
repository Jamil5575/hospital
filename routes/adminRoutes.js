const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getDoctors,
  getPatients,
  getAppointments,
  getPrescriptions,
  getBills,
  generateReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');
const advancedResults = require('../middlewares/advancedResults');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');

// Re-route into other resource routers
// router.use('/:userId/appointments', appointmentRouter);

router.use(protect);
router.use(authorize('admin'));

router.route('/users')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/doctors')
  .get(getDoctors);

router.route('/patients')
  .get(getPatients);

router.route('/appointments')
  .get(advancedResults(Appointment, {
    path: 'patient doctor',
    select: 'name phone specialization'
  }), getAppointments);

router.route('/prescriptions')
  .get(advancedResults(Prescription, {
    path: 'patient doctor',
    select: 'name phone specialization'
  }), getPrescriptions);

router.route('/bills')
  .get(advancedResults(Bill, {
    path: 'patient',
    select: 'name phone'
  }), getBills);

router.route('/reports')
  .get(generateReports);

module.exports = router;