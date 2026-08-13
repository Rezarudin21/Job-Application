// =====================================================
// JOB APPLICATION TRACKER
// CONTENT SCRIPT V2.1
// =====================================================

console.log("🚀 JobStreet Apply Tracker aktif");


// =====================================================
// EXTENSION CONTEXT CHECK
// =====================================================

function isExtensionContextValid() {
  try {
    return (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.id
    );
  } catch (error) {
    return false;
  }
}


// =====================================================
// SAFE MESSAGE
// =====================================================

function sendMessageSafely(message) {

  return new Promise((resolve) => {

    if (!isExtensionContextValid()) {

      console.warn(
        "⚠️ Extension context tidak tersedia."
      );

      resolve({
        success: false,
        error: "Extension context unavailable"
      });

      return;
    }

    try {

      chrome.runtime.sendMessage(
        message,
        (response) => {

          if (chrome.runtime.lastError) {

            console.warn(
              "⚠️ Runtime message:",
              chrome.runtime.lastError.message
            );

            resolve({
              success: false,
              error:
                chrome.runtime.lastError.message
            });

            return;
          }

          resolve(
            response || {
              success: false,
              error: "No response"
            }
          );

        }
      );

    } catch (error) {

      console.error(
        "❌ sendMessage error:",
        error
      );

      resolve({
        success: false,
        error: error.message
      });

    }

  });

}


// =====================================================
// EXTRACT JOB ID
// =====================================================

function extractJobIdFromUrl(url) {

  if (!url) {
    return "";
  }

  // /job/93902797
  // /id/job/93902797

  let match = url.match(
    /\/(?:id\/)?job\/(\d+)/i
  );

  if (
    match &&
    match[1]
  ) {

    return match[1];

  }


  // ?jobId=93902797

  match = url.match(
    /[?&]jobId=(\d+)/i
  );

  if (
    match &&
    match[1]
  ) {

    return match[1];

  }


  return "";
}


// =====================================================
// FIND JOB LINK INSIDE CONTAINER
// =====================================================

function findJobIdInContainer(container) {

  if (!container) {
    return "";
  }

  const links =
    container.querySelectorAll(
      "a[href]"
    );

  for (const link of links) {

    const href =
      link.href ||
      link.getAttribute("href") ||
      "";

    const jobId =
      extractJobIdFromUrl(href);

    if (jobId) {
      return jobId;
    }

  }

  return "";
}


// =====================================================
// FIND NEAREST JOB CARD
// =====================================================

function findJobCard(element) {

  if (!element) {
    return null;
  }

  let current =
    element;

  for (
    let i = 0;
    i < 12 && current;
    i++
  ) {

    // -----------------------------------------------
    // Cari link job di container ini
    // -----------------------------------------------

    const jobId =
      findJobIdInContainer(
        current
      );

    if (jobId) {
      return current;
    }

    // -----------------------------------------------
    // Naik satu level
    // -----------------------------------------------

    current =
      current.parentElement;
  }

  return null;
}


// =====================================================
// FIND JOB ID FROM CLICKED CARD
// =====================================================

function findJobIdFromClickedCard(
  clickedElement
) {

  // -----------------------------------------------
  // 1. Cari card terdekat
  // -----------------------------------------------

  const card =
    findJobCard(
      clickedElement
    );

  if (card) {

    const jobId =
      findJobIdInContainer(
        card
      );

    if (jobId) {

      console.log(
        "🎯 Job ID ditemukan dari card:",
        jobId
      );

      return jobId;
    }
  }


  // -----------------------------------------------
  // 2. Coba parent langsung
  // -----------------------------------------------

  let parent =
    clickedElement;

  for (
    let i = 0;
    i < 8 && parent;
    i++
  ) {

    const links =
      parent.querySelectorAll(
        "a[href]"
      );

    for (const link of links) {

      const jobId =
        extractJobIdFromUrl(
          link.href
        );

      if (jobId) {

        console.log(
          "🎯 Job ID ditemukan dari parent:",
          jobId
        );

        return jobId;
      }

    }

    parent =
      parent.parentElement;
  }


  return "";
}


// =====================================================
// FIND POSITION FROM CARD
// =====================================================

