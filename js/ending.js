/**
 * SIGNAL LOST — shared ending helpers.
 */
(function () {
  "use strict";

  function fadeToWhite(el, ms) {
    el.style.transition = "opacity " + ms + "ms ease";
    el.style.opacity = "0";
  }

  window.SignalLostEnding = {
    fadeToWhite: fadeToWhite,
    readFinalLine: function () {
      return window.SignalLostState ? window.SignalLostState.getFinalWords() : "";
    },
    readPhrases: function () {
      return window.SignalLostState ? window.SignalLostState.getPhrases() : [];
    },
  };
})();
