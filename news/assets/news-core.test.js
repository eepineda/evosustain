const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "news-core.js"), "utf8");

function createHarness(savedLanguage = null) {
  const listeners = {};
  const windowListeners = {};
  const attributes = [];
  const controls = [
    { getAttribute: (name) => name === "data-language" ? "es" : null, setAttribute: (...args) => attributes.push(args) },
    { getAttribute: (name) => name === "data-language" ? "en" : null, setAttribute: (...args) => attributes.push(args) }
  ];
  const document = {
    readyState: "complete",
    documentElement: { lang: "es", dataset: {} },
    querySelectorAll: (selector) => selector.includes("data-news-language") || selector.includes("data-language") ? controls : [],
    addEventListener: (name, callback) => { listeners[name] = callback; }
  };
  const store = new Map();
  if (savedLanguage) store.set("evoford-news-language", savedLanguage);
  const window = {
    localStorage: {
      getItem: (key) => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => store.set(key, value)
    },
    dispatchEvent: (event) => { (windowListeners[event.type] || []).forEach((fn) => fn(event)); },
    addEventListener: (name, callback) => { (windowListeners[name] ||= []).push(callback); },
    removeEventListener: (name, callback) => { windowListeners[name] = (windowListeners[name] || []).filter((fn) => fn !== callback); }
  };
  const context = { window, document, CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } } };
  vm.runInNewContext(source, context, { filename: "news-core.js" });
  return { window, document, listeners, store, attributes };
}

test("defaults to Spanish and exposes supported languages", () => {
  const { window, document } = createHarness();
  assert.equal(window.EvofordNews.language, "es");
  assert.deepEqual(Array.from(window.EvofordNews.supportedLanguages), ["es", "en"]);
  assert.equal(document.documentElement.lang, "es");
});

test("restores the saved English language", () => {
  const { window, document } = createHarness("en");
  assert.equal(window.EvofordNews.language, "en");
  assert.equal(document.documentElement.lang, "en");
});

test("switches language, persists it and updates accessible controls", () => {
  const { window, document, store, attributes } = createHarness();
  let changedTo = null;
  window.EvofordNews.onLanguageChange((language) => { changedTo = language; });
  window.EvofordNews.setLanguage("en");
  assert.equal(window.EvofordNews.language, "en");
  assert.equal(store.get("evoford-news-language"), "en");
  assert.equal(document.documentElement.lang, "en");
  assert.equal(changedTo, "en");
  assert.ok(attributes.some(([name, value]) => name === "aria-pressed" && value === "true"));
});

test("ignores unsupported language values", () => {
  const { window } = createHarness();
  window.EvofordNews.setLanguage("fr");
  assert.equal(window.EvofordNews.language, "es");
});
