const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  createAppointment,
  cancelAppointment,
  getPrescriptions,
  getMedicalHistory,
  updateProfile,
  getBills,
  payBill
} = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/auth');
const { validateAppointment } = require('../middlewares/validate');

router.use(protect);
router.use(authorize('patient'));

router.route('/appointments')
  .get(getAppointments)
  .post(validateAppointment, createAppointment);

router.route('/appointments/:id')
  .get(getAppointment);

router.route('/appointments/:id/cancel')
  .put(cancelAppointment);

router.route('/prescriptions')
  .get(getPrescriptions);

router.route('/medical-history')
  .get(getMedicalHistory);

router.route('/profile')
  .put(updateProfile);

router.route('/bills')
  .get(getBills);

router.route('/bills/:id/pay')
  .put(payBill);

module.exports = router;