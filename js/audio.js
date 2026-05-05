/**
 * SIGNAL LOST — Week 9 snapshot audio
 * Minimal audio surface for Night 1 demo: rain loop + typing tick + notification + simple tones.
 */
(function () {
  "use strict";

  var ctx = null;
  var masterGain = null;
  var sfxGain = null;
  var buffers = {};
  var htmlAudios = {};
  var rainPlaying = false;

  function getCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.85;
      masterGain.connect(ctx.destination);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 1;
      sfxGain.connect(masterGain);
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }

  function resume() {
    var c = getCtx();
    if (c && c.state === "suspended") c.resume();
  }

  function loadBuffer(url, name) {
    var c = getCtx();
    if (!c) return;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";
    req.onload = function () {
      c.decodeAudioData(
        req.response,
        function (buf) {
          buffers[name] = buf;
        },
        function () {}
      );
    };
    req.send();
  }

  function preloadOptionalFiles() {
    var base = "assets/audio/";
    [
      { name: "notification", file: "notification.mp3" },
      { name: "typing", file: "typing.mp3" },
      { name: "rain", file: "rain.mp3" },
    ].forEach(function (f) {
      loadBuffer(base + f.file, f.name);
      var a = new Audio();
      a.preload = "auto";
      a.src = base + f.file;
      htmlAudios[f.name] = a;
    });
  }

  function playTone(freq, dur, vol) {
    var c = getCtx();
    if (!c || !sfxGain) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(sfxGain);
    var t = c.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function playBuffer(name, gainValue) {
    var c = getCtx();
    if (!c || !buffers[name] || !sfxGain) {
      playTone(880, 0.06, Math.max(0, gainValue) * 0.25);
      return;
    }
    var src = c.createBufferSource();
    src.buffer = buffers[name];
    var g = c.createGain();
    g.gain.value = gainValue;
    src.connect(g);
    g.connect(sfxGain);
    src.start(c.currentTime);
  }

  function playNotification() {
    resume();
    playBuffer("notification", 0.45);
  }

  function playTypingTick() {
    resume();
    if (buffers.typing) {
      playBuffer("typing", 0.2);
    } else {
      playTone(1200 + Math.random() * 400, 0.02, 0.04);
    }
  }

  function startRainLoop() {
    resume();
    var a = htmlAudios.rain;
    if (!a || !a.src) return { stop: function () {}, fadeOut: function () {} };
    a.loop = true;
    a.volume = 0.08;
    rainPlaying = true;
    a.play().catch(function () {});
    return {
      stop: function () {
        rainPlaying = false;
        try {
          a.pause();
          a.currentTime = 0;
        } catch (e) {}
      },
      fadeOut: function (ms) {
        fadeRainOut(ms || 1200);
      },
    };
  }

  function fadeRainOut(ms) {
    var a = htmlAudios.rain;
    if (!a) return;
    if (!rainPlaying && a.paused) return;
    var steps = 24;
    var step = 0;
    var start = a.volume || 0.08;
    var id = setInterval(function () {
      step++;
      var k = 1 - step / steps;
      a.volume = Math.max(0, start * k);
      if (step >= steps) {
        clearInterval(id);
        try {
          a.pause();
        } catch (e) {}
        rainPlaying = false;
      }
    }, Math.max(80, ms) / steps);
  }

  // Week 9 snapshot keeps this API surface used by Night 1 scripts.
  preloadOptionalFiles();

  window.SignalLostAudio = {
    resume: resume,
    // kept for compatibility; Week 9 doesn’t vary mix per-night
    setNight: function () {},
    playNotification: playNotification,
    playTypingTick: playTypingTick,
    startRainLoop: startRainLoop,
    fadeRainOut: fadeRainOut,
    playTone: playTone,
  };
})();
