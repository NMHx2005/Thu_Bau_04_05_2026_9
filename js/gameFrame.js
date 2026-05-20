/**
 * SIGNAL LOST — wrap page content in a fixed-size centered game viewport.
 * Load as the first <script> at the end of <body> (before other game scripts).
 */
(function () {
  "use strict";

  var self = document.currentScript;
  if (!self || document.body.classList.contains("game-framed")) return;

  var viewport = document.createElement("div");
  viewport.className = "game-viewport";
  viewport.setAttribute("role", "application");
  viewport.setAttribute("aria-label", "SIGNAL LOST");

  var inner = document.createElement("div");
  inner.className = "game-viewport__inner";
  var pageClasses = (document.body.className || "")
    .replace(/\bgame-framed\b/g, "")
    .trim();
  if (pageClasses) {
    inner.className += " " + pageClasses;
  }

  var nodes = [];
  var i;
  for (i = 0; i < document.body.childNodes.length; i++) {
    var node = document.body.childNodes[i];
    if (node === self) continue;
    nodes.push(node);
  }

  nodes.forEach(function (node) {
    inner.appendChild(node);
  });

  viewport.appendChild(inner);
  document.body.insertBefore(viewport, self);
  document.documentElement.classList.add("game-framed");
  document.body.classList.add("game-framed");

  /** Scale phone shell down if still taller than the frame (keeps layout, no clip). */
  function fitPhoneInFrame() {
    var shell = document.querySelector(".game-viewport__inner");
    if (!shell) return;
    var pad = 20;
    var avail = shell.clientHeight - pad;
    var frames = shell.querySelectorAll(".phone-frame");
    var i;
    for (i = 0; i < frames.length; i++) {
      var frame = frames[i];
      var phase = frame.closest(
        "#phase-phone, #phase-apps, #phase-memory, #phase-chat, .page-stage"
      );
      if (!phase || phase.classList.contains("night-hidden")) {
        frame.style.transform = "";
        continue;
      }
      frame.style.transform = "";
      frame.style.transformOrigin = "center center";
      var h = frame.offsetHeight;
      if (h > avail && avail > 80) {
        frame.style.transform = "scale(" + avail / h + ")";
      }
    }
  }

  function scheduleFit() {
    requestAnimationFrame(fitPhoneInFrame);
    setTimeout(fitPhoneInFrame, 120);
    setTimeout(fitPhoneInFrame, 400);
  }

  scheduleFit();
  window.addEventListener("resize", fitPhoneInFrame);

  if (typeof MutationObserver !== "undefined") {
    var mo = new MutationObserver(function (mutations) {
      var watch = false;
      for (var m = 0; m < mutations.length; m++) {
        if (mutations[m].type === "attributes" && mutations[m].attributeName === "class") {
          watch = true;
          break;
        }
      }
      if (watch) scheduleFit();
    });
    mo.observe(inner, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    });
  }

  window.SignalLostFrame = { fitPhone: fitPhoneInFrame };
})();
