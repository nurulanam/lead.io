/* ==========================================================================
   Lead.io — Careers page interactions
   Role filtering + application form validation.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     Role filter
  ------------------------------------------------------------------ */
  var filters = $$("[data-role-filter]");
  var roles = $$("[data-role-list] .cs-role");
  var emptyState = $("[data-role-empty]");

  filters.forEach(function (filter) {
    filter.addEventListener("click", function () {
      var team = filter.getAttribute("data-role-filter");

      filters.forEach(function (other) {
        var active = other === filter;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      var visible = 0;
      roles.forEach(function (role) {
        var match = team === "all" || role.getAttribute("data-team") === team;
        role.hidden = !match;
        if (match) visible++;
      });

      if (emptyState) emptyState.hidden = visible > 0;
    });
  });

  /* ------------------------------------------------------------------
     Application form
  ------------------------------------------------------------------ */
  var applyForm = $("[data-apply-form]");

  function fieldError(field) {
    return field ? $('[data-error-for="' + field.id + '"]') : null;
  }

  function setError(field, message) {
    var wrapper = field ? field.closest(".form-field") : null;
    var error = fieldError(field);
    if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
    if (field) {
      if (message) {
        field.setAttribute("aria-invalid", "true");
        if (error) field.setAttribute("aria-describedby", error.id);
      } else {
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
      }
    }
    if (error) error.textContent = message || "";
  }

  if (applyForm) {
    var successPanel = $("#apply-success");
    var ids = ["ap-name", "ap-email", "ap-link", "ap-role"];

    ids.forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      var clear = function () { setError(field, ""); };
      field.addEventListener("input", clear);
      field.addEventListener("change", clear);
    });

    var consent = $("#ap-consent");
    var consentError = $("#ap-consent-error");

    if (consent) {
      consent.addEventListener("change", function () {
        if (consentError) consentError.textContent = "";
        consent.removeAttribute("aria-invalid");
      });
    }

    applyForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = $("#ap-name");
      var email = $("#ap-email");
      var link = $("#ap-link");
      var role = $("#ap-role");
      var firstInvalid = null;
      var errors = 0;

      function check(field, condition, message) {
        var valid = condition;
        setError(field, valid ? "" : message);
        if (!valid) {
          errors++;
          if (!firstInvalid) firstInvalid = field;
        }
      }

      check(name, name.value.trim().length >= 2, "Please tell us your name.");
      check(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), "Enter a valid email address.");
      check(link, !link.value.trim() || /^https?:\/\/.+\..+/.test(link.value.trim()), "Include the full link, starting with https://");
      check(role, Boolean(role.value), "Choose the role you’re applying for.");

      if (consentError) {
        var consentOk = consent.checked;
        consentError.textContent = consentOk ? "" : "Please agree to be contacted so we can reply.";
        consent.setAttribute("aria-invalid", consentOk ? "false" : "true");
        if (!consentOk) {
          errors++;
          if (!firstInvalid) firstInvalid = consent;
        }
      }

      if (errors > 0) {
        if (firstInvalid) {
          if (firstInvalid.hasAttribute("data-select-native")) {
            var wrap = firstInvalid.closest("[data-select]");
            var trigger = wrap ? $("[data-select-trigger]", wrap) : null;
            (trigger || firstInvalid).focus();
          } else {
            firstInvalid.focus();
          }
        }
        return;
      }

      applyForm.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.setAttribute("tabindex", "-1");
        successPanel.focus({ preventScroll: true });
      }
      applyForm.reset();
    });
  }
})();
