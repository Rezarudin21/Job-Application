// =====================================================
// JOB APPLICATION TRACKER
// BACKGROUND SERVICE WORKER V2.1
// =====================================================

console.log(
  "🚀 JobStreet Tracker Background aktif"
);


// =====================================================
// GOOGLE APPS SCRIPT
// =====================================================

const GOOGLE_SCRIPT_URL =
  "YOUR_WEB_APPS";


// =====================================================
// CONFIG
// =====================================================

const MAX_RETRIES = 3;

const RETRY_DELAY = 1500;


// =====================================================
// MESSAGE LISTENER
// =====================================================

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    console.log(
      "📨 Message diterima:",
      message
    );


    if (
      !message ||
      message.action !==
        "saveApplication"
    ) {

      return;

    }


    if (!message.data) {

      sendResponse({

        success: false,

        error:
          "Data application kosong."

      });

      return;

    }


    saveApplication(
      message.data
    )
      .then(
        (result) => {

          console.log(
            "✅ Save result:",
            result
          );

          sendResponse(
            result
          );

        }
      )
      .catch(
        (error) => {

          console.error(
            "❌ Save error:",
            error
          );

          sendResponse({

            success: false,

            error:
              error.message ||
              String(error)

          });

        }
      );


    // Sangat penting untuk async response.
    return true;

  }
);


// =====================================================
// SAVE APPLICATION
// =====================================================

async function saveApplication(
  data
) {

  const payload = {

    company:
      String(
        data.company || ""
      ).trim(),

    position:
      String(
        data.position || ""
      ).trim(),

    url:
      String(
        data.url || ""
      ).trim(),

    jobId:
      String(
        data.jobId || ""
      ).trim()

  };


  console.log(
    "📦 Payload final:",
    payload
  );


  // ---------------------------------------------------
  // Pastikan ada minimal data
  // ---------------------------------------------------

  if (
    !payload.company &&
    !payload.position &&
    !payload.url
  ) {

    throw new Error(
      "Tidak ada data job yang valid."
    );

  }


  // ---------------------------------------------------
  // Coba kirim beberapa kali
  // ---------------------------------------------------

  let lastError =
    null;


  for (
    let attempt = 1;
    attempt <= MAX_RETRIES;
    attempt++
  ) {

    try {

      console.log(
        `📤 Sending attempt ${attempt}/${MAX_RETRIES}`
      );


      const result =
        await sendToGoogleSheets(
          payload
        );


      if (
        result &&
        result.success
      ) {

        return result;

      }


      throw new Error(
        result.error ||
        "Unknown Google Sheets error."
      );


    } catch (error) {

      lastError =
        error;


      console.warn(
        `⚠️ Attempt ${attempt} gagal:`,
        error.message
      );


      if (
        attempt <
        MAX_RETRIES
      ) {

        await sleep(
          RETRY_DELAY * attempt
        );

      }

    }

  }


  throw lastError ||
    new Error(
      "Gagal menyimpan application."
    );

}


// =====================================================
// SEND TO GOOGLE SHEETS
// =====================================================

async function sendToGoogleSheets(
  payload
) {

  const formData =
    new URLSearchParams();


  formData.append(
    "payload",
    JSON.stringify(
      payload
    )
  );


  console.log(
    "🌐 POST:",
    GOOGLE_SCRIPT_URL
  );


  const response =
    await fetch(
      GOOGLE_SCRIPT_URL,
      {

        method:
          "POST",

        headers: {

          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"

        },

        body:
          formData.toString(),

        redirect:
          "follow"

      }
    );


  console.log(
    "📡 HTTP:",
    response.status
  );


  const text =
    await response.text();


  console.log(
    "📥 Apps Script response:",
    text
  );


  if (
    !response.ok
  ) {

    throw new Error(
      `HTTP ${response.status}`
    );

  }


  let result;


  try {

    result =
      JSON.parse(
        text
      );

  } catch (error) {

    throw new Error(
      "Response Apps Script bukan JSON."
    );

  }


  if (
    !result.success
  ) {

    throw new Error(
      result.error ||
      "Apps Script gagal menyimpan."
    );

  }


  return {

    success:
      true,

    message:
      result.message ||
      "Application berhasil disimpan.",

    data:
      result.data ||
      payload

  };

}


// =====================================================
// SLEEP
// =====================================================

function sleep(
  milliseconds
) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}
