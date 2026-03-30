/* =========================================================
 * Case Status Lookup — Demo Case Engine
 *
 * This module:
 * - Validates form input
 * - Sends case details to /submit-case backend
 * - Displays status results on the page
 * - Shows email notification confirmation
 *
 * It does NOT redirect to any external site.
 * ========================================================= */

(function () {
    "use strict";

    // --- DOM References ---
    const form = document.getElementById("caseLookupForm");
    const caseTypeSelect = document.getElementById("caseType");
    const caseNumberInput = document.getElementById("caseNumber");
    const filingYearInput = document.getElementById("filingYear");
    const courtComplexInput = document.getElementById("courtComplex");
    const errorBox = document.getElementById("errorBox");
    const infoBox = document.getElementById("infoBox");
    const resultBox = document.getElementById("resultBox");

    // --- Validation (kept from original) ---
    function validate() {
        const errors = [];

        if (!caseNumberInput.value.trim()) {
            errors.push("Case Number is required.");
        }

        const year = filingYearInput.value.trim();
        if (!year || !/^\d{4}$/.test(year)) {
            errors.push("Filing Year must be a valid 4-digit year.");
        } else {
            const y = parseInt(year, 10);
            if (y < 1950 || y > new Date().getFullYear()) {
                errors.push("Filing Year must be between 1950 and " + new Date().getFullYear() + ".");
            }
        }

        if (!courtComplexInput.value.trim()) {
            errors.push("Court Complex is required.");
        }

        return errors;
    }

    // --- Show / Hide Helpers ---
    function showError(messages) {
        errorBox.innerHTML = messages.map(function (m) { return "<p>" + m + "</p>"; }).join("");
        errorBox.style.display = "block";
    }

    function hideError() {
        errorBox.innerHTML = "";
        errorBox.style.display = "none";
    }

    function showResult(data) {
        // Build status badge color
        let badgeColor = "#3b82f6"; // default blue
        if (data.status === "Pending") badgeColor = "#f59e0b";
        else if (data.status === "Disposed") badgeColor = "#22c55e";
        else if (data.status === "Adjourned") badgeColor = "#ef4444";
        else if (data.status === "Under Review") badgeColor = "#8b5cf6";

        resultBox.innerHTML = `
            <div class="result-header">✅ Case Status Retrieved</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Case Number</span>
                    <span class="result-value">${caseNumberInput.value.trim()}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Status</span>
                    <span class="result-badge" style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}">${data.status}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Next Hearing</span>
                    <span class="result-value">${data.next_hearing}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Email Notification</span>
                    <span class="result-value">${data.email_sent ? '📧 Email notification sent successfully.' : '⚠️ Email service unavailable. Check server configuration.'}</span>
                </div>
            </div>
            <p class="result-note">Case status retrieved. ${data.email_sent ? 'Notification sent to your registered email.' : 'Email service temporarily unavailable.'}</p>
        `;
        resultBox.style.display = "block";
    }

    // --- Form Submit Handler ---
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        hideError();

        // Hide previous results
        if (resultBox) resultBox.style.display = "none";
        if (infoBox) infoBox.style.display = "none";

        var errors = validate();
        if (errors.length > 0) {
            showError(errors);
            return;
        }

        // Show loading state on button
        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "⏳ Looking up...";
        submitBtn.disabled = true;

        try {
            const response = await fetch("/submit-case", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    case_number: caseNumberInput.value.trim(),
                    year: filingYearInput.value.trim(),
                    court_type: caseTypeSelect.value
                })
            });

            const data = await response.json();

            if (data.success) {
                showResult(data);
            } else {
                showError([data.error || "An error occurred. Please try again."]);
            }
        } catch (err) {
            showError(["Connection error: " + err.message]);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
})();
