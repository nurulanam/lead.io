/* ==========================================================================
   Lead.io — interactions
   Vanilla JS. No dependencies. Progressive enhancement.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var money = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  });

  var moneyExact = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  /* ------------------------------------------------------------------
     Header: glass on scroll, reading progress, active section
  ------------------------------------------------------------------ */
  var header = $("[data-header]");
  var progress = $("[data-progress]");
  var navLinks = $$(".nav-links a");
  var sections = $$("main section[id]");

  var ticking = false;

  function onScrollFrame() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("is-scrolled", y > 28);
    }

    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min((y / max) * 100, 100) : 0;
      progress.style.width = pct + "%";
    }

    if (navLinks.length && sections.length) {
      var probe = y + 150;
      var current = "";
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= probe) current = sections[i].id;
      }
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + current;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    ticking = false;
  }

  function requestScrollFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScrollFrame);
  }

  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", requestScrollFrame);
  onScrollFrame();

  /* ------------------------------------------------------------------
     Mobile navigation
  ------------------------------------------------------------------ */
  var navToggle = $("[data-nav-toggle]");
  var navMenu = $("[data-nav-menu]");
  var mainEl = $("#main");
  var footerEl = $(".footer");
  var conciergeEl = $("[data-concierge]");

  function setNav(open) {
    if (!navToggle || !navMenu) return;
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);

    [mainEl, footerEl, conciergeEl].forEach(function (el) {
      if (!el) return;
      try {
        el.inert = open;
      } catch (err) {
        /* inert unsupported — ignore */
      }
    });

    if (open) {
      var firstLink = $(".nav-links a", navMenu);
      if (firstLink) {
        window.setTimeout(function () { firstLink.focus(); }, 220);
      }
    }
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var willOpen = !navMenu.classList.contains("is-open");
      setNav(willOpen);
      if (!willOpen) navToggle.focus();
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setNav(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        setNav(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && navMenu.classList.contains("is-open")) {
        setNav(false);
      }
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveals
  ------------------------------------------------------------------ */
  var revealEls = $$(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }
  }

  /* ------------------------------------------------------------------
     Animated counters
  ------------------------------------------------------------------ */
  var statValues = $$("[data-count]");

  function formatCount(value, decimals, prefix) {
    var formatted = Number(value).toLocaleString("en-CA", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return (prefix || "") + formatted;
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";

    if (reduceMotion) {
      el.textContent = formatCount(target, decimals, prefix);
      return;
    }

    var duration = 1500;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progressValue = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progressValue, 3);
      el.textContent = formatCount(target * eased, decimals, prefix);
      if (progressValue < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatCount(target, decimals, prefix);
      }
    }

    el.textContent = formatCount(0, decimals, prefix);
    window.requestAnimationFrame(step);
  }

  if (statValues.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var statObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.55 }
      );
      statValues.forEach(function (el) { statObserver.observe(el); });
    } else {
      statValues.forEach(function (el) {
        el.textContent = formatCount(
          parseFloat(el.getAttribute("data-count")),
          parseInt(el.getAttribute("data-decimals") || "0", 10),
          el.getAttribute("data-prefix") || ""
        );
      });
    }
  }

  /* ------------------------------------------------------------------
     Live rate card tabs
  ------------------------------------------------------------------ */
  var rateSets = {
    fixed: [
      { term: "5-year fixed", rate: "3.99", apr: "APR 4.04%" },
      { term: "3-year fixed", rate: "4.14", apr: "APR 4.19%" },
      { term: "Insured 5-year fixed", rate: "3.79", apr: "APR 3.84%" }
    ],
    variable: [
      { term: "5-year variable", rate: "4.05", apr: "APR 4.10%" },
      { term: "3-year variable", rate: "4.25", apr: "APR 4.30%" },
      { term: "Home equity line", rate: "5.15", apr: "APR 5.20%" }
    ]
  };

  var rateTabs = $$("[data-rate-tab]");
  var rateRows = $$("[data-rate-list] li");

  rateTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-rate-tab");
      var set = rateSets[key];
      if (!set) return;

      rateTabs.forEach(function (other) {
        var active = other === tab;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
        other.setAttribute("aria-selected", String(active));
      });

      rateRows.forEach(function (row, index) {
        var data = set[index];
        if (!data) return;
        var termEl = $("[data-term]", row);
        var rateEl = $("[data-rate]", row);
        var aprEl = $("[data-apr]", row);
        if (termEl) termEl.textContent = data.term;
        if (rateEl) rateEl.textContent = data.rate;
        if (aprEl) aprEl.textContent = data.apr;
      });
    });
  });

  /* ------------------------------------------------------------------
     Mortgage calculator
  ------------------------------------------------------------------ */
  var calc = {
    price: $("[data-calc-price]"),
    down: $("[data-calc-down]"),
    rate: $("[data-calc-rate]"),
    priceOut: $("#price-out"),
    downOut: $("#down-out"),
    rateOut: $("#rate-out"),
    downHint: $("#down-hint"),
    paymentOut: $("#payment-out"),
    paymentNote: $("#payment-note"),
    loanOut: $("#loan-out"),
    cmhcOut: $("#cmhc-out"),
    interestOut: $("#interest-out"),
    termOut: $("#term-out"),
    principalOut: $("#principal-out"),
    interestMonthOut: $("#interest-month-out"),
    barPrincipal: $("#bar-principal"),
    barInterest: $("#bar-interest"),
    amortButtons: $$(".amort-btn")
  };

  if (calc.price && calc.down && calc.rate) {
    var state = {
      price: parseFloat(calc.price.value),
      downPct: parseFloat(calc.down.value),
      rate: parseFloat(calc.rate.value),
      years: 25
    };

    function minimumDownPercent(price) {
      if (price <= 500000) return 5;
      if (price <= 1500000) {
        var minimum = 0.05 * 500000 + 0.1 * (price - 500000);
        return (minimum / price) * 100;
      }
      return 20;
    }

    function cmhcRate(ltv) {
      if (ltv > 95) return 4.5;
      if (ltv > 90) return 4.0;
      if (ltv > 85) return 3.1;
      if (ltv > 80) return 2.8;
      return 0;
    }

    function setFill(input) {
      if (!input) return;
      var min = parseFloat(input.min);
      var max = parseFloat(input.max);
      var value = parseFloat(input.value);
      var pct = ((value - min) / (max - min)) * 100;
      input.style.setProperty("--fill", pct + "%");
    }

    function updateCalc() {
      var minPct = minimumDownPercent(state.price);
      var sliderMin = Math.ceil(minPct * 2) / 2;

      calc.down.min = String(sliderMin);
      if (state.downPct < sliderMin) {
        state.downPct = sliderMin;
        calc.down.value = String(sliderMin);
      }

      var downAmount = (state.price * state.downPct) / 100;
      var baseLoan = state.price - downAmount;
      var ltv = (baseLoan / state.price) * 100;
      var premiumRate = state.downPct < 20 ? cmhcRate(ltv) : 0;
      var premium = (baseLoan * premiumRate) / 100;
      var totalLoan = baseLoan + premium;

      var monthlyRate = state.rate / 100 / 12;
      var payments = state.years * 12;
      var payment = monthlyRate > 0
        ? (totalLoan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments))
        : totalLoan / payments;

      var firstInterest = totalLoan * monthlyRate;
      var firstPrincipal = Math.max(payment - firstInterest, 0);
      var principalShare = payment > 0 ? (firstPrincipal / payment) * 100 : 0;
      var totalInterest = payment * payments - totalLoan;

      if (calc.priceOut) calc.priceOut.textContent = money.format(state.price);
      if (calc.downOut) {
        calc.downOut.textContent =
          state.downPct.toLocaleString("en-CA", { maximumFractionDigits: 1 }) +
          "% · " + money.format(downAmount);
      }
      if (calc.rateOut) calc.rateOut.textContent = state.rate.toFixed(2) + "%";
      if (calc.paymentOut) {
        calc.paymentOut.textContent =
          "$" + Math.round(payment).toLocaleString("en-CA");
      }
      if (calc.paymentNote) {
        calc.paymentNote.textContent =
          "Principal & interest · " + state.years + "-year amortization" +
          (premium > 0 ? " · incl. CMHC" : "");
      }
      if (calc.loanOut) calc.loanOut.textContent = money.format(totalLoan);
      if (calc.cmhcOut) calc.cmhcOut.textContent = premium > 0 ? money.format(premium) : "$0";
      if (calc.interestOut) calc.interestOut.textContent = money.format(totalInterest);
      if (calc.termOut) calc.termOut.textContent = String(state.years);
      if (calc.principalOut) {
        calc.principalOut.textContent = "$" + Math.round(firstPrincipal).toLocaleString("en-CA");
      }
      if (calc.interestMonthOut) {
        calc.interestMonthOut.textContent = "$" + Math.round(firstInterest).toLocaleString("en-CA");
      }
      if (calc.barPrincipal) calc.barPrincipal.style.width = principalShare.toFixed(2) + "%";
      if (calc.barInterest) calc.barInterest.style.width = (100 - principalShare).toFixed(2) + "%";
      if (calc.downHint) {
        calc.downHint.classList.remove("is-warning");
        calc.downHint.textContent =
          "Minimum " + sliderMin.toLocaleString("en-CA") + "% at this price · " +
          (state.downPct < 20 ? "CMHC insurance applies under 20%" : "no CMHC insurance at 20%+");
      }

      setFill(calc.price);
      setFill(calc.down);
      setFill(calc.rate);
    }

    calc.price.addEventListener("input", function () {
      state.price = parseFloat(calc.price.value);
      updateCalc();
    });

    calc.down.addEventListener("input", function () {
      state.downPct = parseFloat(calc.down.value);
      updateCalc();
    });

    calc.rate.addEventListener("input", function () {
      state.rate = parseFloat(calc.rate.value);
      updateCalc();
    });

    calc.amortButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.years = parseInt(button.getAttribute("data-years"), 10);
        calc.amortButtons.forEach(function (other) {
          var active = other === button;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });
        updateCalc();
      });
    });

    updateCalc();
  }

  /* ------------------------------------------------------------------
     FAQ accordion
  ------------------------------------------------------------------ */
  var faqButtons = $$(".faq-q");

  // Without JS every answer is open; JS takes over and starts collapsed.
  faqButtons.forEach(function (button) {
    button.setAttribute("aria-expanded", "false");
    var item = button.closest(".faq-item");
    if (item) item.classList.remove("is-open");
  });

  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest(".faq-item");
      var isOpen = button.getAttribute("aria-expanded") === "true";

      faqButtons.forEach(function (other) {
        if (other === button) return;
        other.setAttribute("aria-expanded", "false");
        var otherItem = other.closest(".faq-item");
        if (otherItem) otherItem.classList.remove("is-open");
      });

      button.setAttribute("aria-expanded", String(!isOpen));
      if (item) item.classList.toggle("is-open", !isOpen);
    });
  });

  /* ------------------------------------------------------------------
     Contact form
  ------------------------------------------------------------------ */
  var contactForm = $("[data-contact-form]");

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

  function validateContactForm() {
    var name = $("#fullname");
    var email = $("#email");
    var phone = $("#phone");
    var interest = $("#interest");
    var consent = $("#consent");
    var consentError = $("#consent-error");
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
    check(
      phone,
      !phone.value.trim() || phone.value.replace(/\D/g, "").length >= 7,
      "That phone number looks short."
    );
    check(interest, Boolean(interest.value), "Choose what you need help with.");

    if (consentError) {
      var consentOk = consent.checked;
      consentError.textContent = consentOk ? "" : "Please agree to be contacted so we can reply.";
      consent.setAttribute("aria-invalid", consentOk ? "false" : "true");
      if (!consentOk) {
        errors++;
        if (!firstInvalid) firstInvalid = consent;
      }
    }

    return { valid: errors === 0, firstInvalid: firstInvalid };
  }

  if (contactForm) {
    var successPanel = $("#form-success");
    var fieldIds = ["fullname", "email", "phone", "interest"];

    fieldIds.forEach(function (id) {
      var field = document.getElementById(id);
      if (!field) return;
      var clear = function () { setError(field, ""); };
      field.addEventListener("input", clear);
      field.addEventListener("change", clear);
    });

    var consentEl = $("#consent");
    if (consentEl) {
      consentEl.addEventListener("change", function () {
        var error = $("#consent-error");
        if (error) error.textContent = "";
        consentEl.removeAttribute("aria-invalid");
      });
    }

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var result = validateContactForm();

      if (!result.valid) {
        if (result.firstInvalid) result.firstInvalid.focus();
        return;
      }

      contactForm.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.setAttribute("tabindex", "-1");
        successPanel.focus({ preventScroll: true });
      }
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------
     Newsletter
  ------------------------------------------------------------------ */
  var newsletter = $("[data-newsletter]");

  if (newsletter) {
    newsletter.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = $("#newsletter-email");
      var note = $("[data-newsletter-note]");
      if (!input || !note) return;

      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      if (!valid) {
        note.textContent = "That email doesn’t look right — try again?";
        note.style.color = "#ffab92";
        input.focus();
        return;
      }

      note.textContent = "You’re on the list. The first Rate Note lands Friday.";
      note.style.color = "#d8ff4f";
      newsletter.reset();
    });
  }

  /* ------------------------------------------------------------------
     Footer year + placeholder links
  ------------------------------------------------------------------ */
  var yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  document.addEventListener("click", function (event) {
    var placeholder = event.target.closest('a[href="#"]');
    if (placeholder) event.preventDefault();
  });

  /* ------------------------------------------------------------------
     Milo — the concierge
  ------------------------------------------------------------------ */
  var concierge = $("[data-concierge]");
  var launcher = $("[data-concierge-launcher]");
  var panel = $("#concierge-panel");
  var closeBtn = $("[data-concierge-close]");
  var log = $("[data-concierge-log]");
  var chips = $("[data-concierge-chips]");
  var chatForm = $("[data-concierge-form]");
  var chatInput = $("[data-concierge-input]");
  var chatCta = $("[data-concierge-cta]");
  var busy = false;

  var answers = [
    {
      keys: ["down", "deposit", "minimum", "5%"],
      text: "In Canada the minimum is 5% on the first $500k, 10% on the portion up to $1.5M, and 20% above that. Under 20% down, CMHC insurance applies — our calculator builds the premium in for you."
    },
    {
      keys: ["credit", "score", "hurt", "check"],
      text: "A pre-qualification doesn’t touch your credit at all. A full pre-approval is one check, and we shop every lender inside a single inquiry window — so your score isn’t dinged 40 times."
    },
    {
      keys: ["fee", "cost", "charge", "pay", "commission"],
      text: "On most residential mortgages the lender pays us, so there’s no broker fee to you. If a fee ever applies — private lending, complex commercial — you’ll see it in writing before we start."
    },
    {
      keys: ["first", "fhsa", "rrsp", "new buyer"],
      text: "Stack your FHSA (up to $40k lifetime, tax-free for a first home) with the RRSP Home Buyers’ Plan (up to $60k) and you could access $100k toward a down payment. We’ll map the timing for you."
    },
    {
      keys: ["renew", "switch", "renewal", "transfer"],
      text: "Send us your renewal letter. We’ll compare your lender’s offer against 40+ others in about 48 hours — and on a switch, the new lender usually covers the transfer costs."
    },
    {
      keys: ["close", "closing", "how long", "timeline", "days", "fast"],
      text: "Our average is 21 days from application to funding. A rate hold protects you for up to 120 days while you shop, so a delay on the perfect property doesn’t cost you the rate."
    },
    {
      keys: ["rate", "rates", "fixed", "variable", "apr", "interest"],
      text: "Today’s best 5-year fixed is 3.99% (APR 4.04%) and 5-year variable is 4.05% (APR 4.10%), O.A.C. Your real rate depends on credit, property and down payment — a 15-minute call gets you an exact number."
    },
    {
      keys: ["self", "employed", "business", "income"],
      text: "Self-employed is our specialty. Lenders on our panel accept business-for-self and stated-income files — bring your notices of assessment and 12–24 months of statements, and we’ll pre-shop the lenders most likely to say yes."
    }
  ];

  function scrollLog() {
    if (log) log.scrollTop = log.scrollHeight;
  }

  function addMessage(text, who) {
    if (!log) return null;
    var bubble = document.createElement("div");
    bubble.className = "msg msg--" + who;
    var p = document.createElement("p");
    p.textContent = text;
    bubble.appendChild(p);
    log.appendChild(bubble);
    scrollLog();
    return bubble;
  }

  function answerFor(question) {
    var q = question.toLowerCase();
    for (var i = 0; i < answers.length; i++) {
      var entry = answers[i];
      for (var k = 0; k < entry.keys.length; k++) {
        if (q.indexOf(entry.keys[k]) !== -1) return entry.text;
      }
    }
    return "Good question — and one a licensed broker should answer properly. Tap “Talk to a human” for a free 15-minute call, or reach us at +1 (416) 555-0142, Mon–Fri 8am–8pm ET.";
  }

  function askMilo(question) {
    if (!question || busy || !log) return;
    busy = true;

    if (chips) chips.hidden = true;
    addMessage(question, "user");

    var typing = document.createElement("div");
    typing.className = "msg msg--bot msg--typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(typing);
    scrollLog();

    window.setTimeout(function () {
      typing.remove();
      addMessage(answerFor(question), "bot");
      busy = false;
    }, reduceMotion ? 80 : 700);
  }

  function setConcierge(open) {
    if (!panel || !launcher) return;
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) {
      window.setTimeout(function () {
        if (chatInput) chatInput.focus({ preventScroll: true });
        scrollLog();
      }, 60);
    }
  }

  if (launcher && panel) {
    launcher.addEventListener("click", function () {
      setConcierge(panel.hidden);
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setConcierge(false);
        launcher.focus();
      });
    }

    if (chips) {
      chips.addEventListener("click", function (event) {
        var chip = event.target.closest("[data-question]");
        if (!chip) return;
        askMilo(chip.getAttribute("data-question"));
      });
    }

    if (chatForm && chatInput) {
      chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = chatInput.value.trim();
        if (!value) return;
        chatInput.value = "";
        askMilo(value);
      });
    }

    if (chatCta) {
      chatCta.addEventListener("click", function () { setConcierge(false); });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        setConcierge(false);
        launcher.focus();
      }
    });
  }
})();
