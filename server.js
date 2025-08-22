// backend/server.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 👉 Create Order API
app.post("/api/create-order", async (req, res) => {
  try {
    const options = {
      amount: 199 * 100, // INR 2000 in paise
      currency: "INR",
      receipt: "receipt#1",
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

// 👉 Verify Payment API
app.post("/api/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      // ✅ Payment verified
      return res.json({
        success: true,
        downloadUrl:
          "https://docs.google.com/spreadsheets/d/1pay0O73e6F56PwdEKV16n_VV3_1n6zde5byHz7xQc-0/edit?usp=sharing",
      });
    } else {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
});

app.listen(5001, () =>
  console.log("✅ Backend running on http://localhost:5001")
);




