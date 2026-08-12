console.log("🚀 JobStreet Apply Tracker aktif");


// =====================================================
// GET JOB INFORMATION
// =====================================================

function getJobInfo() {

  const currentUrl = window.location.href;

  console.log("🌐 URL saat ini:", currentUrl);


  // ===================================================
  // GET JOB ID
  // ===================================================

  let jobId = "";

  const urlMatch = currentUrl.match(
    /\/(?:id\/)?job\/(\d+)/
  );

  if (urlMatch && urlMatch[1]) {

    jobId = urlMatch[1];

    console.log("🆔 Job ID ditemukan:", jobId);
  }


  // ===================================================
  // FALLBACK: CARI JOB ID DARI LINK
  // ===================================================

  if (!jobId) {

    const jobLinks = document.querySelectorAll(
      'a[href*="/job/"]'
    );

    for (const link of jobLinks) {

      const href = link.href || "";

      const linkMatch = href.match(
        /\/(?:id\/)?job\/(\d+)/
      );

      if (linkMatch && linkMatch[1]) {

        jobId = linkMatch[1];

        console.log(
          "🆔 Job ID ditemukan dari link:",
          jobId
        );

        break;
      }
    }
  }


  // ===================================================
  // BUAT URL JOBSTREET BERSIH
  // ===================================================

  let jobUrl = currentUrl;

  if (jobId) {

    jobUrl =
      `https://id.jobstreet.com/id/job/${jobId}`;
  }


  console.log(
    "🔗 URL job:",
    jobUrl
  );


  // ===================================================
  // GET POSITION
  // ===================================================

  let position = "";

  const positionSelectors = [

    '[data-automation="job-detail-title"]',

    'h1[data-automation="job-detail-title"]',

    'h1'

  ];


  for (const selector of positionSelectors) {

    const element =
      document.querySelector(selector);

    if (
      element &&
      element.innerText.trim()
    ) {

      position =
        element.innerText.trim();

      break;
    }
  }


  // ===================================================
  // GET COMPANY
  // ===================================================

  let company = "";

  const companySelectors = [

    '[data-automation="advertiser-name"]',

    '[data-automation="job-detail-advertiser"]',

    '[data-automation="company-name"]'

  ];


  for (const selector of companySelectors) {

    const element =
      document.querySelector(selector);

    if (
      element &&
      element.innerText.trim()
    ) {

      company =
        element.innerText.trim();

      break;
    }
  }


  // ===================================================
  // FALLBACK COMPANY
  // ===================================================

  if (!company) {

    const advertiser =
      document.querySelector(
        '[data-automation="advertiser-name"]'
      );

    if (
      advertiser &&
      advertiser.innerText.trim()
    ) {

      company =
        advertiser.innerText.trim();
    }
  }


  // ===================================================
  // RESULT
  // ===================================================

  const result = {

    jobId: jobId,

    company: company,

    position: position,

    url: jobUrl

  };


  console.log(
    "📦 DATA YANG DITEMUKAN:",
    result
  );


  return result;
}



// =====================================================
// DETECT APPLY BUTTON
// =====================================================

function isApplyButton(element) {

  if (!element) {
    return false;
  }


  const text = (

    element.innerText ||

    element.textContent ||

    ""

  )
    .trim()
    .toLowerCase();


  if (!text) {
    return false;
  }


  const applyWords = [

    "lamaran cepat",

    "quick apply",

    "apply",

    "lamar"

  ];


  return applyWords.some(
    word =>
      text === word ||
      text.includes(word)
  );
}



// =====================================================
// HANDLE APPLY
// =====================================================

function handleApplyClick(element) {

  console.log(
    "🟢 APPLY TERDETEKSI:",
    element.innerText
  );


  // Ambil informasi sebelum halaman berubah
  const data = getJobInfo();


  console.log(
    "📤 DATA AKAN DIKIRIM:",
    data
  );


  // ===================================================
  // VALIDASI
  // ===================================================

  if (!data.jobId) {

    console.warn(
      "⚠️ Job ID tidak ditemukan"
    );
  }

  if (!data.company) {

    console.warn(
      "⚠️ Nama perusahaan tidak ditemukan"
    );
  }

  if (!data.position) {

    console.warn(
      "⚠️ Posisi tidak ditemukan"
    );
  }


  // ===================================================
  // KIRIM KE BACKGROUND
  // ===================================================

  chrome.runtime.sendMessage(

    {
      action: "saveApplication",
      data: data
    },

    function(response) {

      if (chrome.runtime.lastError) {

        console.error(
          "❌ Background error:",
          chrome.runtime.lastError.message
        );

        return;
      }


      console.log(
        "📨 Response dari background:",
        response
      );
    }
  );
}



// =====================================================
// GLOBAL CLICK LISTENER
// =====================================================

function initializeTracker() {

  console.log(
    "🔧 Mengaktifkan click listener..."
  );


  document.addEventListener(
    "click",

    function(event) {

      let element =
        event.target;


      // Naik ke parent
      // untuk mencari BUTTON/A
      for (
        let i = 0;
        i < 8 && element;
        i++
      ) {

        if (

          element.tagName === "BUTTON" ||

          element.tagName === "A" ||

          element.getAttribute("role") === "button"

        ) {

          break;
        }


        element =
          element.parentElement;
      }


      if (!element) {
        return;
      }


      // =================================================
      // CEK APAKAH APPLY
      // =================================================

      if (!isApplyButton(element)) {
        return;
      }


      // =================================================
      // APPLY
      // =================================================

      handleApplyClick(element);

    },

    true
  );


  console.log(
    "✅ Click listener aktif"
  );
}



// =====================================================
// MONITOR URL
// =====================================================

let lastUrl = location.href;


function monitorUrl() {

  const currentUrl =
    location.href;


  if (currentUrl !== lastUrl) {

    console.log(
      "🔄 URL JobStreet berubah:",
      currentUrl
    );


    lastUrl =
      currentUrl;
  }
}



// =====================================================
// START MONITORING
// =====================================================

function startMonitoring() {

  console.log(
    "🚀 Memulai JobStreet Tracker..."
  );


  initializeTracker();


  // Monitor URL
  setInterval(
    monitorUrl,
    1000
  );


  console.log(
    "👀 JobStreet Tracker siap digunakan"
  );
}



// =====================================================
// START
// =====================================================

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startMonitoring
  );

} else {

  startMonitoring();

}