// =====================================================
// JOB APPLICATION TRACKER - FINAL VERSION
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

      resolve({
        success: false,
        error: "Extension context unavailable"
      });

      return;
    }

    chrome.runtime.sendMessage(
      message,
      (response) => {

        if (chrome.runtime.lastError) {

          resolve({
            success: false,
            error: chrome.runtime.lastError.message
          });

          return;
        }

        resolve(
          response || {
            success: false
          }
        );

      }
    );

  });

}

// =====================================================
// EXTRACT JOB ID
// =====================================================

function extractJobIdFromUrl(url) {

  if (!url) return "";

  let match = url.match(
    /\/(?:id\/)?job\/(\d+)/i
  );

  if (match && match[1]) {
    return match[1];
  }

  match = url.match(
    /[?&]jobId=(\d+)/i
  );

  if (match && match[1]) {
    return match[1];
  }

  return "";
}

// =====================================================
// FIND JOB CARD
// =====================================================

function findJobCard(element) {

  let current = element;

  for (let i = 0; i < 12 && current; i++) {

    const links =
      current.querySelectorAll(
        'a[href*="/job/"]'
      );

    for (const link of links) {

      const id =
        extractJobIdFromUrl(link.href);

      if (id) {
        return current;
      }

    }

    current = current.parentElement;
  }

  return null;
}

// =====================================================
// POSITION
// =====================================================

function getPositionFromCard(card) {

  if (!card) return "";

  const title =
    card.querySelector('[data-automation="job-detail-title"]') ||
    card.querySelector('[data-automation="job-title"]') ||
    card.querySelector('[data-automation="job-listing-title"]') ||
    card.querySelector('h1');

  if (!title) return "";

  const text = title.innerText.trim();

  const invalid = [
    "lamaran cepat",
    "lamar cepat",
    "quick apply",
    "apply",
    "lamar",
    "submit"
  ];

  if (invalid.includes(text.toLowerCase())) {
    return "";
  }

  return text;
}

function getPositionFromPage() {

  const selectors = [

    '[data-automation="job-detail-title"]',

    'h1[data-automation="job-detail-title"]',

    'h1[data-automation="job-detail-title-heading"]',

    'h1'

  ];

  for (const selector of selectors) {

    const el =
      document.querySelector(selector);

    if (
      el &&
      el.innerText &&
      el.innerText.trim()
    ) {

      return el.innerText.trim();
    }
  }

  return "";
}

// =====================================================
// COMPANY
// =====================================================

function getCompanyFromCard(card) {

  if (!card) return "";

  const el =
    card.querySelector('[data-automation="advertiser-name"]') ||
    card.querySelector('[data-automation="job-detail-advertiser"]') ||
    card.querySelector('[data-automation="company-name"]') ||
    card.querySelector('[data-automation="job-detail-company-name"]');

  return el ? el.innerText.trim() : "";
}

function getCompanyFromPage() {

  const el =
    document.querySelector('[data-automation="advertiser-name"]') ||
    document.querySelector('[data-automation="job-detail-advertiser"]') ||
    document.querySelector('[data-automation="company-name"]') ||
    document.querySelector('[data-automation="job-detail-company-name"]');

  return el ? el.innerText.trim() : "";
}

// =====================================================
// GET JOB INFO
// =====================================================

