const router = require('express').Router();
const validatePayment = require('../validate/validate.payment');
const paymentcontroller = require('../controllers/payment.controller');
const verifyToken = require('../middlewares/verify.token');

router.get('/pay', paymentcontroller.fundProjects);
router.get('/pay/success', paymentcontroller.paymentSucessHandler);
router.get('/pay/cancel', paymentcontroller.paymentFailureHandler);
router.get('/pay/refund', paymentcontroller.refundPayment);

module.exports = router;
