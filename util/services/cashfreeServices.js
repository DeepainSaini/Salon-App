const { Cashfree, CFEnvironment } = require('cashfree-pg');
require('dotenv').config();

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY
);

const createOrder = async (orderId, orderAmount, customerId, customerPhone) => {
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    const request = {
        order_amount: orderAmount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
            customer_id: String(customerId),
            customer_phone: customerPhone || "9999999999"
        },
        order_meta: {
            return_url: `http://localhost:3000/payment/status/${orderId}`,
            payment_methods: "cc,dc,upi"
        },
        order_expiry_time: expiryDate.toISOString()
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data.payment_session_id;
};

const getPaymentStatus = async (orderId) => {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;

    if (payments.some(payment => payment.payment_status === "SUCCESS")) {
        return "paid";
    }

    if (payments.some(payment => payment.payment_status === "PENDING")) {
        return "pending";
    }

    return "failed";
};

module.exports = {
    createOrder,
    getPaymentStatus
};