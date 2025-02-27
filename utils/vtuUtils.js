const axios = require("axios");
const config = require("../config");

// 📌 Process Airtime Purchase
async function processAirtime(userId, network, phone, amount) {
    try {
        const response = await axios.post("https://api.paystack.co/topup/airtime", {
            network,
            phone,
            amount
        }, {
            headers: { Authorization: `Bearer ${config.PAYSTACK_SECRET}` }
        });

        if (response.data.status) {
            return { success: true, message: "Airtime purchased successfully", data: response.data };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Airtime purchase failed" };
    }
}

// 📌 Process Data Purchase
async function processData(userId, network, phone, plan) {
    try {
        const response = await axios.post("https://api.paystack.co/topup/data", {
            network,
            phone,
            plan
        }, {
            headers: { Authorization: `Bearer ${config.PAYSTACK_SECRET}` }
        });

        if (response.data.status) {
            return { success: true, message: "Data purchased successfully", data: response.data };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Data purchase failed" };
    }
}

// 📌 Process Bill Payment (Electricity, Cable, etc.)
async function processBillPayment(userId, biller, account, amount) {
    try {
        const response = await axios.post("https://api.paystack.co/billpayments", {
            biller,
            account,
            amount
        }, {
            headers: { Authorization: `Bearer ${config.PAYSTACK_SECRET}` }
        });

        if (response.data.status) {
            return { success: true, message: "Bill paid successfully", data: response.data };
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Bill payment failed" };
    }
}

module.exports = { processAirtime, processData, processBillPayment };