function getPositionFromCard(
  card
) {

  if (!card) {
    return "";
  }

  const selectors = [

    '[data-automation="job-detail-title"]',

    '[data-automation="job-title"]',

    '[data-automation="job-listing-title"]',

    '[data-automation="jobTitle"]',

    "h1",

    "h2",

    "h3"

  ];


  for (
    const selector of selectors
  ) {

    const element =
      card.querySelector(
        selector
      );

    if (
      element &&
      element.innerText &&
      element.innerText.trim()
    ) {

      return element.innerText.trim();

    }

  }


  // -----------------------------------------------
  // Fallback: cari link job
  // -----------------------------------------------

  const links =
    card.querySelectorAll(
      "a[href]"
    );

  for (const link of links) {

    const jobId =
      extractJobIdFromUrl(
        link.href
      );

    if (
      jobId &&
      link.innerText &&
      link.innerText.trim()
    ) {

      return link.innerText.trim();

    }

  }


  return "";
}


// =====================================================
// FIND COMPANY FROM CARD
// =====================================================

function getCompanyFromCard(
  card
) {

  if (!card) {
    return "";
  }

  const selectors = [

    '[data-automation="advertiser-name"]',

    '[data-automation="job-detail-advertiser"]',

    '[data-automation="company-name"]',

    '[data-automation="job-detail-company-name"]',

    '[data-automation*="advertiser"]',

    '[data-automation*="company"]'

  ];


  for (
    const selector of selectors
  ) {

    const elements =
      card.querySelectorAll(
        selector
      );

    for (const element of elements) {

      if (
        element &&
        element.innerText &&
        element.innerText.trim()
      ) {

        return element.innerText.trim();

      }

    }

  }


  // -----------------------------------------------
  // Fallback: span
  // -----------------------------------------------

  const spans =
    card.querySelectorAll(
      "span"
    );

  for (const span of spans) {

    const automation =
      span.getAttribute(
        "data-automation"
      ) || "";

    if (
      automation
        .toLowerCase()
        .includes("advertiser")
    ) {

      const text =
        span.innerText.trim();

      if (text) {
        return text;
      }

    }

  }


  return "";
}


// =====================================================
// FIND DETAIL PAGE INFORMATION
// =====================================================

function getPositionFromPage() {

  const selectors = [

    '[data-automation="job-detail-title"]',

    'h1[data-automation="job-detail-title"]',

    'h1[data-automation="job-detail-title-heading"]',

    "h1"

  ];


  for (
    const selector of selectors
  ) {

    const element =
      document.querySelector(
        selector
      );

    if (
      element &&
      element.innerText &&
      element.innerText.trim()
    ) {

      return element.innerText.trim();

    }

  }

  return "";
}


function getCompanyFromPage() {

  const selectors = [

    '[data-automation="advertiser-name"]',

    '[data-automation="job-detail-advertiser"]',

    '[data-automation="company-name"]',

    '[data-automation="job-detail-company-name"]'

  ];


  for (
    const selector of selectors
  ) {

    const element =
      document.querySelector(
        selector
      );

    if (
      element &&
      element.innerText &&
      element.innerText.trim()
    ) {

      return element.innerText.trim();

    }

  }


  return "";
}


// =====================================================
// BUILD CLEAN JOB URL
// =====================================================

function buildJobUrl(
  jobId
) {

  if (!jobId) {
    return "";
  }

  return (
    "https://id.jobstreet.com/id/job/" +
    jobId
  );

}


// =====================================================
// GET JOB INFORMATION
// =====================================================

function getJobInfo(
  clickedElement
) {

  console.log(
    "🔍 Mencari informasi job dari tombol yang diklik..."
  );


  // ===================================================
  // 1. FIND CARD
  // ===================================================

  const card =
    findJobCard(
      clickedElement
    );


  console.log(
    "🃏 Job card:",
    card
  );


  // ===================================================
  // 2. FIND JOB ID FROM CARD
  // ===================================================

  let jobId =
    findJobIdFromClickedCard(
      clickedElement
    );


  // ===================================================
  // 3. ONLY USE CURRENT URL IF IT IS A JOB DETAIL PAGE
  // ===================================================

  if (!jobId) {

    const currentUrl =
      window.location.href;

    const currentUrlJobId =
      extractJobIdFromUrl(
        currentUrl
      );

    if (currentUrlJobId) {

      jobId =
        currentUrlJobId;

      console.log(
        "🎯 Job ID dari detail page:",
        jobId
      );

    }

  }


  // ===================================================
  // 4. POSITION
  // ===================================================

  let position = "";

  if (card) {

    position =
      getPositionFromCard(
        card
      );

  }


  if (!position) {

    position =
      getPositionFromPage();

  }


  // ===================================================
  // 5. COMPANY
  // ===================================================

  let company = "";

  if (card) {

    company =
      getCompanyFromCard(
        card
      );

  }


  if (!company) {

    company =
      getCompanyFromPage();

  }


  // ===================================================
  // 6. URL
  // ===================================================

  const url =
    buildJobUrl(
      jobId
    );


  // ===================================================
  // RESULT
  // ===================================================

  const result = {

    jobId:
      jobId,

    company:
      company,

    position:
      position,

    url:
      url

  };


  console.log(
    "📦 DATA FINAL:",
    result
  );


  return result;

}


