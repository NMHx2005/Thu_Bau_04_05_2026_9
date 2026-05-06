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
    laptop: {
      title: "The Unsent Draft",
      text: "A half-written unsent message — cursor still blinking. The player has been trying to say something and could not finish it.",
      img: "assets/images/obj_laptop.png",
    },
    window: {
      title: "No Reflection",
      text: "Rain on the glass, but no reflection. A planted clue — most players read it as an art style choice on first playthrough and only catch it on replay.",
      img: "assets/images/obj_window.png",
    },
    note: {
      title: "The Number",
      text: "A handwritten phone number, slightly smudged. 0427 318 247. This is the number the player will dial.",
      img: "assets/images/obj_note.png",
    },
    photo: {
      title: "The Photograph",
      text: "A blurred image of a person. Warm frame. The face is almost recognisable — but not quite.",
      img: "assets/images/obj_photo.png",
    },
    coat: {
      title: "Still Warm",
      text: "Still warm by the door. If you read this before you call, Unknown will remember.",
      img: "assets/images/obj_coat.png",
    },
  };

  function $(id) {
    return document.getElementById(id);
  }

  /* ── Text-only overlay (for wrong-number responses) ─────────────── */
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

  /* ── Lightbox zoom from hotspot position ─────────────────────────── */
  function showLightbox(id, hotspotEl) {
    var lore = LORE[id];
    if (!lore) return;

    var lb = $("objLightbox");
    var inner = $("objLightbox__inner");
    var imgEl = $("objLightbox__img");
    var titleEl = $("objLightbox__title");
    var textEl = $("objLightbox__text");

    imgEl.src = lore.img;
    titleEl.textContent = lore.title;
    textEl.textContent = lore.text;

    /* compute initial transform: scale from hotspot centre to viewport centre */
    var rect = hotspotEl.getBoundingClientRect();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var originX = rect.left + rect.width / 2 - vw / 2;
    var originY = rect.top + rect.height / 2 - vh / 2;
    var scaleStart = Math.min(rect.width / 320, rect.height / 220, 0.35);

    inner.style.transition = "none";
    inner.style.transform =
      "translate(" + originX + "px," + originY + "px) scale(" + scaleStart + ")";
    inner.style.opacity = "0";

    lb.classList.remove("night-hidden");

    /* force reflow then animate to final position */
    lb.offsetWidth;
    inner.style.transition =
      "transform 0.38s cubic-bezier(0.22,0.61,0.36,1), opacity 0.32s ease";
    inner.style.transform = "translate(0,0) scale(1)";
    inner.style.opacity = "1";

    lb.classList.add("lb-open");
  }

  function closeLightbox() {
    var lb = $("objLightbox");
    var inner = $("objLightbox__inner");

    inner.style.transition = "transform 0.25s ease, opacity 0.22s ease";
    inner.style.transform = "scale(0.88)";
    inner.style.opacity = "0";
    lb.classList.remove("lb-open");

    setTimeout(function () {
      lb.classList.add("night-hidden");
    }, 260);
  }

  /* ── Wakeup sequence: blink → room → objects fade in ─────────────── */
  function runWakeupSequence() {
    var BLINK_MS = 2800;
    var STAGGER_MS = 400;
    var order = ["window", "photo", "laptop", "coat", "note"];

    setTimeout(function () {
      order.forEach(function (id, i) {
        setTimeout(function () {
          var btn = document.querySelector(".hotspot--" + id);
          if (!btn) return;
          var img = btn.querySelector(".hotspot-obj");
          if (img) img.classList.add("visible");
        }, i * STAGGER_MS);
      });
    }, BLINK_MS);
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
        showLightbox(id, btn);
        if (window.SignalLostAudio) window.SignalLostAudio.playTypingTick();
        updateExploreCta();
      });
    });

    /* lightbox close: overlay click or × button */
    var lb = $("objLightbox");
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    $("objLightbox__close").addEventListener("click", function (e) {
      e.stopPropagation();
      closeLightbox();
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
      var top = document.getElementById("eyeLidTop");
      var bot = document.getElementById("eyeLidBottom");

      /* 1. Cancel wake-up animation, snap to open position */
      top.style.animation = "none";
      bot.style.animation = "none";
      top.style.transform = "translateY(-100%)";
      bot.style.transform = "translateY(100%)";

      /* 2. Force reflow then animate eyelids closed */
      top.offsetWidth;
      top.style.transition = "transform 0.55s cubic-bezier(0.4,0,1,1)";
      bot.style.transition = "transform 0.55s cubic-bezier(0.4,0,1,1)";
      top.style.transform = "translateY(0)";
      bot.style.transform = "translateY(0)";

      /* 3. After eyes are fully closed, show interstitial text */
      setTimeout(function () {
        var el = document.createElement("div");
        el.id = "transitionText";
        el.innerHTML = "<p>Night One ends.</p><p>The signal holds.</p>";
        document.body.appendChild(el);

        /* 4. Fade rain, then navigate — eyes will open in night2.html */
        setTimeout(function () {
          if (rainCtl && typeof rainCtl.fadeOut === "function") {
            rainCtl.fadeOut(400);
          } else if (window.SignalLostAudio) {
            window.SignalLostAudio.fadeRainOut(400);
          }
          setTimeout(function () {
            window.location.href = "night2.html";
          }, 400);
        }, 1500);
      }, 560);
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
    runWakeupSequence();
  }

  boot();
})();
