const axios = require("axios");
const { PAYSTACK_SECRET } = require("../config");

const initializePayment = async (email, amount) => {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    { email, amount: amount * 100 },
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
  );
  return response.data;
};

const verifyPayment = async (reference) => {
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
  );
  return response.data;
};

module.exports = { initializePayment, verifyPayment };
