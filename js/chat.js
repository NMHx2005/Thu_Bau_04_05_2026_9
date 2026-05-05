/**
 * SIGNAL LOST — reusable chat runner (queue + typing + choices + trust).
 */
(function () {
  "use strict";

  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function createTypingRow() {
    var row = el("div", "chat-row chat-row--unknown msg-enter");
    var wrap = el("div", "typing-indicator");
    wrap.setAttribute("aria-label", "Typing");
    for (var i = 0; i < 3; i++) {
      wrap.appendChild(el("span", "typing-dot"));
    }
    row.appendChild(wrap);
    return row;
  }

  function appendBubble(logEl, from, text) {
    var row = el("div", "chat-row chat-row--" + (from === "player" ? "player" : "unknown") + " msg-enter");
    var bubble = el("p", "bubble " + (from === "player" ? "bubble-player" : "bubble-unknown"), text);
    row.appendChild(bubble);
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function clearChoices(choicesEl) {
    choicesEl.innerHTML = "";
  }

  function showChoices(choicesEl, options, logEl, onPick) {
    clearChoices(choicesEl);
    var done = false;
    options.forEach(function (opt) {
      var btn = el("button", "chat-choice");
      btn.type = "button";
      var g = el("span", "chat-choice__glyph", "▶");
      btn.appendChild(g);
      btn.appendChild(document.createTextNode(" " + opt.label));
      btn.addEventListener("click", function () {
        if (done) return;
        done = true;
        if (typeof opt.trust === "number" && window.SignalLostState) {
          window.SignalLostState.addTrust(opt.trust);
        }
        if (logEl && opt.playerEcho !== false) {
          var echo = typeof opt.playerEcho === "string" ? opt.playerEcho : opt.label;
          if (echo) {
            if (window.SignalLostAudio) window.SignalLostAudio.playNotification();
            appendBubble(logEl, "player", echo);
          }
        }
        clearChoices(choicesEl);
        if (opt.onSelect) opt.onSelect();
        onPick(opt);
      });
      choicesEl.appendChild(btn);
    });
  }

  /**
   * Run scripted chat. steps: array of
   *  { type:'unknown'|'player', text:string }
   *  { type:'typing', ms?:number }
   *  { type:'choices', options:[{label, trust?}] }
   * opts: { logEl, choicesEl, getDelayMul?: () => number, onStep?: fn }
   */
  function runScript(steps, opts) {
    var logEl = opts.logEl;
    var choicesEl = opts.choicesEl;
    var getDelayMul = opts.getDelayMul || function () {
      return 1;
    };
    var i = 0;

    function next() {
      if (i >= steps.length) {
        if (opts.onComplete) opts.onComplete();
        return;
      }
      var step = steps[i++];
      var mul = getDelayMul();
      if (opts.onStep) opts.onStep(step);

      if (step.type === "unknown") {
        var typing = createTypingRow();
        logEl.appendChild(typing);
        logEl.scrollTop = logEl.scrollHeight;
        var typingMs = (700 + Math.random() * 500) * mul;
        var tick = setInterval(function () {
          if (window.SignalLostAudio) window.SignalLostAudio.playTypingTick();
        }, 180);
        delay(typingMs).then(function () {
          clearInterval(tick);
          typing.remove();
          if (window.SignalLostAudio) window.SignalLostAudio.playNotification();
          appendBubble(logEl, "unknown", step.text);
          delay(350 * mul).then(next);
        });
      } else if (step.type === "player") {
        if (window.SignalLostAudio) window.SignalLostAudio.playNotification();
        appendBubble(logEl, "player", step.text);
        delay(400 * mul).then(next);
      } else if (step.type === "choices") {
        showChoices(choicesEl, step.options, logEl, function () {
          delay(380).then(next);
        });
      } else if (step.type === "wait") {
        delay((step.ms || 500) * mul).then(next);
      } else {
        next();
      }
    }

    next();
  }

  window.SignalLostChat = {
    runScript: runScript,
    appendBubble: appendBubble,
    clearChoices: clearChoices,
  };
})();
