/**
 * SIGNAL LOST — Week 9 (≈50%): Night 2
 * Includes: apps exploration + memory sortable + chat + one free-text reply + hidden thread (clue 3).
 * Excludes (Week 11): Night 3, endings.
 */
(function () {
  "use strict";

  if (!window.SignalLostState || !window.SignalLostState.canEnterNight2 || !window.SignalLostState.canEnterNight2()) {
    window.location.replace("night1.html");
    return;
  }

  var openedApps = {};
  var freeDone = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function setPhase(which) {
    byId("phase-apps").classList.toggle("night-hidden", which !== "apps");
    byId("phase-memory").classList.toggle("night-hidden", which !== "memory");
    byId("phase-chat").classList.toggle("night-hidden", which !== "chat");
  }

  function renderApp(name) {
    byId("appLayer").classList.remove("night-hidden");
    byId("appTitle").textContent = name.toUpperCase();
    var body = byId("appBody");
    body.innerHTML = "";

    if (name === "photos") {
      body.innerHTML =
        "<p>March 3rd — camera roll corrupted.</p>" +
        "<p><img src='assets/images/Bedroom blur.png' style='max-width:100%;border-radius:8px;opacity:0.45' alt=''/></p>" +
        "<p>Tap the blur. Nothing resolves completely.</p>";
      var im = body.querySelector("img");
      if (im) {
        im.addEventListener("click", function () {
          this.style.opacity = "0.9";
        });
        im.onerror = function () {
          this.style.display = "none";
        };
      }
      return;
    }

    if (name === "notes") {
      var alreadyFound =
        window.SignalLostState &&
        window.SignalLostState.getDoneHidden &&
        window.SignalLostState.getDoneHidden();

      body.innerHTML =
        "<p>To-do (never done):</p>" +
        "<ul><li>return call</li><li>water plants</li><li>say it plainly</li></ul>" +
        "<p>\u201cI don\u2019t want to disappear mid-sentence.\u201d</p>" +
        "<hr style='border:none;border-top:1px solid rgba(255,255,255,0.08);margin:14px 0'/>" +
        "<div id='hiddenThreadBtn' style='cursor:pointer;color:" +
          (alreadyFound ? "#6c63ff" : "#9898b0") +
          ";font-size:0.72rem;padding:6px 0;user-select:none'>" +
          (alreadyFound ? "\u25be" : "\u25b8") +
          " Drafts \u2014 3 unsent" +
          (!alreadyFound ? " <span style='color:#6c63ff;font-size:0.65rem'>[tap]</span>" : "") +
        "</div>" +
        "<div id='hiddenThread' style='display:" + (alreadyFound ? "block" : "none") + ";margin-top:10px'>" +
          "<div style='text-align:right;margin-bottom:10px'>" +
            "<span style='font-size:0.6rem;color:#9898b0;display:block;margin-bottom:3px'>Mar 2 \u2014 11:47 PM</span>" +
            "<span style='display:inline-block;background:rgba(108,99,255,0.25);border:1px solid rgba(108,99,255,0.35);border-radius:12px 12px 2px 12px;padding:7px 11px;font-size:0.75rem;max-width:85%'>" +
              "I should have said something at the entrance. You were right there." +
            "</span>" +
            "<span style='display:block;font-size:0.6rem;color:#e05555;margin-top:3px'>Not delivered</span>" +
          "</div>" +
          "<div style='text-align:right;margin-bottom:10px'>" +
            "<span style='font-size:0.6rem;color:#9898b0;display:block;margin-bottom:3px'>Mar 2 \u2014 11:52 PM</span>" +
            "<span style='display:inline-block;background:rgba(108,99,255,0.25);border:1px solid rgba(108,99,255,0.35);border-radius:12px 12px 2px 12px;padding:7px 11px;font-size:0.75rem;max-width:85%'>" +
              "I kept the number. Deleted it three times. Kept it anyway." +
            "</span>" +
            "<span style='display:block;font-size:0.6rem;color:#e05555;margin-top:3px'>Not delivered</span>" +
          "</div>" +
          "<div style='text-align:right;margin-bottom:14px'>" +
            "<span style='font-size:0.6rem;color:#9898b0;display:block;margin-bottom:3px'>Mar 3 \u2014 12:03 AM</span>" +
            "<span style='display:inline-block;background:rgba(108,99,255,0.25);border:1px solid rgba(108,99,255,0.35);border-radius:12px 12px 2px 12px;padding:7px 11px;font-size:0.75rem;max-width:85%'>" +
              "I don\u2019t think you\u2019ll check this. I think that\u2019s why I\u2019m sending it." +
            "</span>" +
            "<span style='display:block;font-size:0.6rem;color:#e05555;margin-top:3px'>Not delivered</span>" +
          "</div>" +
          "<div id='hiddenClueNotice' style='display:" + (alreadyFound ? "block" : "none") +
            ";text-align:center;font-size:0.65rem;color:#6c63ff;padding:6px 0'>clue 3 found</div>" +
        "</div>";

      var btn = body.querySelector("#hiddenThreadBtn");
      var thread = body.querySelector("#hiddenThread");
      var notice = body.querySelector("#hiddenClueNotice");

      if (btn && thread && !alreadyFound) {
        btn.addEventListener("click", function () {
          thread.style.display = "block";
          btn.innerHTML = "\u25be Drafts \u2014 3 unsent";
          btn.style.color = "#6c63ff";
          if (window.SignalLostState) {
            var awarded = window.SignalLostState.tryAwardClue("hidden");
            if (awarded && notice) {
              notice.style.display = "block";
              if (window.SignalLostAudio) window.SignalLostAudio.playNotification();
            }
          }
        });
      }
      return;
    }

    if (name === "browser") {
      var alreadyFoundBrowser =
        window.SignalLostState &&
        window.SignalLostState.getDoneHidden &&
        window.SignalLostState.getDoneHidden();

      body.innerHTML =
        "<p>Search history — last day:</p>" +
        "<ul>" +
          "<li>how late does the library close</li>" +
          "<li>park bench near east entrance</li>" +
          "<li>can you hear a phone ring through a door</li>" +
        "</ul>" +
        "<hr style='border:none;border-top:1px solid rgba(255,255,255,0.08);margin:14px 0'/>" +
        "<div id='draftSyncBtn' style='cursor:pointer;color:" +
          (alreadyFoundBrowser ? "#6c63ff" : "#9898b0") +
          ";font-size:0.72rem;padding:6px 0;user-select:none'>" +
          (alreadyFoundBrowser ? "▾" : "▸") +
          " Draft sync — 3 pending" +
          (!alreadyFoundBrowser ? " <span style='color:#6c63ff;font-size:0.65rem'>[sync]</span>" : "") +
        "</div>" +
        "<div id='draftSyncThread' style='display:" + (alreadyFoundBrowser ? "block" : "none") + ";margin-top:10px'>" +
          "<div style='text-align:right;margin-bottom:10px'>" +
            "<span style='font-size:0.6rem;color:#9898b0;display:block;margin-bottom:3px'>Mar 2 — 11:47 PM</span>" +
            "<span style='display:inline-block;background:rgba(108,99,255,0.25);border:1px solid rgba(108,99,255,0.35);border-radius:12px 12px 2px 12px;padding:7px 11px;font-size:0.75rem;max-width:85%'>" +
              "I should have said something at the entrance. You were right there." +
            "</span>" +
            "<span style='display:block;font-size:0.6rem;color:#e05555;margin-top:3px'>Send failed</span>" +
          "</div>" +
          "<div style='text-align:right;margin-bottom:10px'>" +
            "<span style='font-size:0.6rem;color:#9898b0;display:block;margin-bottom:3px'>Mar 2 — 11:52 PM</span>" +
            "<span style='display:inline-block;background:rgba(108,99,255,0.25);border:1px solid rgba(108,99,255,0.35);border-radius:12px 12px 2px 12px;padding:7px 11px;font-size:0.75rem;max-width:85%'>" +
              "I kept the number. Deleted it three times. Kept it anyway." +
            "</span>" +
            "<span style='display:block;font-size:0.6rem;color:#e05555;margin-top:3px'>Send failed</span>" +
          "</div>" +
          "<div style='text-align:right;margin-bottom:14px'>" +
            "<span style='font-size:0.6rem;color:#9898b0;display:block;margin-bottom:3px'>Mar 3 — 12:03 AM</span>" +
            "<span style='display:inline-block;background:rgba(108,99,255,0.25);border:1px solid rgba(108,99,255,0.35);border-radius:12px 12px 2px 12px;padding:7px 11px;font-size:0.75rem;max-width:85%'>" +
              "I don’t think you’ll check this. I think that’s why I’m sending it." +
            "</span>" +
            "<span style='display:block;font-size:0.6rem;color:#e05555;margin-top:3px'>Send failed</span>" +
          "</div>" +
          "<div id='draftSyncNotice' style='display:" + (alreadyFoundBrowser ? "block" : "none") +
            ";text-align:center;font-size:0.65rem;color:#6c63ff;padding:6px 0'>clue 3 found</div>" +
        "</div>";

      var syncBtn = body.querySelector("#draftSyncBtn");
      var syncThread = body.querySelector("#draftSyncThread");
      var syncNotice = body.querySelector("#draftSyncNotice");

      if (syncBtn && syncThread && !alreadyFoundBrowser) {
        syncBtn.addEventListener("click", function () {
          syncThread.style.display = "block";
          syncBtn.innerHTML = "▾ Draft sync — 3 pending";
          syncBtn.style.color = "#6c63ff";
          if (window.SignalLostState) {
            var awarded = window.SignalLostState.tryAwardClue("hidden");
            if (awarded && syncNotice) {
              syncNotice.style.display = "block";
              if (window.SignalLostAudio) window.SignalLostAudio.playNotification();
            }
          }
        });
      }
      return;
    }

    if (name === "voicemail") {
      if (window.SignalLostState && window.SignalLostState.canUnlockVoicemail && window.SignalLostState.canUnlockVoicemail()) {
        body.innerHTML =
          "<p>One unheard message.</p><p style='color:#9898b0'>Audio is reserved for later milestones.</p>";
      } else {
        body.innerHTML = "<p>Voicemail is locked.</p><p style='color:#9898b0'>Trust the line a little more.</p>";
      }
    }
  }

  function initApps() {
    document.querySelectorAll(".app-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-app");
        openedApps[name] = true;
        renderApp(name);
        if (window.SignalLostAudio) window.SignalLostAudio.playNotification();
      });
    });

    byId("appClose").addEventListener("click", function () {
      byId("appLayer").classList.add("night-hidden");
      if (Object.keys(openedApps).length >= 4) {
        byId("btnToMemory").disabled = false;
      }
    });

    byId("btnToMemory").disabled = true;
    byId("btnToMemory").addEventListener("click", function () {
      setPhase("memory");
      initMemory();
    });
  }

  function memoryCardArtUrl(memoryId) {
    return "assets/images/" + encodeURIComponent("Card " + (memoryId + 1) + ".png");
  }

  function initMemory() {
    var cards = [
      { id: 0, t: "10:30 PM", b: "Arrive at library" },
      { id: 1, t: "11:15 PM", b: "Locked room" },
      { id: 2, t: "11:43 PM", b: "A figure" },
      { id: 3, t: "12:01 AM", b: "You leave" },
    ];
    var order = [0, 1, 2, 3].sort(function () {
      return Math.random() - 0.5;
    });

    var list = byId("memoryList");
    try {
      var $l = window.jQuery(list);
      if ($l.data("ui-sortable")) $l.sortable("destroy");
    } catch (e) {}
    list.innerHTML = "";

    order.forEach(function (id) {
      var c = cards[id];
      var li = document.createElement("li");
      li.className = "memory-card";
      li.setAttribute("data-id", String(c.id));

      var wrap = document.createElement("div");
      wrap.className = "memory-card__inner";

      var img = document.createElement("img");
      img.className = "memory-card__img";
      img.src = memoryCardArtUrl(c.id);
      img.alt = "";
      img.onerror = function () {
        this.style.visibility = "hidden";
      };

      var meta = document.createElement("div");
      meta.className = "memory-card__meta";
      var strong = document.createElement("strong");
      strong.textContent = c.t;
      meta.appendChild(strong);
      meta.appendChild(document.createTextNode(c.b));

      wrap.appendChild(img);
      wrap.appendChild(meta);
      li.appendChild(wrap);
      list.appendChild(li);
    });

    window.jQuery("#memoryList").sortable({ axis: "y", containment: "parent", tolerance: "pointer" });
    window.jQuery("#btnVerifyMemory")
      .off("click")
      .on("click", function () {
        var ok = true;
        window.jQuery("#memoryList li").each(function (i) {
          if (window.jQuery(this).attr("data-id") !== String(i)) ok = false;
        });
        if (!ok) {
          window.alert("Not quite. The night has an order.");
          return;
        }
        if (window.SignalLostState) window.SignalLostState.tryAwardClue("memory");
        byId("memoryRest").textContent = "rest.";
        window.jQuery("#btnVerifyMemory").prop("disabled", true);
        setTimeout(function () {
          setPhase("chat");
          startChatFlow();
        }, 900);
      });
  }

  function startChatFlow() {
    if (window.SignalLostAudio) window.SignalLostAudio.setNight(2);
    var part1 = [
      {
        type: "unknown",
        text: "You went looking for proof in the wrong places. The receipts are human — timestamps, drafts, the quiet places you pretend not to check.",
      },
      {
        type: "choices",
        options: [
          { label: "I’m still here.", trust: 2 },
          { label: "Prove it.", trust: -2 },
          { label: "Say it without theatre.", trust: 0 },
        ],
      },
      {
        type: "unknown",
        text: "The library closed. You stayed anyway. That’s not curiosity — it’s hunger.",
      },
      { type: "unknown", text: "Type what you would have sent if your hands weren’t shaking." },
    ];

    window.SignalLostChat.runScript(part1, {
      logEl: byId("chatLog2"),
      choicesEl: byId("chatChoices2"),
      getDelayMul: function () {
        return 1.12;
      },
      onComplete: function () {
        byId("freeInput").focus();
      },
    });
  }

  function initFreeInput() {
    byId("freeInput").addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" || freeDone) return;
      var raw = byId("freeInput").value || "";
      if (!raw.trim()) return;
      freeDone = true;

      if (window.SignalLostState) window.SignalLostState.addPhrase(raw);
      window.SignalLostChat.appendBubble(byId("chatLog2"), "player", raw);
      byId("freeInput").value = "";
      byId("freeInput").disabled = true;

      var low = raw.toLowerCase();
      var reply = "Words land where they always did. You still flinch at the softest version of the truth.";
      if (low.indexOf("sorry") !== -1) {
        reply = "Apology without audience is still apology. The body keeps it anyway.";
      } else if (low.indexOf("love") !== -1) {
        reply = "Love without a receiver still changes the shape of a sentence.";
      } else if (low.indexOf("afraid") !== -1 || low.indexOf("scared") !== -1) {
        reply = "Fear is honest. That honesty moves the line.";
      }

      setTimeout(function () {
        window.SignalLostChat.appendBubble(byId("chatLog2"), "unknown", reply);
        runWeek9End();
      }, 650);
    });
  }

  function runWeek9End() {
    window.SignalLostChat.runScript(
      [
        { type: "wait", ms: 450 },
        {
          type: "unknown",
          text: "That’s enough for now. The rest is still loading — not from the network. From you.",
        },
        { type: "wait", ms: 500 },
        {
          type: "unknown",
          text: "Week 9 checkpoint complete.",
        },
      ],
      {
        logEl: byId("chatLog2"),
        choicesEl: byId("chatChoices2"),
        getDelayMul: function () {
          return 1.12;
        },
        onComplete: function () {
          var ban = byId("appsBanner");
          ban.classList.remove("night-hidden");
          ban.textContent = "Week 9 (≈50%) ends here. Replay from Prologue or Night 1 for the demo.";
          setPhase("apps");
          byId("btnToMemory").textContent = "Replay Night 1";
          byId("btnToMemory").disabled = false;
          byId("btnToMemory").onclick = function () {
            window.location.href = "night1.html";
          };
        },
      }
    );
  }

  function boot() {
    if (window.SignalLostAudio) window.SignalLostAudio.setNight(2);
    initApps();
    initFreeInput();
  }

  boot();
})();