// =====================================================
// APPLY BUTTON DETECTION
// =====================================================

function isApplyButton(
  element
) {

  if (!element) {
    return false;
  }


  const text = (

    element.innerText ||

    element.textContent ||

    element.getAttribute(
      "aria-label"
    ) ||

    ""

  )
    .trim()
    .toLowerCase();


  if (!text) {
    return false;
  }


  const applyWords = [

    "lamaran cepat",

    "lamar cepat",

    "quick apply",

    "apply",

    "lamar"

  ];


  return applyWords.some(
    (word) => {

      return (
        text === word ||
        text.includes(word)
      );

    }
  );

}


// =====================================================
// FIND CLICKABLE ELEMENT
// =====================================================

function findClickableElement(
  target
) {

  let element =
    target;


  for (
    let i = 0;
    i < 10 && element;
    i++
  ) {

    if (

      element.tagName ===
        "BUTTON" ||

      element.tagName ===
        "A" ||

      element.getAttribute(
        "role"
      ) === "button"

    ) {

      return element;

    }


    element =
      element.parentElement;

  }


  return null;

}


// =====================================================
// DUPLICATE PROTECTION
// =====================================================

let lastApplicationKey =
  "";

let lastApplicationTime =
  0;


// =====================================================
// HANDLE APPLY
// =====================================================

async function handleApplyClick(
  element
) {

  console.log(
    "🟢 APPLY TERDETEKSI"
  );


  // IMPORTANT:
  // Ambil data SEBELUM JobStreet
  // mengubah UI/page.

  const data =
    getJobInfo(
      element
    );


  console.log(
    "📦 Data yang akan dikirim:",
    data
  );


  // ===================================================
  // VALIDATION
  // ===================================================

  if (!data.jobId) {

    console.warn(
      "⚠️ Job ID tidak ditemukan."
    );

    return;

  }


  if (!data.position) {

    console.warn(
      "⚠️ Position tidak ditemukan."
    );

  }


  if (!data.company) {

    console.warn(
      "⚠️ Company tidak ditemukan."
    );

  }


  // ===================================================
  // DUPLICATE KEY
  // ===================================================

  const applicationKey = [

    data.jobId,

    data.company,

    data.position

  ].join("|");


  const now =
    Date.now();


  if (

    applicationKey ===
      lastApplicationKey &&

    now -
      lastApplicationTime <
      5000

  ) {

    console.log(
      "⏭️ Duplicate click diabaikan."
    );

    return;

  }


  lastApplicationKey =
    applicationKey;

  lastApplicationTime =
    now;


  // ===================================================
  // SEND
  // ===================================================

  const response =
    await sendMessageSafely({

      action:
        "saveApplication",

      data:
        data

    });


  console.log(
    "📨 Background response:",
    response
  );


  if (
    response &&
    response.success
  ) {

    console.log(
      "✅ Application berhasil disimpan ke Google Sheet!"
    );

  } else {

    console.warn(
      "⚠️ Application belum berhasil dikirim:",
      response
    );

  }

}


// =====================================================
// GLOBAL CLICK HANDLER
// =====================================================

function handleGlobalClick(
  event
) {

  const element =
    findClickableElement(
      event.target
    );


  if (!element) {
    return;
  }


  if (
    !isApplyButton(
      element
    )
  ) {

    return;

  }


  // Jalankan tanpa blocking UI JobStreet.

  handleApplyClick(
    element
  );

}


// =====================================================
// INITIALIZE
// =====================================================

let trackerInitialized =
  false;


function initializeTracker() {

  if (
    trackerInitialized
  ) {

    return;

  }


  trackerInitialized =
    true;


  document.addEventListener(
    "click",
    handleGlobalClick,
    true
  );


  console.log(
    "✅ JobStreet Apply Tracker listener aktif"
  );

}


// =====================================================
// START
// =====================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeTracker,
    {
      once: true
    }
  );

} else {

  initializeTracker();

}