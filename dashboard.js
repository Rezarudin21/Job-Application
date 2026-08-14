// =====================================================
// JOB APPLICATION TRACKER - DASHBOARD
// =====================================================

const API_URL =
    "YOUR_WEB_APPS";

const REFRESH_INTERVAL = 30 * 1000;

let refreshTimer = null;
let isLoading = false;


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    if (isLoading) {
        return;
    }

    isLoading = true;

    setLoadingState(true);

    try {

        const requestUrl =
            API_URL +
            "?action=dashboard&_=" +
            Date.now();

        console.log(
            "[Job Tracker] Fetching:",
            requestUrl
        );

        const response =
            await fetch(
                requestUrl,
                {
                    method: "GET",
                    cache: "no-store",
                    redirect: "follow"
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const result =
            await response.json();

        console.log(
            "[Job Tracker] API response:",
            result
        );

        if (!result.success) {

            throw new Error(
                result.error ||
                "API returned an error"
            );

        }

        if (!result.data) {

            throw new Error(
                "API tidak mengembalikan data"
            );

        }

        renderDashboard(
            result.data
        );

        setLastSyncTime();

        return result.data;

    } catch (error) {

        console.error(
            "[Job Tracker] Dashboard error:",
            error
        );

        showError(
            "Gagal mengambil data Google Sheets: " +
            error.message
        );

        throw error;

    } finally {

        isLoading = false;

        setLoadingState(false);

    }

}


// =====================================================
// RENDER DASHBOARD
// =====================================================

function renderDashboard(data) {

    const stats =
        data.stats || {};

    const applications =
        Array.isArray(data.applications)
            ? data.applications
            : [];

    const reminders =
        Array.isArray(data.reminders)
            ? data.reminders
            : [];


    renderStats(
        stats,
        applications
    );

    renderPipeline(
        stats
    );

   renderDashboardDonut(
    stats
);

    renderApplications(
        applications
    );

    renderReminders(
        reminders
    );

}


// =====================================================
// STATISTICS
// =====================================================

function renderStats(
    stats,
    applications
) {

    const total =
        Number(stats.total) || 0;

    const applied =
        Number(stats.applied) || 0;

    const interview =
        Number(stats.interview) || 0;

    const offer =
        Number(stats.offer) || 0;


    const totalElement =
        document.getElementById(
            "totalApplications"
        );

    const appliedElement =
        document.getElementById(
            "appliedCount"
        );

    const interviewElement =
        document.getElementById(
            "interviewCount"
        );

    const offerElement =
        document.getElementById(
            "offerCount"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (appliedElement) {

        appliedElement.textContent =
            applied;

    }


    if (interviewElement) {

        interviewElement.textContent =
            interview;

    }


    if (offerElement) {

        offerElement.textContent =
            offer;

    }


    const thisMonth =
        getThisMonthCount(
            applications
        );


    const totalChange =
        document.getElementById(
            "totalChange"
        );

    if (totalChange) {

        totalChange.textContent =
            `↑ ${thisMonth} this month`;

    }


    const interviewRate =
        total > 0
            ? (
                interview /
                total *
                100
            ).toFixed(1)
            : "0.0";


    const interviewRateElement =
        document.getElementById(
            "interviewRate"
        );

    if (interviewRateElement) {

        interviewRateElement.textContent =
            `${interviewRate}% of applications`;

    }


    const offerRate =
        total > 0
            ? (
                offer /
                total *
                100
            ).toFixed(1)
            : "0.0";


    const offerRateElement =
        document.getElementById(
            "offerRate"
        );

    if (offerRateElement) {

        offerRateElement.textContent =
            `${offerRate}% conversion`;

    }

}


// =====================================================
// PIPELINE
// =====================================================

function renderPipeline(stats) {

    const values = {

        applied:
            Number(stats.applied) || 0,

        contacted:
            Number(stats.contacted) || 0,

        test:
            Number(stats.test) || 0,

        interview:
            Number(stats.interview) || 0,

        offer:
            Number(stats.offer) || 0,

        rejected:
            Number(stats.rejected) || 0

    };


    const maxValue =
        Math.max(
            ...Object.values(values),
            1
        );


    updatePipeline(
        "pipelineApplied",
        "barApplied",
        values.applied,
        maxValue
    );


    updatePipeline(
        "pipelineContacted",
        "barContacted",
        values.contacted,
        maxValue
    );


    updatePipeline(
        "pipelineTest",
        "barTest",
        values.test,
        maxValue
    );


    updatePipeline(
        "pipelineInterview",
        "barInterview",
        values.interview,
        maxValue
    );


    updatePipeline(
        "pipelineOffer",
        "barOffer",
        values.offer,
        maxValue
    );


    updatePipeline(
        "pipelineRejected",
        "barRejected",
        values.rejected,
        maxValue
    );

}


function updatePipeline(
    countId,
    barId,
    value,
    maxValue
) {

    const countElement =
        document.getElementById(
            countId
        );

    const barElement =
        document.getElementById(
            barId
        );


    if (countElement) {

        countElement.textContent =
            value;

    }


    if (barElement) {

        const percentage =
            (
                value /
                maxValue
            ) * 100;

        barElement.style.width =
            `${percentage}%`;

    }

}


// =====================================================
// ANALYTICS / DONUT
// =====================================================

function renderDashboardDonut(stats) {
    console.log(
    "[Job Tracker] Donut stats:",
    stats
);

    const values = {

        applied:
            Number(stats.applied) || 0,

        contacted:
            Number(stats.contacted) || 0,

        interview:
            Number(stats.interview) || 0,

        offer:
            Number(stats.offer) || 0,

        rejected:
            Number(stats.rejected) || 0

    };


    const total =
        Number(stats.total) || 0;


    const donut =
        document.getElementById(
            "donut"
        );


    const donutNumber =
        document.getElementById(
            "donutNumber"
        );


    if (donutNumber) {

        donutNumber.textContent =
            total;

    }


    if (donut) {

        if (total === 0) {

            donut.style.background =
                "#1a2740";

        } else {

            const colors = [

                "#6366f1",
                "#38bdf8",
                "#f97316",
                "#22c55e",
                "#ef4444"

            ];


            const orderedValues = [

                values.applied,
                values.contacted,
                values.interview,
                values.offer,
                values.rejected

            ];


            let current =
                0;


            const segments =
                [];


            orderedValues.forEach(
                (
                    value,
                    index
                ) => {

                    if (value <= 0) {
                        return;
                    }


                    const start =
                        (
                            current /
                            total
                        ) * 100;


                    current += value;


                    const end =
                        (
                            current /
                            total
                        ) * 100;


                    segments.push(
                        `${colors[index]} ${start}% ${end}%`
                    );

                }
            );


            donut.style.background =
                `conic-gradient(${segments.join(", ")})`;

        }

    }


    setText(
        "legendApplied",
        values.applied
    );

    setText(
        "legendContacted",
        values.contacted
    );

    setText(
        "legendInterview",
        values.interview
    );

    setText(
        "legendOffer",
        values.offer
    );

    setText(
        "legendRejected",
        values.rejected
    );

}


// =====================================================
// APPLICATION TABLE
// =====================================================

function renderApplications(
    applications
) {

    const tbody =
        document.getElementById(
            "applicationsBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML =
        "";


    const recent =
        applications
            .slice()
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        parseApplicationDate(
                            b.date
                        ) -
                        parseApplicationDate(
                            a.date
                        )
                    );

                }
            )
            .slice(
                0,
                10
            );


    if (
        recent.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                        color:var(--muted);
                    "
                >
                    No applications found.
                </td>

            </tr>

        `;

        return;

    }


    recent.forEach(
        application => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td class="company">
                    ${escapeHtml(
                        application.company
                    )}
                </td>

                <td class="position">
                    ${escapeHtml(
                        application.position
                    )}
                </td>

                <td class="platform">
                    ${escapeHtml(
                        application.platform
                    )}
                </td>

                <td>

                    <span
                        class="status ${getStatusClass(
                            application.status
                        )}"
                    >
                        ${escapeHtml(
                            application.status
                        )}
                    </span>

                </td>

                <td>
                    ${formatDisplayDate(
                        application.date
                    )}
                </td>

            `;


            if (
                application.url
            ) {

                row.style.cursor =
                    "pointer";


                row.addEventListener(
                    "click",
                    () => {

                        window.open(
                            application.url,
                            "_blank"
                        );

                    }
                );

            }


            tbody.appendChild(
                row
            );

        }
    );

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(
    status
) {

    const classes = {

        "Applied":
            "status-applied",

        "HR Contacted":
            "status-applied",

        "Test":
            "status-applied",

        "Interview":
            "status-interview",

        "Offer":
            "status-offer",

        "Rejected":
            "status-rejected",

        "Withdrawn":
            "status-rejected"

    };


    return (
        classes[status] ||
        "status-applied"
    );

}


