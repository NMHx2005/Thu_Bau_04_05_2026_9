/**
 * SIGNAL LOST — Night 3: soften UI, heartbeat, timed chat, reveal, word puzzle, routing.
 */
(function () {
  "use strict";

  if (!window.SignalLostState || !window.SignalLostState.canEnterNight3 || !window.SignalLostState.canEnterNight3()) {
    window.location.replace("night2.html");
    return;
  }

  var hbCtl = null;
  var softenStep = 0;
  var timerId = null;
  var timeLeft = 20;
  var built = [];

  function byId(id) {
    return document.getElementById(id);
  }

  function refitPhone() {
    if (window.SignalLostFrame && window.SignalLostFrame.fitPhone) {
      window.SignalLostFrame.fitPhone();
    }
  }

  function showOnly(sec) {
    ["secHeartbeat", "secTimed", "secReveal", "secWords"].forEach(function (id) {
      byId(id).classList.toggle("night-hidden", id !== sec);
    });
    refitPhone();
  }

  function startSoftenLoop() {
    var screen = byId("phoneScreen3");
    var sym = window.SignalLostState ? window.SignalLostState.NIGHT3_CONTACT_SYMBOL : "▣";
    setInterval(function () {
      softenStep++;
      if (softenStep === 4) byId("contactName").textContent = sym;
      if (softenStep >= 6) screen.classList.add("phone-screen--soften");
    }, 4500);
  }

  function startHeartbeat() {
    if (window.SignalLostAudio) window.SignalLostAudio.setNight(3);
    hbCtl = window.SignalLostSignalPuzzle.initHeartbeat({
      canvas: byId("hbCanvas"),
      locksNeeded: 3,
      onComplete: function () {
        if (hbCtl) hbCtl.destroy();
        hbCtl = null;
        if (window.SignalLostState) window.SignalLostState.tryAwardClue("signal3");
        showOnly("secTimed");
        startTimedChat();
      },
    });
  }

  function startTimedChat() {
    timeLeft = 20;
    byId("timerVal").textContent = String(timeLeft);
    var log = byId("chatLog3");
    var choices = byId("chatChoices3");
    log.innerHTML = "";
    choices.innerHTML = "";
    var settled = false;

    function finishTimed() {
      if (settled) return;
      settled = true;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      window.SignalLostChat.clearChoices(choices);
      setTimeout(beginReveal, 500);
    }

    function tick() {
      if (settled) return;
      timeLeft -= 1;
      byId("timerVal").textContent = String(Math.max(0, timeLeft));
      if (timeLeft <= 0) {
        window.SignalLostChat.appendBubble(log, "player", "…");
        finishTimed();
      }
    }
    timerId = setInterval(tick, 1000);

    window.SignalLostChat.runScript(
      [
        {
          type: "unknown",
          text: "The interface softens at the edges. Listen: not a stranger, a part of you that already agreed.",
        },
        {
          type: "unknown",
          text: "The timer isn’t a threat. It’s the width of the honesty you’ll permit before you flinch back into habit.",
        },
        {
          type: "choices",
          options: [
            { label: "I hear you.", trust: 2 },
            { label: "I don’t believe you.", trust: -2 },
            { label: "…", trust: 0 },
          ],
        },
      ],
      {
        logEl: log,
        choicesEl: choices,
        getDelayMul: function () {
          return 1.22;
        },
        onComplete: function () {
          finishTimed();
        },
      }
    );
  }

  function beginReveal() {
    showOnly("secReveal");
    var log = byId("chatLogReveal");
    log.innerHTML = "";
    var steps = [
      {
        type: "unknown",
        text: "You're not trying to remember who you are. You're trying to remember what you wanted to say before you couldn't.",
      },
      {
        type: "unknown",
        text: "The voice you flinch from isn’t a stranger on the line. It’s the part of you that learned to speak gently so no one would leave.",
      },
      {
        type: "unknown",
        text: "If you want a clean ending, you’ll have to stop asking the interface to forgive you first.",
      },
    ];
    window.SignalLostChat.runScript(steps, {
      logEl: log,
      choicesEl: byId("chatChoicesReveal"),
      getDelayMul: function () {
        return 1.65;
      },
      onComplete: function () {
        setTimeout(startWords, 800);
      },
    });
  }

  function startWords() {
    showOnly("secWords");
    var bank = byId("wordBank");
    bank.innerHTML = "";
    built = [];
    var tokens = ["I", "needed", "to", "say", "that", "it", "was", "love", "sorry", "home", "wait", "enough"];
    tokens.forEach(function (w) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "word-token";
      b.textContent = w;
      b.addEventListener("click", function () {
        built.push(w);
        byId("wordBuilt").textContent = built.join(" ") + " …";
        if (window.SignalLostAudio) window.SignalLostAudio.playTypingTick();
      });
      bank.appendChild(b);
    });
    byId("wordBuilt").textContent = "…";
    byId("btnWordsDone").onclick = function () {
      var line = built.join(" ").trim() || "(silence)";
      if (window.SignalLostState) window.SignalLostState.setFinalWords(line);
      byId("finLine").textContent = line;
      byId("finOverlay").classList.remove("night-hidden");
    };
    byId("btnRouteEnding").onclick = function () {
      var T = window.SignalLostState.getTrust();
      var C = window.SignalLostState.getClues();
      var outcome = "notyet";
      if (T >= 7 && C >= 3) outcome = "found";
      else if (T >= 4 || C >= 2) outcome = "static";
      window.location.href = "ending-shell.html?outcome=" + outcome;
    };
  }

  function boot() {
    if (window.SignalLostAudio) {
      window.SignalLostAudio.setNight(3);
      window.SignalLostAudio.fadeRainOut(2200);
    }
    startSoftenLoop();
    startHeartbeat();
    refitPhone();
    setTimeout(refitPhone, 150);
  }

  boot();
})();
