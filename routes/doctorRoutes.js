const express = require('express');
const router = express.Router();
const {
  getAppointments,
  getAppointment,
  confirmAppointment,
  completeAppointment,
  getPrescriptions,
  createPrescription,
  updatePrescription,
  getAvailability,
  updateAvailability
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('doctor'));

router.route('/appointments')
  .get(getAppointments);

router.route('/appointments/:id')
  .get(getAppointment);

router.route('/appointments/:id/confirm')
  .put(confirmAppointment);

router.route('/appointments/:id/complete')
  .put(completeAppointment);

router.route('/prescriptions')
  .get(getPrescriptions)
  .post(createPrescription);

router.route('/prescriptions/:id')
  .put(updatePrescription);

router.route('/availability')
  .get(getAvailability)
  .put(updateAvailability);

module.exports = router;