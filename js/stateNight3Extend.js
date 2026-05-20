/**
 * SIGNAL LOST — Night 3 state extensions (does not modify state.js).
 * Load after js/state.js on Night 3 and ending-shell pages.
 */
(function () {
  "use strict";

  var S = window.SignalLostState;
  if (!S) return;

  var STORAGE_FINAL_WORDS = "signalLost_finalWords";
  var STORAGE_NOT_YET_ROUND = "signalLost_notYetRound";
  var NIGHT3_CONTACT_SYMBOL = "\u25A3";

  var origGetFinalWords = S.getFinalWords;

  if (!S.canEnterNight3) {
    S.canEnterNight3 = function () {
      return S.getDoneHidden && S.getDoneHidden();
    };
  }

  if (!S.setFinalWords) {
    S.setFinalWords = function (text) {
      localStorage.setItem(STORAGE_FINAL_WORDS, (text || "").trim());
    };
  }

  S.getFinalWords = function () {
    var stored = localStorage.getItem(STORAGE_FINAL_WORDS);
    if (stored !== null && stored !== "") return stored;
    if (origGetFinalWords) return origGetFinalWords();
    return "still here";
  };

  if (!S.getNotYetRound) {
    S.getNotYetRound = function () {
      var raw = localStorage.getItem(STORAGE_NOT_YET_ROUND);
      if (raw === null || raw === "") return 0;
      var n = parseInt(raw, 10);
      if (isNaN(n)) return 0;
      return n < 0 ? 0 : n > 2 ? 2 : n;
    };
  }

  if (!S.setNotYetRound) {
    S.setNotYetRound = function (n) {
      var v = typeof n === "number" ? n : parseInt(n, 10);
      if (isNaN(v)) v = 0;
      if (v < 0) v = 0;
      if (v > 2) v = 2;
      localStorage.setItem(STORAGE_NOT_YET_ROUND, String(v));
    };
  }

  S.NIGHT3_CONTACT_SYMBOL = NIGHT3_CONTACT_SYMBOL;
})();
