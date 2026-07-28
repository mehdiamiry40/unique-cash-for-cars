(function () {
  "use strict";

  var feedbackEndpoint =
    "https://mail.uniquecashforcars.com.au/wp-json/contact-form-7/v1/contact-forms/5/feedback";
  var analyticsStorageKey = "ucfc-analytics-consent";
  var gtmId = "GTM-KKH55J9";

  function loadAnalytics() {
    if (window.__ucfcAnalyticsLoaded) return;
    window.__ucfcAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js",
    });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + gtmId;
    document.head.appendChild(script);
  }

  function initializePrivacyChoices() {
    var banner = document.getElementById("privacy-consent");
    if (!banner) return;

    var storedChoice = null;
    try {
      storedChoice = window.localStorage.getItem(analyticsStorageKey);
    } catch {}

    if (storedChoice === "accepted") {
      loadAnalytics();
      return;
    }
    if (storedChoice === "declined") return;

    banner.hidden = false;
    banner.querySelectorAll("[data-consent]").forEach(function (button) {
      button.addEventListener("click", function () {
        var accepted = button.dataset.consent === "accept";
        try {
          window.localStorage.setItem(
            analyticsStorageKey,
            accepted ? "accepted" : "declined",
          );
        } catch {}
        banner.hidden = true;
        if (accepted) loadAnalytics();
      });
    });
  }

  function initializeVideoPlayers() {
    document.querySelectorAll(".video-lite[data-youtube-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        var videoId = button.dataset.youtubeId;
        if (!videoId) return;
        var iframe = document.createElement("iframe");
        iframe.src =
          "https://www.youtube-nocookie.com/embed/" +
          encodeURIComponent(videoId) +
          "?autoplay=1";
        iframe.title = "Unique Cash for Cars video";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        button.replaceChildren(iframe);
      });
    });
  }

  function enhanceForms() {
    var labels = {
      Name: "Your name",
      Phone: "Phone number",
      Email: "Email address",
      address: "Vehicle location",
      MakeModel: "Vehicle make, model and year",
      Price: "Expected price",
      details: "Vehicle condition",
    };
    var autocomplete = {
      Name: "name",
      Phone: "tel",
      Email: "email",
      address: "street-address",
    };

    document.querySelectorAll(".wpcf7-form").forEach(function (form) {
      Object.keys(labels).forEach(function (name) {
        var field = form.querySelector('[name="' + name + '"]');
        if (!field) return;
        if (!field.getAttribute("aria-label")) {
          field.setAttribute("aria-label", labels[name]);
        }
        if (autocomplete[name]) {
          field.setAttribute("autocomplete", autocomplete[name]);
        }
      });
    });
  }

  function initializeQuoteLinks() {
    document.addEventListener("click", function (event) {
      var trigger =
        event.target instanceof Element
          ? event.target.closest(".get-quote-popup")
          : null;
      if (!trigger) return;
      var form = document.querySelector(".wpcf7-form");
      if (!form) return;
      event.preventDefault();
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      var firstField = form.querySelector("input:not([type=hidden]), textarea, select");
      if (firstField) {
        window.setTimeout(function () {
          firstField.focus();
        }, 450);
      }
    });
  }

  function setStatus(form, status) {
    [
      "init",
      "submitting",
      "resetting",
      "validating",
      "payment-required",
      "acceptance-missing",
      "spam",
      "invalid",
      "unaccepted",
      "sent",
      "failed",
      "aborted",
    ].forEach(function (name) {
      form.classList.remove(name);
    });
    form.classList.add(status);
    form.dataset.status = status;
  }

  function clearValidation(form) {
    form.querySelectorAll(".wpcf7-not-valid-tip").forEach(function (tip) {
      tip.remove();
    });
    form.querySelectorAll(".wpcf7-not-valid").forEach(function (field) {
      field.classList.remove("wpcf7-not-valid");
      field.setAttribute("aria-invalid", "false");
    });
  }

  function showValidation(form, invalidFields) {
    invalidFields.forEach(function (invalid) {
      var wrap = form.querySelector(
        '.wpcf7-form-control-wrap[data-name="' + CSS.escape(invalid.field) + '"]',
      );
      if (!wrap) return;

      var field = wrap.querySelector(".wpcf7-form-control");
      if (field) {
        field.classList.add("wpcf7-not-valid");
        field.setAttribute("aria-invalid", "true");
        if (invalid.error_id) field.setAttribute("aria-describedby", invalid.error_id);
      }

      var tip = document.createElement("span");
      tip.className = "wpcf7-not-valid-tip";
      tip.setAttribute("aria-hidden", "true");
      if (invalid.error_id) tip.id = invalid.error_id;
      tip.textContent = invalid.message || "Please fill out this field.";
      wrap.appendChild(tip);
    });
  }

  function dispatchContactFormEvent(form, name, response) {
    form.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        detail: {
          contactFormId: Number(form.querySelector('[name="_wpcf7"]')?.value || 5),
          pluginVersion: form.querySelector('[name="_wpcf7_version"]')?.value || "",
          contactFormLocale: form.querySelector('[name="_wpcf7_locale"]')?.value || "",
          unitTag: form.querySelector('[name="_wpcf7_unit_tag"]')?.value || "",
          containerPostId: Number(
            form.querySelector('[name="_wpcf7_container_post"]')?.value || 0,
          ),
          status: response.status,
          inputs: Array.from(new FormData(form).entries()).map(function (entry) {
            return { name: entry[0], value: entry[1] };
          }),
          apiResponse: response,
        },
      }),
    );
  }

  document.addEventListener(
    "submit",
    async function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.classList.contains("wpcf7-form")) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      var output = form.querySelector(".wpcf7-response-output");
      var submit = form.querySelector(".wpcf7-submit");
      clearValidation(form);
      setStatus(form, "submitting");
      form.setAttribute("aria-busy", "true");
      if (submit) submit.disabled = true;

      try {
        var request = await fetch(feedbackEndpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        var response = await request.json();

        if (!request.ok) {
          throw new Error(response.message || "The quote request could not be sent.");
        }

        if (output) {
          output.textContent = response.message || "";
          output.style.display = "block";
        }

        if (response.invalid_fields?.length) {
          showValidation(form, response.invalid_fields);
        }

        var eventName = "wpcf7submit";
        var status = "init";
        if (response.status === "mail_sent") {
          status = "sent";
          eventName = "wpcf7mailsent";
          form.reset();
          if (window.dataLayer) {
            window.dataLayer.push({ event: "quote_form_submitted" });
          }
        } else if (response.status === "validation_failed") {
          status = "invalid";
          eventName = "wpcf7invalid";
        } else if (response.status === "acceptance_missing") {
          status = "unaccepted";
          eventName = "wpcf7unaccepted";
        } else if (response.status === "spam") {
          status = "spam";
          eventName = "wpcf7spam";
        } else if (response.status === "aborted") {
          status = "aborted";
          eventName = "wpcf7aborted";
        } else if (response.status === "mail_failed") {
          status = "failed";
          eventName = "wpcf7mailfailed";
        }

        setStatus(form, status);
        dispatchContactFormEvent(form, eventName, response);
        if (eventName !== "wpcf7submit") {
          dispatchContactFormEvent(form, "wpcf7submit", response);
        }
      } catch (error) {
        setStatus(form, "failed");
        if (output) {
          output.textContent =
            error instanceof Error
              ? error.message
              : "There was an error trying to send your message. Please try again later.";
          output.style.display = "block";
        }
      } finally {
        form.removeAttribute("aria-busy");
        if (submit) submit.disabled = false;
      }
    },
    true,
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initializePrivacyChoices();
      initializeVideoPlayers();
      initializeQuoteLinks();
      enhanceForms();
    });
  } else {
    initializePrivacyChoices();
    initializeVideoPlayers();
    initializeQuoteLinks();
    enhanceForms();
  }
})();
