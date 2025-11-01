// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifySignature ,sendPaymentSuccessEmail} = require("../controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", auth,isStudent,verifySignature);
router.post("/sendPaymentSuccessEmail",auth,isStudent,sendPaymentSuccessEmail);
module.exports = router

// export const capturePayment = async (req, res) => {
//   try {
//     console.log("🟢 Payment request body:", req.body);
//     // rest of logic...
//   } catch (err) {
//     console.error("🔴 Payment error:", err);
//     res.status(500).json({ success: false, message: "Payment failed" });
//   }
// };
