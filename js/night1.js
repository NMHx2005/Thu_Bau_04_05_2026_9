/**
 * SIGNAL LOST — Night 1: explore, dial, chat, signal decode.
 * Signal decode should reveal the “last place before the bedroom” (proposal).
 * Add assets/images/LastLocation.png — if missing, falls back to Bedroom.png.
 */
(function () {
  "use strict";

  /** Image revealed at 100% signal (e.g. park / bench — not the bedroom). */
  var IMG_LAST_LOCATION = "assets/images/LastLocation.png";
  var IMG_LAST_LOCATION_FALLBACK = "assets/images/Bedroom.png";

  var visited = {};
  var dialBuf = "";
  var rainCtl = null;
  var decodeCtl = null;

  var LORE = {
    laptop:
      "Draft unsent: “I’ll call when I—” The cursor blinks. The rest is gone. The files ask for a password you don’t remember choosing.",
    window:
      "Rain writes vertical lines on the glass. You look for your reflection. There isn’t one—only the room behind you, softer than it should be.",
    note:
      "Ink smudged by thumbprints. A number: 0427 318 247. It feels like yours and not like yours.",
    photo:
      "A face you should know, smeared into shadow. The frame is warm, as if someone held it too long.",
    coat:
      "The coat is heavier than cloth should be—still holding the shape of shoulders, still holding heat.",
  };

  function $(id) {
    return document.getElementById(id);
  }

  function showLore(text) {
    var host = $("loreHost");
    host.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "lore-overlay";
    var box = document.createElement("div");
    box.className = "lore-overlay__box";
    box.textContent = text;
    wrap.appendChild(box);
    wrap.addEventListener("click", function () {
      host.innerHTML = "";
    });
    host.appendChild(wrap);
  }

  function updateExploreCta() {
    var n = Object.keys(visited).length;
    $("btnToDial").disabled = n < 5;
  }

  function initExplore() {
    document.querySelectorAll(".hotspot").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        visited[id] = true;
        showLore(LORE[id] || "");
        if (window.SignalLostAudio) window.SignalLostAudio.playTypingTick();
        updateExploreCta();
      });
    });
    $("btnToDial").addEventListener("click", function () {
      $("phase-explore").classList.add("night-hidden");
      $("phase-dial").classList.remove("night-hidden");
    });
  }

  function renderDial() {
    $("dialDisplay").textContent = dialBuf || " ";
  }

  function dialDigit(d) {
    dialBuf += d;
    renderDial();
    if (window.SignalLostAudio) window.SignalLostAudio.playTypingTick();
  }

  function wrongNumberResponse() {
    var r = Math.floor(Math.random() * 3);
    if (r === 0) {
      showLore("Busy tone. Three short pulses in your ear, then nothing.");
      if (window.SignalLostAudio) {
        for (var i = 0; i < 3; i++) {
          setTimeout(function () {
            window.SignalLostAudio.playTone(480, 0.12, 0.12);
          }, i * 200);
        }
      }
    } else if (r === 1) {
      showLore("Silence. Not empty—full, like someone left the line open and walked away.");
    } else {
      showLore("Voicemail clicks on: a voice you almost recognise says only, “Later.” Then beep.");
      if (window.SignalLostAudio) window.SignalLostAudio.playTone(300, 0.2, 0.08);
    }
  }

  function initDial() {
    var keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
    var grid = $("dialGrid");
    keys.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dial-btn";
      b.textContent = k;
      b.addEventListener("click", function () {
        dialDigit(k);
      });
      grid.appendChild(b);
    });
    $("dialBack").addEventListener("click", function () {
      dialBuf = dialBuf.slice(0, -1);
      renderDial();
    });
    $("dialCall").addEventListener("click", function () {
      if (window.SignalLostState && window.SignalLostState.isCorrectNoteNumber(dialBuf)) {
        $("phase-dial").classList.add("night-hidden");
        $("phase-phone").classList.remove("night-hidden");
        startNight1Chat();
      } else {
        wrongNumberResponse();
      }
    });
    renderDial();
  }

  function startNight1Chat() {
    var log = $("chatLog");
    var choices = $("chatChoices");
    var script = [
      { type: "unknown", text: "I've been waiting for you to call." },
      { type: "unknown", text: "You left something behind. Not an object—a sentence you never finished." },
      {
        type: "choices",
        options: [
          { label: "I'm listening.", trust: 1 },
          { label: "Stop talking in riddles.", trust: -1 },
          { label: "…", trust: 0 },
        ],
      },
      {
        type: "unknown",
        text: "Good. The coat by the door is still warm. You remember the weight, even if you won't name it yet.",
      },
      {
        type: "choices",
        options: [
          { label: "How do you know that?", trust: -1 },
          { label: "I remember the weight.", trust: 1 },
          { label: "Say something useful.", trust: 0 },
        ],
      },
    ];
    if (visited.coat) {
      script.push({
        type: "unknown",
        text: "You already touched the coat — I’m not guessing your room. I’m reading what you carried out of it.",
      });
    }
    script.push(
      {
        type: "choices",
        options: [
          { label: "Why does the clock say 2:47?", trust: 0 },
          { label: "The window shows no reflection.", trust: 0 },
          { label: "Send what you have.", trust: 0 },
        ],
      },
      {
        type: "unknown",
        text: "2:47 holds because you're still in the breath before you admitted what the moment is. It won't tick while you keep rehearsing instead of speaking.",
      },
      {
        type: "unknown",
        text: "Glass without a reflection is honesty with nowhere to bounce — only the room behind you, softer than it should be.",
      },
      { type: "unknown", text: "I'm sending you a picture. Not what it is—what it felt like when you were last somewhere else." }
    );

    if (window.SignalLostAudio) window.SignalLostAudio.setNight(1);
    window.SignalLostChat.runScript(script, {
      logEl: log,
      choicesEl: choices,
      getDelayMul: function () {
        return 1.14;
      },
      onComplete: function () {
        $("signalPanel").classList.remove("night-hidden");
        startSignalDecode();
      },
    });
  }

  function startSignalDecode() {
    var canvas = $("signalCanvas");
    var slider = $("signalSlider");
    var pct = $("signalPct");
    decodeCtl = window.SignalLostSignalPuzzle.initDecode({
      canvas: canvas,
      slider: slider,
      labelEl: pct,
      imageUrl: IMG_LAST_LOCATION,
      fallbackSrc: IMG_LAST_LOCATION_FALLBACK,
      onComplete: function () {
        if (window.SignalLostState) {
          window.SignalLostState.tryAwardClue("signal1");
        }
        $("btnNight2").style.display = "block";
      },
    });
    decodeCtl.redraw();
    $("btnNight2").addEventListener("click", function () {
      if (rainCtl && typeof rainCtl.fadeOut === "function") {
        rainCtl.fadeOut(1100);
      } else if (window.SignalLostAudio) {
        window.SignalLostAudio.fadeRainOut(1100);
      }
      setTimeout(function () {
        window.location.href = "night2.html";
      }, 650);
    });
  }

  function boot() {
    if (window.SignalLostAudio) {
      window.SignalLostAudio.setNight(1);
      rainCtl = window.SignalLostAudio.startRainLoop();
    }
    var digits = window.SignalLostState ? window.SignalLostState.NOTE_PHONE_DIGITS : "0427318247";
    var formatted =
      digits.length === 10 ? digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") : digits;
    $("noteHint").textContent = formatted;
    initExplore();
    initDial();
  }

  boot();
})();
