/**
 * SIGNAL LOST — Canvas: Night 1 decode (noise over image) + Night 3 heartbeat trace.
 */
(function () {
  "use strict";

  function sizeCanvasToDisplay(canvas) {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.floor(rect.width));
    var h = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return canvas.getContext("2d");
  }

  /**
   * Decode puzzle: slider 0–100 controls noise opacity; image drawn beneath.
   */
  function initDecode(opts) {
    var canvas = opts.canvas;
    var slider = opts.slider;
    var labelEl = opts.labelEl;
    var img = new Image();
    var completed = false;
    var noiseCanvas = document.createElement("canvas");
    var noiseReady = false;

    function buildNoise(w, h) {
      noiseCanvas.width = w;
      noiseCanvas.height = h;
      var nctx = noiseCanvas.getContext("2d");
      var id = nctx.createImageData(w, h);
      var d = id.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      nctx.putImageData(id, 0, 0);
      noiseReady = true;
    }

    function draw() {
      var ctx = sizeCanvasToDisplay(canvas);
      var w = canvas.width;
      var h = canvas.height;
      if (!noiseReady) {
        buildNoise(w, h);
      }
      ctx.clearRect(0, 0, w, h);
      if (img.complete && img.naturalWidth) {
        var scale = Math.max(w / img.width, h / img.height);
        var dw = img.width * scale;
        var dh = img.height * scale;
        var dx = (w - dw) / 2;
        var dy = (h - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
      }
      var clarity = (parseInt(slider.value, 10) || 0) / 100;
      var noiseAlpha = 1 - clarity;
      if (noiseAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = noiseAlpha;
        ctx.drawImage(noiseCanvas, 0, 0, w, h);
        ctx.restore();
      }
      if (labelEl) {
        labelEl.textContent = Math.round(clarity * 100) + "%";
      }
      if (clarity >= 1 && !completed) {
        completed = true;
        if (opts.onComplete) opts.onComplete();
      }
    }

    img.onload = function () {
      draw();
    };
    var decodeImgFallbackTried = false;
    img.onerror = function () {
      var fb = opts.fallbackSrc || "assets/images/Bedroom.png";
      if (!decodeImgFallbackTried && fb && fb !== opts.imageUrl) {
        decodeImgFallbackTried = true;
        img.src = fb;
        return;
      }
      img.onerror = null;
    };
    img.src = opts.imageUrl;

    slider.addEventListener("input", draw);
    window.addEventListener("resize", draw);

    return {
      redraw: draw,
      destroy: function () {
        slider.removeEventListener("input", draw);
        window.removeEventListener("resize", draw);
      },
    };
  }

  /**
   * Heartbeat trace: click near sine peaks while wave slows.
   */
  function initHeartbeat(opts) {
    var canvas = opts.canvas;
    var raf = null;
    var phase = 0;
    var speed = opts.initialSpeed || 0.09;
    var speedMin = opts.speedMin || 0.028;
    var locks = 0;
    var locksNeeded = opts.locksNeeded || 3;
    var done = false;
    var lastBeat = 0;

    function drawFrame() {
      var ctx = sizeCanvasToDisplay(canvas);
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(108,99,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      var mid = h * 0.5;
      var amp = h * 0.18;
      for (var x = 0; x <= w; x += 2) {
        var y = mid + Math.sin((x + phase) * 0.04) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(232,232,240,0.55)";
      ctx.font = "12px Courier New, monospace";
      ctx.fillText("click the peaks — " + locks + "/" + locksNeeded, 12, 22);
      phase += speed * 10;
      speed = Math.max(speedMin, speed * 0.9997);
      var now = performance.now();
      if (now - lastBeat > 520) {
        lastBeat = now;
        if (window.SignalLostAudio) {
          window.SignalLostAudio.playHeartbeatRate(48 + speed * 120);
        }
      }
    }

    function loop() {
      if (!done) {
        drawFrame();
        raf = requestAnimationFrame(loop);
      }
    }

    function onClick(ev) {
      if (done) return;
      var rect = canvas.getBoundingClientRect();
      var mx = ev.clientX - rect.left;
      var my = ev.clientY - rect.top;
      var w = canvas.width;
      var h = canvas.height;
      var scaleX = w / rect.width;
      var scaleY = h / rect.height;
      var x = mx * scaleX;
      var y = my * scaleY;
      var mid = h * 0.5;
      var amp = h * 0.18;
      var yWave = mid + Math.sin((x + phase) * 0.04) * amp;
      if (Math.abs(y - yWave) < 22 * scaleY && y < mid) {
        locks++;
        if (window.SignalLostAudio) window.SignalLostAudio.playNotification();
        if (locks >= locksNeeded) {
          done = true;
          cancelAnimationFrame(raf);
          if (opts.onComplete) opts.onComplete();
        }
      }
    }

    canvas.addEventListener("click", onClick);
    loop();

    return {
      destroy: function () {
        done = true;
        cancelAnimationFrame(raf);
        canvas.removeEventListener("click", onClick);
      },
    };
  }

  window.SignalLostSignalPuzzle = {
    initDecode: initDecode,
    initHeartbeat: initHeartbeat,
  };
})();
