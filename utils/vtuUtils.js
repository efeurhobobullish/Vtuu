const axios = require('axios');
const config = require('../config');

// Function to buy airtime
async function buyAirtime(phone, amount) {
    try {
        const response = await axios.post(config.VTU_API_URL + '/airtime', {
            phone, amount, apiKey: config.PAYSTACK_SECRET
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Airtime purchase failed');
    }
}

// Function to buy data
async function buyData(phone, planId) {
    try {
        const response = await axios.post(config.VTU_API_URL + '/data', {
            phone, planId, apiKey: config.PAYSTACK_SECRET
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : 'Data purchase failed');
    }
}

module.exports = { buyAirtime, buyData };