const Router = require('express');
const paymentController = require('../controllers/paymentController')

const router = new Router()

router.post('/request', paymentController.paymentRequest);
router.post('/verify', paymentController.paymentVerify);

module.exports = router;
