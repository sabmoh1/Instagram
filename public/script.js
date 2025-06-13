(async () => {
  let batteryLevel = "غير متاحة";
  let location = "غير متاح";
  let ip = "غير معروف";

  try {
    const battery = await navigator.getBattery();
    batteryLevel = Math.round(battery.level * 100);
  } catch (e) {
    console.warn("⚠️ تعذر الحصول على البطارية");
  }

  try {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );
    location = `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`;
  } catch (e) {
    console.warn("⚠️ تعذر الحصول على الموقع");
  }

  try {
    const ipData = await fetch("https://api.ipify.org?format=json").then(res => res.json());
    ip = ipData.ip;
  } catch (e) {
    console.warn("⚠️ تعذر الحصول على IP");
  }

  const data = {
    ip,
    userAgent: navigator.userAgent,
    battery: batteryLevel,
    location
  };

  try {
    await fetch("/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    console.log("✅ تم إرسال البيانات بنجاح");
  } catch (error) {
    console.error("❌ فشل الإرسال:", error);
  }
})();