(function () {
  "use strict";

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement) || !form.classList.contains("wpcf7-form")) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      var read = function (names) {
        for (var index = 0; index < names.length; index += 1) {
          var fields = form.querySelectorAll('[name="' + names[index] + '"]');
          var field = null;
          for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
            if (fields[fieldIndex].type !== "radio" || fields[fieldIndex].checked) {
              field = fields[fieldIndex];
              break;
            }
          }
          if (field && field.value) return field.value;
        }
        return "";
      };

      var message = [
        "Hi Unique Cash for Cars, I would like a quote.",
        "Name: " + read(["Name", "your-name", "name"]),
        "Phone: " + read(["Phone", "your-phone", "phone", "tel-295"]),
        "Email: " + read(["Email", "your-email", "email"]),
        "Suburb: " + read(["address", "suburb", "your-suburb"]),
        "Vehicle: " + read(["MakeModel", "make-model-year", "vehicle", "text-709"]),
        "Expected price: " + read(["Price", "expected-price", "price"]),
        "Fuel: " + read(["car-fuel"]),
        "Condition: " + read(["details", "car-condition", "condition"]),
      ]
        .filter(function (line) {
          return !line.endsWith(": ");
        })
        .join("\\n");

      var output = form.querySelector(".wpcf7-response-output");
      if (output) {
        output.textContent = "Your quote request is ready to send by text.";
        output.style.display = "block";
      }
      window.location.href =
        "sms:0423476111?&body=" + encodeURIComponent(message);
    },
    true,
  );
})();