// =====================================================
// REMINDERS
// =====================================================
function loadReminders() {

    fetch(API_URL + "?action=dashboard")
        .then(response => response.json())
        .then(result => {

            if (!result.success) {
                throw new Error(
                    result.error || "Gagal mengambil data reminders"
                );
            }

            const applications =
                result.data.applications || [];

            renderReminderPage(applications);

        })
        .catch(error => {

            console.error(
                "Load reminders error:",
                error
            );

            const lists = [
                "overdueList",
                "todayList",
                "upcomingList"
            ];

            lists.forEach(id => {

                const element =
                    document.getElementById(id);

                if (element) {

                    element.innerHTML = `
                        <div class="empty-state">
                            Gagal memuat reminders.
                        </div>
                    `;

                }

            });

        });

}

function renderReminderSection(
    containerId,
    applications,
    type
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // =========================
    // EMPTY
    // =========================

    if (
        applications.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                ${
                    type === "overdue"
                        ? "No overdue applications 🎉"
                        : type === "today"
                            ? "No reminders due today 🎉"
                            : "No upcoming reminders."
                }

            </div>

        `;

        return;
    }


    // =========================
    // APPLICATION CARDS
    // =========================

    applications.forEach(
        application => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "reminder-page-card";


            let message = "";


            if (type === "overdue") {

                message =
                    "Follow-up is overdue";

            }

            else if (type === "today") {

                message =
                    "Follow-up required today";

            }

            else {

                message =
                    "Upcoming follow-up";

            }


            card.innerHTML = `

                <div class="reminder-page-top">

                    <div class="reminder-page-company">

                        ${escapeHtml(
                            application.company || "Unknown Company"
                        )}

                    </div>

                    <div class="reminder-page-status">

                        ${escapeHtml(
                            application.status || "Applied"
                        )}

                    </div>

                </div>


                <div class="reminder-page-position">

                    ${escapeHtml(
                        application.position || "-"
                    )}

                </div>


                <div class="reminder-page-date">

                    Reminder:
                    ${formatDisplayDate(
                        application.reminderDate
                    )}

                </div>


                <div class="reminder-page-message ${type}">

                    ${message}

                </div>


                ${
                    application.url
                        ? `
                            <button
                                class="reminder-open-button"
                                type="button"
                            >
                                Open Job
                            </button>
                        `
                        : ""
                }

            `;


            // =========================
            // OPEN JOB
            // =========================

            const button =
                card.querySelector(
                    ".reminder-open-button"
                );


            if (
                button &&
                application.url
            ) {

                button.addEventListener(
                    "click",
                    () => {

                        window.open(
                            application.url,
                            "_blank"
                        );

                    }
                );

            }


            container.appendChild(
                card
            );

        }
    );

}

function renderReminderPage(applications) {

    console.log(
        "[Job Tracker] Reminder applications:",
        applications
    );

    const overdue = [];
    const today = [];
    const upcoming = [];

    const now = new Date();

    now.setHours(0, 0, 0, 0);

    applications.forEach(application => {

        if (!application.reminderDate) {
            return;
        }

        const reminderDate =
            new Date(application.reminderDate);

        if (Number.isNaN(reminderDate.getTime())) {
            return;
        }

        reminderDate.setHours(0, 0, 0, 0);

        if (reminderDate < now) {

            overdue.push(application);

        }
        else if (
            reminderDate.getTime() ===
            now.getTime()
        ) {

            today.push(application);

        }
        else {

            upcoming.push(application);

        }

    });


    console.log(
        "[Job Tracker] Overdue:",
        overdue
    );

    console.log(
        "[Job Tracker] Today:",
        today
    );

    console.log(
        "[Job Tracker] Upcoming:",
        upcoming
    );


    renderReminderSection(
        "overdueList",
        overdue,
        "overdue"
    );

    renderReminderSection(
        "todayList",
        today,
        "today"
    );

    renderReminderSection(
        "upcomingList",
        upcoming,
        "upcoming"
    );


    updateReminderCount(
        "overdueCount",
        "overdueLabel",
        overdue.length
    );

    updateReminderCount(
        "todayCount",
        "todayLabel",
        today.length
    );

    updateReminderCount(
        "upcomingCount",
        "upcomingLabel",
        upcoming.length
    );

}

function renderReminders(
    reminders
) {

    const container =
        document.getElementById(
            "reminderGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (
        reminders.length ===
        0
    ) {

        container.innerHTML = `

            <div class="reminder">

                <div
                    class="reminder-company"
                >
                    No follow-up required 🎉
                </div>

                <div
                    class="reminder-position"
                >
                    You're all caught up.
                </div>

            </div>

        `;

        return;

    }


    reminders
        .slice(
            0,
            6
        )
        .forEach(
            application => {

                const reminder =
                    document.createElement(
                        "div"
                    );


                reminder.className =
                    "reminder";


                reminder.innerHTML = `

                    <div
                        class="reminder-top"
                    >

                        <span
                            class="reminder-company"
                        >
                            ${escapeHtml(
                                application.company
                            )}
                        </span>

                        <span
                            class="reminder-warning"
                        >
                            Follow up
                        </span>

                    </div>

                    <div
                        class="reminder-position"
                    >
                        ${escapeHtml(
                            application.position
                        )}
                    </div>

                    <div
                        class="reminder-date"
                    >
                        Last update:
                        ${formatDisplayDate(
                            application.lastUpdate
                        )}
                    </div>

                `;


                if (
                    application.url
                ) {

                    reminder.style.cursor =
                        "pointer";


                    reminder.addEventListener(
                        "click",
                        () => {

                            window.open(
                                application.url,
                                "_blank"
                            );

                        }
                    );

                }


                container.appendChild(
                    reminder
                );

            }
        );

}

function updateReminderCount(
    summaryId,
    labelId,
    count
) {

    const summary =
        document.getElementById(
            summaryId
        );

    const label =
        document.getElementById(
            labelId
        );


    if (summary) {

        summary.textContent =
            count;

    }


    if (label) {

        label.textContent =
            count;

    }

}


// =====================================================
// DATE HELPERS
// =====================================================

function parseApplicationDate(
    value
) {

    if (!value) {
        return 0;
    }


    const timestamp =
        new Date(
            value
        ).getTime();


    if (
        Number.isNaN(
            timestamp
        )
    ) {

        return 0;

    }


    return timestamp;

}


function formatDisplayDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function getThisMonthCount(
    applications
) {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        now.getMonth();


    return applications.filter(
        application => {

            const date =
                new Date(
                    application.date
                );


            return (
                !Number.isNaN(
                    date.getTime()
                ) &&
                date.getFullYear() ===
                    year &&
                date.getMonth() ===
                    month
            );

        }
    ).length;

}


// =====================================================
// HTML HELPERS
// =====================================================

function escapeHtml(
    value
) {

    return String(
        value || ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// =====================================================
// LOADING STATE
// =====================================================

function setLoadingState(
    loading
) {

    const button =
        document.getElementById(
            "syncButton"
        );


    if (button) {

        button.disabled =
            loading;

        if (loading) {

            button.textContent =
                "↻ Syncing...";

        } else {

            button.textContent =
                "↻ Sync";

        }

    }


    const main =
        document.querySelector(
            ".main"
        );


    if (main) {

        if (loading) {

            main.classList.add(
                "dashboard-loading"
            );

        } else {

            main.classList.remove(
                "dashboard-loading"
            );

        }

    }

}


// =====================================================
// ERROR
// =====================================================

function showError(
    message
) {

    console.error(
        "[Job Tracker]",
        message
    );


    const button =
        document.getElementById(
            "syncButton"
        );


    if (!button) {
        return;
    }


    button.textContent =
        "⚠ Sync failed";


    button.title =
        message;


    setTimeout(
        () => {

            button.textContent =
                "↻ Sync";

        },
        3000
    );

}


// =====================================================
// LAST SYNC
// =====================================================

function setLastSyncTime() {

    const button =
        document.getElementById(
            "syncButton"
        );


    if (!button) {
        return;
    }


    const time =
        new Date()
            .toLocaleTimeString();


    button.title =
        `Last synced: ${time}`;

}


// =====================================================
// MANUAL SYNC
// =====================================================

async function syncDashboard() {

    const button =
        document.getElementById(
            "syncButton"
        );


    if (!button) {
        return;
    }


    if (isLoading) {
        return;
    }


    try {

        await loadDashboard();


        button.textContent =
            "✓ Synced";


    } catch (error) {

        button.textContent =
            "⚠ Sync failed";

    }


    setTimeout(
        () => {

            button.textContent =
                "↻ Sync";

        },
        1500
    );

}


// =====================================================
// AUTO REFRESH
// =====================================================

function startAutoRefresh() {

    if (
        refreshTimer
    ) {

        clearInterval(
            refreshTimer
        );

    }


    refreshTimer =
        setInterval(
            () => {

                loadDashboard()
                    .catch(
                        () => {}
                    );

            },
            REFRESH_INTERVAL
        );

}


// =====================================================
// PAGE VISIBILITY
// =====================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadDashboard()
                .catch(
                    () => {}
                );

        }

    }
);


// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

document
    .querySelectorAll(".nav-item")
    .forEach((item, index) => {

        item.addEventListener("click", () => {

            console.log(
                "[Job Tracker] Navigation:",
                index
            );


            // =========================================
            // ACTIVE SIDEBAR
            // =========================================

            document
                .querySelectorAll(".nav-item")
                .forEach(nav => {

                    nav.classList.remove(
                        "active"
                    );

                });


            item.classList.add(
                "active"
            );


            // =========================================
            // RESET ALL PAGES
            // =========================================

            document
                .querySelectorAll(".page")
                .forEach(page => {

                    page.classList.remove(
                        "active"
                    );

                    page.style.display =
                        "none";

                });


            // =========================================
            // RESET DASHBOARD ELEMENTS
            // =========================================

            document
                .querySelectorAll(
                    ".main > :not(.page)"
                )
                .forEach(element => {

                    element.style.display =
                        "none";

                });


            // =========================================
            // DASHBOARD
            // =========================================

            if (index === 0) {

                document
                    .querySelectorAll(
                        ".main > :not(.page)"
                    )
                    .forEach(element => {

                        element.style.display =
                            "";

                    });


                loadDashboard();

            }


            // =========================================
            // ANALYTICS
            // =========================================

            else if (index === 1) {

                const analyticsPage =
                    document.getElementById(
                        "analyticsPage"
                    );


                if (analyticsPage) {

                    analyticsPage.classList.add(
                        "active"
                    );

                    analyticsPage.style.display =
                        "";

                }


                loadAnalytics();

            }


            // =========================================
            // REMINDERS
            // =========================================

            else if (index === 2) {

                const remindersPage =
                    document.getElementById(
                        "remindersPage"
                    );


                if (remindersPage) {

                    remindersPage.classList.add(
                        "active"
                    );

                    remindersPage.style.display =
                        "";

                }


                loadReminders();

            }

        });

    });

// =====================================================
// SYNC BUTTON
// =====================================================

const syncButton =
    document.getElementById(
        "syncButton"
    );


if (syncButton) {

    syncButton.addEventListener(
        "click",
        syncDashboard
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "[Job Tracker] Dashboard loaded"
        );


        loadDashboard()
            .catch(
                () => {}
            );


        startAutoRefresh();

    }
);

// =====================================================
// LOAD ANALYTICS
// =====================================================

async function loadAnalytics() {

    try {

        console.log(
            "[Job Tracker] Loading analytics..."
        );

        const response =
            await fetch(
                API_URL +
                "?action=dashboard&_=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store",
                    redirect: "follow"
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const result =
            await response.json();

        console.log(
            "[Job Tracker] Analytics source:",
            result
        );

        if (!result.success) {

            throw new Error(
                result.error ||
                "Gagal mengambil data"
            );

        }

        const applications =
            Array.isArray(
                result.data?.applications
            )
                ? result.data.applications
                : [];

        console.log(
            "[Job Tracker] Applications:",
            applications
        );

        const analytics =
            calculateAnalytics(
                applications
            );

        console.log(
            "[Job Tracker] Analytics calculated:",
            analytics
        );

        renderAnalytics(
            analytics
        );

    } catch (error) {

        console.error(
            "[Job Tracker] Analytics error:",
            error
        );

    }

}

function calculateAnalytics(applications) {

    const total =
        applications.length;


    // =========================
    // STATUS
    // =========================

    const statusCounts = {};

    applications.forEach(application => {

        const status =
            String(
                application.status || "Unknown"
            ).trim();

        statusCounts[status] =
            (statusCounts[status] || 0) + 1;

    });


    // =========================
    // PLATFORM
    // =========================

    const platformCounts = {};

    applications.forEach(application => {

        const platform =
            String(
                application.platform || "Unknown"
            ).trim();

        platformCounts[platform] =
            (platformCounts[platform] || 0) + 1;

    });


    // =========================
    // RESPONSE RATE
    // =========================

    const responded =
        applications.filter(application => {

            const status =
                String(
                    application.status || ""
                )
                .trim()
                .toLowerCase();

            return (
                status !== "" &&
                status !== "applied"
            );

        }).length;


    const responseRate =
        total > 0
            ? (
                responded /
                total *
                100
            ).toFixed(1)
            : "0.0";


    // =========================
    // INTERVIEW RATE
    // =========================

    const interviews =
        applications.filter(application => {

            return String(
                application.status || ""
            )
            .trim()
            .toLowerCase() === "interview";

        }).length;


    const interviewRate =
        total > 0
            ? (
                interviews /
                total *
                100
            ).toFixed(1)
            : "0.0";


    // =========================
    // OFFER RATE
    // =========================

    const offers =
        applications.filter(application => {

            return String(
                application.status || ""
            )
            .trim()
            .toLowerCase() === "offer";

        }).length;


    const offerRate =
        total > 0
            ? (
                offers /
                total *
                100
            ).toFixed(1)
            : "0.0";


    // =========================
    // MONTHLY
    // =========================

    const monthly = {};

    applications.forEach(application => {

        if (!application.date) {
            return;
        }

        const date =
            new Date(
                application.date
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return;
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const key =
            `${year}-${month}`;

        monthly[key] =
            (monthly[key] || 0) + 1;

    });


    return {

        total,
        responseRate,
        interviewRate,
        offerRate,
        platformCounts,
        statusCounts,
        monthly

    };

}


// =====================================================
// RENDER ANALYTICS
// =====================================================

function renderAnalytics(data) {

    document
        .getElementById(
            "analyticsTotal"
        )
        .textContent =
        data.total || 0;


    document
        .getElementById(
            "analyticsResponseRate"
        )
        .textContent =
        `${data.responseRate || 0}%`;


    document
        .getElementById(
            "analyticsInterviewRate"
        )
        .textContent =
        `${data.interviewRate || 0}%`;


    document
        .getElementById(
            "analyticsOfferRate"
        )
        .textContent =
        `${data.offerRate || 0}%`;


    renderPlatformAnalytics(
        data.platformCounts || {}
    );


    renderStatusAnalytics(
        data.statusCounts || {}
    );


    renderMonthlyAnalytics(
        data.monthly || {}
    );

}


// =====================================================
// PLATFORM ANALYTICS
// =====================================================

function renderPlatformAnalytics(
    platforms
) {

    const container =
        document.getElementById(
            "platformAnalytics"
        );


    container.innerHTML = "";


    const entries =
        Object.entries(
            platforms
        );


    if (entries.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No platform data available.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );


    entries
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(
            ([name, count]) => {

                const percentage =
                    (
                        count / max
                    ) * 100;


                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "analytics-bar";


                item.innerHTML = `

                    <div
                        class="analytics-bar-header"
                    >

                        <span
                            class="analytics-bar-name"
                        >
                            ${escapeHtml(name)}
                        </span>

                        <span
                            class="analytics-bar-value"
                        >
                            ${count}
                        </span>

                    </div>


                    <div
                        class="analytics-progress"
                    >

                        <div
                            class="analytics-progress-fill"
                            style="
                                width:${percentage}%;
                            "
                        ></div>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


// =====================================================
// STATUS ANALYTICS
// =====================================================

function renderStatusAnalytics(
    statuses
) {

    const container =
        document.getElementById(
            "statusAnalytics"
        );


    container.innerHTML = "";


    const entries =
        Object.entries(
            statuses
        );


    if (entries.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No status data available.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );


    entries.forEach(
        ([name, count]) => {

            const percentage =
                (
                    count / max
                ) * 100;


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "analytics-bar";


            item.innerHTML = `

                <div
                    class="analytics-bar-header"
                >

                    <span
                        class="analytics-bar-name"
                    >
                        ${escapeHtml(name)}
                    </span>

                    <span
                        class="analytics-bar-value"
                    >
                        ${count}
                    </span>

                </div>


                <div
                    class="analytics-progress"
                >

                    <div
                        class="analytics-progress-fill"
                        style="
                            width:${percentage}%;
                        "
                    ></div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// =====================================================
// MONTHLY ANALYTICS
// =====================================================

function renderMonthlyAnalytics(
    monthly
) {

    const container =
        document.getElementById(
            "monthlyAnalytics"
        );


    container.innerHTML = "";


    const entries =
        Object.entries(
            monthly
        )
        .sort(
            (a, b) =>
                a[0].localeCompare(
                    b[0]
                )
        );


    if (entries.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No monthly data available.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );


    entries.forEach(
        ([month, count]) => {

            const height =
                Math.max(
                    (
                        count / max
                    ) * 100,
                    3
                );


            const date =
                new Date(
                    `${month}-01T00:00:00`
                );


            const label =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short"
                    }
                );


            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "month-column";


            column.innerHTML = `

                <div
                    class="month-value"
                >
                    ${count}
                </div>

                <div
                    class="month-bar"
                    style="
                        height:${height}%;
                    "
                ></div>

                <div
                    class="month-label"
                >
                    ${label}
                </div>

            `;


            container.appendChild(
                column
            );

        }
    );

}



// =====================================================
// RENDER ANALYTICS
// =====================================================

function renderAnalytics(data) {

    document
        .getElementById(
            "analyticsTotal"
        )
        .textContent =
        data.total || 0;


    document
        .getElementById(
            "analyticsResponseRate"
        )
        .textContent =
        `${data.responseRate || 0}%`;


    document
        .getElementById(
            "analyticsInterviewRate"
        )
        .textContent =
        `${data.interviewRate || 0}%`;


    document
        .getElementById(
            "analyticsOfferRate"
        )
        .textContent =
        `${data.offerRate || 0}%`;


    renderPlatformAnalytics(
        data.platformCounts || {}
    );


    renderStatusAnalytics(
        data.statusCounts || {}
    );


    renderMonthlyAnalytics(
        data.monthly || {}
    );

}


// =====================================================
// PLATFORM ANALYTICS
// =====================================================

function renderPlatformAnalytics(
    platforms
) {

    const container =
        document.getElementById(
            "platformAnalytics"
        );


    container.innerHTML = "";


    const entries =
        Object.entries(
            platforms
        );


    if (entries.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No platform data available.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );


    entries
        .sort(
            (a, b) =>
                b[1] - a[1]
        )
        .forEach(
            ([name, count]) => {

                const percentage =
                    (
                        count / max
                    ) * 100;


                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "analytics-bar";


                item.innerHTML = `

                    <div
                        class="analytics-bar-header"
                    >

                        <span
                            class="analytics-bar-name"
                        >
                            ${escapeHtml(name)}
                        </span>

                        <span
                            class="analytics-bar-value"
                        >
                            ${count}
                        </span>

                    </div>


                    <div
                        class="analytics-progress"
                    >

                        <div
                            class="analytics-progress-fill"
                            style="
                                width:${percentage}%;
                            "
                        ></div>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

}


// =====================================================
// STATUS ANALYTICS
// =====================================================

function renderStatusAnalytics(
    statuses
) {

    const container =
        document.getElementById(
            "statusAnalytics"
        );


    container.innerHTML = "";


    const entries =
        Object.entries(
            statuses
        );


    if (entries.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No status data available.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );


    entries.forEach(
        ([name, count]) => {

            const percentage =
                (
                    count / max
                ) * 100;


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "analytics-bar";


            item.innerHTML = `

                <div
                    class="analytics-bar-header"
                >

                    <span
                        class="analytics-bar-name"
                    >
                        ${escapeHtml(name)}
                    </span>

                    <span
                        class="analytics-bar-value"
                    >
                        ${count}
                    </span>

                </div>


                <div
                    class="analytics-progress"
                >

                    <div
                        class="analytics-progress-fill"
                        style="
                            width:${percentage}%;
                        "
                    ></div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// =====================================================
// MONTHLY ANALYTICS
// =====================================================

function renderMonthlyAnalytics(
    monthly
) {

    const container =
        document.getElementById(
            "monthlyAnalytics"
        );


    container.innerHTML = "";


    const entries =
        Object.entries(
            monthly
        )
        .sort(
            (a, b) =>
                a[0].localeCompare(
                    b[0]
                )
        );


    if (entries.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No monthly data available.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );


    entries.forEach(
        ([month, count]) => {

            const height =
                Math.max(
                    (
                        count / max
                    ) * 100,
                    3
                );


            const date =
                new Date(
                    `${month}-01T00:00:00`
                );


            const label =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short"
                    }
                );


            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "month-column";


            column.innerHTML = `

                <div
                    class="month-value"
                >
                    ${count}
                </div>

                <div
                    class="month-bar"
                    style="
                        height:${height}%;
                    "
                ></div>

                <div
                    class="month-label"
                >
                    ${label}
                </div>

            `;


            container.appendChild(
                column
            );

        }
    );

}

function escapeJs(value) {

    return String(
        value || ""
    )
    .replaceAll(
        "\\",
        "\\\\"
    )
    .replaceAll(
        "'",
        "\\'"
    )
    .replaceAll(
        "\n",
        "\\n"
    )
    .replaceAll(
        "\r",
        "\\r"
    );

}
