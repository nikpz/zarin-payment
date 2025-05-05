const Router = require('express');

const paymentRouter = require('./paymentRouter')
const orderRouter = require('./orderRouter')

const router = new Router()

router.use('/payment', paymentRouter)
router.use('/order', orderRouter)