function getJobInfo(clickedElement) {

  const card = findJobCard(clickedElement);

  let jobId = "";

  if (card) {

    const link =
      card.querySelector(
        'a[href*="/job/"]'
      );

    if (link) {
      jobId =
        extractJobIdFromUrl(link.href);
    }
  }

  // Fallback ke URL halaman saat ini
  if (!jobId) {
    jobId =
      extractJobIdFromUrl(location.href);
  }

  let position =
    getPositionFromCard(card);

  if (!position) {
    position =
      getPositionFromPage();
  }

  let company =
    getCompanyFromCard(card);

  if (!company) {
    company =
      getCompanyFromPage();
  }

  const url = jobId ?
    `https://id.jobstreet.com/id/job/${jobId}` :
    location.href;

  const result = {
    jobId,
    company,
    position,
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

function isApplyButton(element) {

  if (!element) return false;

  const text = (
      element.innerText ||
      element.textContent ||
      element.getAttribute("aria-label") ||
      ""
    )
    .trim()
    .toLowerCase();

  return [
    "lamaran cepat",
    "lamar cepat",
    "quick apply",
    "apply",
    "lamar",
    "submit"
  ].some(v =>
    text === v || text.includes(v)
  );
}

// =====================================================
// FIND CLICKABLE ELEMENT
// =====================================================

function findClickableElement(target) {

  let el = target;

  for (let i = 0; i < 10 && el; i++) {

    if (
      el.tagName === "BUTTON" ||
      el.tagName === "A" ||
      el.getAttribute("role") === "button"
    ) {
      return el;
    }

    el = el.parentElement;
  }

  return null;
}

// =====================================================
// DUPLICATE PROTECTION
// =====================================================

// Mencegah double click cepat
let lastApplicationKey = "";
let lastApplicationTime = 0;

// Mencegah Quick Apply + Submit form tercatat dua kali
const appliedJobs = new Set();

// =====================================================
// HANDLE APPLY
// =====================================================

async function handleApplyClick(element) {

  console.log("🟢 APPLY TERDETEKSI");
  // ===================================================
  // HANYA CATAT DARI HALAMAN DETAIL LOWONGAN
  // ===================================================

  const isJobDetailPage = !!document.querySelector(
    '[data-automation="job-detail-title"]'
  );

  if (!isJobDetailPage) {

    console.log(
      "⛔ Klik di halaman formulir aplikasi diabaikan"
    );

    return;
  }

  const data = getJobInfo(element);

  if (!data.jobId) {
    console.warn("⚠️ Job ID kosong");
    return;
  }

  if (!data.position) {
    console.warn("⚠️ Position kosong");
    return;
  }

  const applicationKey =
    data.url || data.jobId;

  // -----------------------------------------------
  // Sudah pernah disimpan di tab ini
  // -----------------------------------------------

  if (appliedJobs.has(applicationKey)) {

    console.log(
      "⏭️ Job sudah pernah dicatat, submit kedua diabaikan:",
      applicationKey
    );

    return;
  }

  // -----------------------------------------------
  // Double click protection
  // -----------------------------------------------

  const now = Date.now();

  if (
    applicationKey === lastApplicationKey &&
    now - lastApplicationTime < 3000
  ) {

    console.log(
      "⏭️ Double click diabaikan:",
      applicationKey
    );

    return;
  }

  lastApplicationKey = applicationKey;
  lastApplicationTime = now;

  // Tandai sudah tercatat
  appliedJobs.add(applicationKey);

  // -----------------------------------------------
  // Kirim ke background
  // -----------------------------------------------

  const response =
    await sendMessageSafely({
      action: "saveApplication",
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
      "✅ Application berhasil disimpan ke Google Sheet"
    );

  } else {

    console.warn(
      "⚠️ Gagal menyimpan application:",
      response
    );
  }
}

// =====================================================
// GLOBAL CLICK HANDLER
// =====================================================

function handleGlobalClick(event) {

  const element =
    findClickableElement(event.target);

  if (!element) return;

  if (!isApplyButton(element)) return;

  handleApplyClick(element);
}

// =====================================================
// INITIALIZE
// =====================================================

let trackerInitialized = false;

function initializeTracker() {

  if (trackerInitialized) return;

  trackerInitialized = true;

  document.addEventListener(
    "click",
    handleGlobalClick,
    true
  );

  console.log(
    "✅ Tracker initialized"
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
    initializeTracker, {
      once: true
    }
  );

} else {

  initializeTracker();
}

// =====================================================
// KEEP ALIVE AFTER TAB SLEEP
// =====================================================

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState === "visible"
    ) {

      console.log(
        "👀 Tab aktif kembali"
      );

      initializeTracker();
    }
  }
);

// =====================================================
// RESET CACHE WHEN USER OPENS DIFFERENT JOB
// =====================================================

let currentTrackedJobId =
  extractJobIdFromUrl(location.href);

setInterval(() => {

  const newJobId =
    extractJobIdFromUrl(location.href);

  if (
    newJobId &&
    newJobId !== currentTrackedJobId
  ) {

    console.log(
      "🔄 Pindah lowongan, reset applied cache"
    );

    currentTrackedJobId = newJobId;

    appliedJobs.clear();
  }

}, 1000);