/**
 * SIGNAL LOST — Night 3 / ending audio extensions (does not modify audio.js).
 * Load after js/audio.js on Night 3 and ending-shell pages.
 */
(function () {
  "use strict";

  var A = window.SignalLostAudio;
  if (!A || A.playHeartbeatRate) return;

  var nightLevel = 1;
  var origSetNight = A.setNight;
  var voicemailEl = null;

  function getVoicemail() {
    if (!voicemailEl) {
      voicemailEl = new Audio("assets/audio/voicemail.mp3");
      voicemailEl.preload = "auto";
    }
    return voicemailEl;
  }

  A.setNight = function (n) {
    nightLevel = typeof n === "number" ? n : parseInt(n, 10);
    if (isNaN(nightLevel)) nightLevel = 1;
    if (origSetNight) origSetNight(nightLevel);
  };

  A.playHeartbeatRate = function (hz) {
    A.resume();
    if (A.playTone) A.playTone(hz, 0.08, 0.25);
  };

  A.playVoicemail = function (callback) {
    A.resume();
    var vm = getVoicemail();
    vm.onended = function () {
      if (callback) callback();
    };
    vm.play().catch(function () {
      if (A.playTone) A.playTone(392, 0.35, 0.15);
      setTimeout(function () {
        if (callback) callback();
      }, 500);
    });
  };

  A.fadeMaster = function () {
    /* Week 9 master bus is internal; static ending uses tone + CSS only */
  };

  A.playEndingFoundSequence = function (onAfterVoicemail) {
    A.setNight(3);
    A.playVoicemail(function () {
      if (A.playTone) A.playTone(660, 1.2, 0.08);
      if (onAfterVoicemail) onAfterVoicemail();
    });
  };

  A.playEndingStaticProfile = function () {
    A.resume();
    if (A.playTone) A.playTone(220, 0.8, 0.1);
  };

  A.playEndingNotYetPing = function () {
    A.resume();
    setTimeout(function () {
      A.playNotification();
    }, 1400);
  };
})();
