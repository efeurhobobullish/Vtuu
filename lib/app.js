const express = require("express");
const PORT = 3000;
const path = require("path");

const haki = express();


haki.use(express.static(path.join(__dirname, "../public")));


haki.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/home.html"))
})


haki.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/signup.html"))
})

haki.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/sign-in.html"))
})

haki.get("/airtime", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/airtime.html"))
})

haki.get("/airtime2cash", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/airtime2cash.html"))
})

haki.get("/cable", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/cable.html"))
})

haki.get("/changePin", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/change-pin.html"))
})

haki.get("/crypto", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/crypto.html"))
})

haki.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/dashboard.html"))
})

haki.get("/dash", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/dash.html"))
})

haki.get("/docs", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/docs.html"))
})

haki.get("/electricity", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/electricity.html"))
})

haki.get("/forgotPass", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/forgot-password.html"))
})

haki.get("/fundWallet", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/fund-wallet.html"))
})

haki.get("/giftcards", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/giftcards.html"))
})

haki.get("/gotv", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/gotv.html"))
})

haki.get("/investment", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/investment.html"))
})

haki.get("/referrals", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/referrals.html"))
})

haki.get("/services", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/services.html"))
})

haki.get("/settings", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/settings.html"))
})

haki.get("/support", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/support.html"))
})

haki.get("/transactionDetails", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/transaction-details.html"))
})

haki.get("/transaction", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/transaction.html"))
})

haki.get("/updatePass", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/update-password.html"))
})

haki.get("/virtualCard", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/virtual-card.html"))
})

haki.get("/withdraw", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/withdraw.html"))
})








haki.listen(PORT, (req, res) => {
    console.log(`server listening at port ${PORT}`)
})

