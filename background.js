console.log("JobStreet Tracker background aktif");


// =====================================================
// URL GOOGLE APPS SCRIPT
// =====================================================

const WEB_APP_URL =
  "YOUR_WEB_APPS";


// =====================================================
// TERIMA DATA DARI CONTENT.JS
// =====================================================

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {

    if (
      !message ||
      message.action !== "saveApplication"
    ) {
      return;
    }


    const data = message.data;


    console.log(
      "📦 Data diterima background:",
      data
    );


    // -------------------------------------------------
    // VALIDASI
    // -------------------------------------------------

    if (!data) {

      sendResponse({
        success: false,
        error: "Data kosong"
      });

      return;
    }


    if (!data.company || !data.position) {

      console.warn(
        "⚠️ Data perusahaan atau posisi kosong:",
        data
      );
    }


    // -------------------------------------------------
    // KIRIM KE GOOGLE APPS SCRIPT
    // -------------------------------------------------

    const payload =
      JSON.stringify(data);


    const body =
      new URLSearchParams();

    body.append(
      "payload",
      payload
    );


    fetch(
      WEB_APP_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body: body.toString(),

        redirect: "follow"
      }
    )
    .then(async response => {

      const text =
        await response.text();


      console.log(
        "📨 Response Google Apps Script:",
        text
      );


      let result;


      try {

        result =
          JSON.parse(text);

      } catch (error) {

        result = {
          success: false,
          error:
            "Response bukan JSON",
          response: text
        };
      }


      sendResponse(result);

    })
    .catch(error => {

      console.error(
        "❌ Gagal mengirim ke Google Sheet:",
        error
      );


      sendResponse({
        success: false,
        error: error.message
      });

    });


    // Penting karena fetch asynchronous
    return true;
  }
);
