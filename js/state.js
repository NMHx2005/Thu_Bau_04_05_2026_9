/**
 * SIGNAL LOST — Week 9 (≈50%) state
 * Keeps Night 1 + Night 2 (apps + memory + chat + free text).
 * Exposes window.SignalLostState for vanilla HTML pages.
 */
(function () {
  "use strict";

  var STORAGE_TRUST = "signalLost_trust";
  var STORAGE_CLUES = "signalLost_clues";
  var STORAGE_DONE_SIGNAL1 = "signalLost_doneSignal1";
  var STORAGE_DONE_MEMORY = "signalLost_doneMemoryDrag";
  var STORAGE_PHRASES = "signalLost_phrases";

  var TRUST_MIN = 0;
  var TRUST_MAX = 10;
  var CLUES_MIN = 0;
  var CLUES_MAX = 4;

  /** Dial this (digits only for comparison) — matches note copy in Night 1. */
  var NOTE_PHONE_DIGITS = "0427318247";

  /** Voicemail app unlocks when trust reaches this (Week 9: copy-only). */
  var VOICEMAIL_TRUST_THRESHOLD = 5;

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function readInt(key, defaultVal, min, max) {
    var raw = localStorage.getItem(key);
    if (raw === null || raw === "") return defaultVal;
    var n = parseInt(raw, 10);
    if (isNaN(n)) return defaultVal;
    return clamp(n, min, max);
  }

  function readBool(key) {
    return localStorage.getItem(key) === "1";
  }

  function setBool(key, value) {
    localStorage.setItem(key, value ? "1" : "0");
  }

  function getTrust() {
    return readInt(STORAGE_TRUST, TRUST_MIN, TRUST_MIN, TRUST_MAX);
  }

  function setTrust(value) {
    var n = typeof value === "number" ? value : parseInt(value, 10);
    if (isNaN(n)) n = TRUST_MIN;
    n = clamp(n, TRUST_MIN, TRUST_MAX);
    localStorage.setItem(STORAGE_TRUST, String(n));
    return n;
  }

  function addTrust(delta) {
    var d = typeof delta === "number" ? delta : parseInt(delta, 10);
    if (isNaN(d)) d = 0;
    return setTrust(getTrust() + d);
  }

  function getClues() {
    return readInt(STORAGE_CLUES, CLUES_MIN, CLUES_MIN, CLUES_MAX);
  }

  function addClue() {
    var next = clamp(getClues() + 1, CLUES_MIN, CLUES_MAX);
    localStorage.setItem(STORAGE_CLUES, String(next));
    return next;
  }

  function getDoneSignal1() {
    return readBool(STORAGE_DONE_SIGNAL1);
  }

  function setDoneSignal1(v) {
    setBool(STORAGE_DONE_SIGNAL1, v);
  }

  function getDoneMemoryDrag() {
    return readBool(STORAGE_DONE_MEMORY);
  }

  function setDoneMemoryDrag(v) {
    setBool(STORAGE_DONE_MEMORY, v);
  }

  /**
   * Award +1 clue once per milestone kind. Returns true if a clue was added.
   * Week 9 (≈50%): 'signal1' | 'memory'
   */
  function tryAwardClue(kind) {
    if (kind === "signal1") {
      if (getDoneSignal1()) return false;
      setDoneSignal1(true);
      addClue();
      return true;
    }
    if (kind === "memory") {
      if (getDoneMemoryDrag()) return false;
      setDoneMemoryDrag(true);
      addClue();
      return true;
    }
    return false;
  }

  function getPhrases() {
    var raw = localStorage.getItem(STORAGE_PHRASES);
    if (!raw) return [];
    try {
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function addPhrase(text) {
    var t = (text || "").trim();
    if (!t) return getPhrases();
    var list = getPhrases();
    var lower = t.toLowerCase();
    if (list.indexOf(lower) === -1) list.push(lower);
    localStorage.setItem(STORAGE_PHRASES, JSON.stringify(list));
    return list;
  }

  function normalizeDialInput(str) {
    return (str || "").replace(/\D/g, "");
  }

  function isCorrectNoteNumber(dialString) {
    return normalizeDialInput(dialString) === NOTE_PHONE_DIGITS;
  }

  function canUnlockVoicemail() {
    return getTrust() >= VOICEMAIL_TRUST_THRESHOLD;
  }

  function canEnterNight2() {
    return getDoneSignal1();
  }

  function resetGame() {
    localStorage.removeItem(STORAGE_TRUST);
    localStorage.removeItem(STORAGE_CLUES);
    localStorage.removeItem(STORAGE_DONE_SIGNAL1);
    localStorage.removeItem(STORAGE_DONE_MEMORY);
    localStorage.removeItem(STORAGE_PHRASES);
  }

  window.SignalLostState = {
    getTrust: getTrust,
    setTrust: setTrust,
    addTrust: addTrust,
    getClues: getClues,
    addClue: addClue,
    resetGame: resetGame,
    tryAwardClue: tryAwardClue,
    getDoneSignal1: getDoneSignal1,
    getDoneMemoryDrag: getDoneMemoryDrag,
    getPhrases: getPhrases,
    addPhrase: addPhrase,
    normalizeDialInput: normalizeDialInput,
    isCorrectNoteNumber: isCorrectNoteNumber,
    NOTE_PHONE_DIGITS: NOTE_PHONE_DIGITS,
    VOICEMAIL_TRUST_THRESHOLD: VOICEMAIL_TRUST_THRESHOLD,
    canUnlockVoicemail: canUnlockVoicemail,
    canEnterNight2: canEnterNight2,
  };
})();
