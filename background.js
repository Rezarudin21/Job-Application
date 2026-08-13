const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzE9LJ3UsQPN-hOFqEUt37rzyXCy6jjYR8GlUHXXtMhtAZeN8rmLnywKxNdEaxZZn62/exec";
console.log("🚀 Background aktif");
const recentSaves = new Map();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "saveApplication") return;
  (async () => {
    try {
      const data = message.data;
      console.log("📨 Data diterima:", data);
      if (!data.jobId) {
        throw new Error("Job ID kosong");
      }
      if (!data.position) {
        throw new Error("Position kosong");
      }
      const key = data.url || data.jobId;
      const now = Date.now();
      if (recentSaves.has(key) && now - recentSaves.get(key) < 10000) {
        console.log("⏭️ Duplicate save diblokir:", key);
        sendResponse({
          success: true,
          duplicate: true
        });
        return;
      }
      recentSaves.set(key, now);
      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(data));
      console.log("📤 Mengirim ke Google Sheet...");
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString()
      });
      const text = await response.text();
      console.log("📥 Response Apps Script:", text);
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error("Response bukan JSON: " + text);
      }
      sendResponse({
        success: true,
        result: json
      });
    } catch (error) {
      console.error("❌ Save error:", error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  })();
  return true;
});