require('dotenv').config();
const ApiError = require('../error/ApiError');
const OrderService = require('../services/order-service');
const {Order, Payments} = require('../db/models/models');
const ZarinPal = require('zarinpal-checkout');
const { sequelize } = require('../db/db');
const { default: axios } = require('axios');

const PaymentQueries = {
    create: async (transactionId, amount) => {
        const paymentCreateRecord = await Payments.create({
            amount: amount,
            status: 'pending',
            transaction_id:transactionId
        })
        return paymentCreateRecord;
    },
    updateStatus: async (transactionId, status) => {
        const paymentUpdateRecord = await Payments.create({
            status: status},
            {where: {transaction_id: transactionId}
        })
        if(paymentUpdateRecord[0] === 0){
            console.log(`A record with transactionId ${transactionId} not found.`)
        }
        return paymentUpdateRecord;
    },
    findByTransactionId: async (transactionId) => {
        const paymentFindRecord = await Payments.findOne({
            where: {transaction_id: transactionId}
        })
        if(!paymentFindRecord){
            console.log(`A record with transactionId ${transactionId} not found.`)
        }
        return paymentFindRecord;
    }

}
const zarinpal = ZarinPal.create(
    process.env.ZAR_MERCHANT_ID, //Fake merchant ID
    true   
);

class PaymentController {
    async paymentRequest(req, res, next){
        const {amount, orderId, notes, email, phone} = req.body;
        const order = Order.findOne({
            where: {id: orderId}
        })
        if(!order){return res.status(404).json({message: 'سفارش یافت نشد'})}

        let paymentRecord;

        try{
            const transactionId = orderId
            paymentRecord = await Payments.create({amount: amount, status: 'pending', transaction_id: transactionId})
            const payRequest = { merchant_id: process.env.ZAR_MERCHANT_ID,
                                amount: amount,  //necessery*
                                callback_url: 'http://localhost:5001/api/payment/verify' ,   //necessery*
                                description: notes+` for #${orderId}`,   //necessery*
                                email: email, mobile: phone}
            const response = await axios.post('https://sandbox.zarinpal.com/pg/v4/payment/request.json', payRequest, {
                headers: {Accept: 'application/json', "Content-Type": 'application/json'}
            })

                if(response.status === 200 && response.data.data.code === 100){
                    const authority = response.data.data.authority;
                    paymentRecord = await Payments.create({amount: amount, authority: authority, status: 'request success', transaction_id: orderId})
                    return res.json({
                        success: true,
                        authority: authority,
                        status: response.status,
                        payment_url: `https://sandbox.zarinpal.com/pg/StartPay/${authority}`,
                        transactionId: orderId
                    })
                } else {
                    paymentRecord = await PaymentQueries.findByTransactionId(orderId)
                    if(paymentRecord){
                        paymentRecord.status = 'failed'
                        await paymentRecord.save();
                    }
                    return res.status(400).json({success: false, message: 'Payment request failed', code: response.status})
                }
            
        } catch(e){
            res.status(500).json({success: false, message: 'خطا در سرور', error: e.msg})
        }
    }

    async paymentVerify (req, res, next) {
        const {Authority, Status} = req.query;
        const findTransaction = Payments.findOne({
            where: {authority: Authority}
        })
        const transactionId = findTransaction.transaction_id;

        try{
            if(Status !== 'OK'){
                if(findTransaction){ findTransaction.status = 'failed verify' }
                const failUrl = `http://localhost:3000/payment-result?status=failed&orderId=${transactionId}&createdat=${findTransaction.createdAt}&message=Payment+Failed!`;
                return res.redirect(failUrl);
            } else if(Status === 'OK'){
                if(findTransaction) { findTransaction.status = 'success verify';}
                const order = Order.findOne({ where: {id: transactionId}})
                if(order){ order.state = 'paid' }

                const successUrl = `http://localhost:3000/payment-result?status=success&orderId=${transactionId}&createdat=${findTransaction.createdAt}&amount=${findTransaction.amount}`;
                return res.redirect(successUrl);
            }
        } catch(error){
            const errorUrl = `http://localhost:3000/payment-result?status=error&orderId=${transactionId}&createdat=${findTransaction.createdAt}&message=An+error+occured`;
            return res.redirect(errorUrl)
        }
                    
    }
}

module.exports = new PaymentController();
