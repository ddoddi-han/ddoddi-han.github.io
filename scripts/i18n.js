const translations = window.resumeTranslations;
const languageSwitcher = document.querySelector(".language-switcher");
const languageTrigger = document.querySelector(".language-trigger");

const translatableElements = document.querySelectorAll("[data-i18n]");
const translatableImages = document.querySelectorAll("[data-i18n-image]");
const originalContent = new Map();
translatableElements.forEach((element) => {
  const key = element.dataset.i18n;
  if (!originalContent.has(key)) originalContent.set(key, element.innerHTML);
});

const translatableAttributes = document.querySelectorAll(
  "[data-i18n-attr]",
);
const originalAttributes = new Map();
translatableAttributes.forEach((element) => {
  element.dataset.i18nAttr.split(",").forEach((mapping) => {
    const [attribute, key] = mapping.split(":");
    originalAttributes.set(`${element.tagName}:${attribute}:${key}`, {
      element,
      attribute,
      key,
      value: element.getAttribute(attribute),
    });
  });
});

function applyLanguage(language) {
  const activeTranslations = translations[language] || translations.ko;

  translatableElements.forEach((element) => {
    const key = element.dataset.i18n;
    element.innerHTML =
      activeTranslations[key] ?? originalContent.get(key);
  });

  translatableAttributes.forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((mapping) => {
      const [attribute, key] = mapping.split(":");
      const original = [...originalAttributes.values()].find(
        (item) =>
          item.element === element &&
          item.attribute === attribute &&
          item.key === key,
      );
      element.setAttribute(
        attribute,
        activeTranslations[key] ?? original.value,
      );
    });
  });

  translatableImages.forEach((image) => {
    const key = `${image.dataset.i18nImage}Src`;
    if (activeTranslations[key]) image.src = activeTranslations[key];
  });

  document.documentElement.lang = language;
  const meta = activeTranslations.meta;
  document.title = meta.title;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", meta.description);
  document
    .querySelector('meta[property="og:title"]')
    .setAttribute("content", meta.ogTitle);
  document
    .querySelector('meta[property="og:description"]')
    .setAttribute("content", meta.ogDescription);

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.language === language),
    );
  });

  try {
    localStorage.setItem("resume-language", language);
  } catch (error) {
    // Storage may be unavailable in private browsing; the switch still works.
  }

  languageSwitcher?.removeAttribute("data-open");
  languageTrigger?.setAttribute("aria-expanded", "false");
}

languageTrigger?.addEventListener("click", () => {
  const expanded = languageTrigger.getAttribute("aria-expanded") === "true";
  languageTrigger.setAttribute("aria-expanded", String(!expanded));
  languageSwitcher?.toggleAttribute("data-open", !expanded);
});

languageSwitcher?.addEventListener("focusout", (event) => {
  if (!languageSwitcher.contains(event.relatedTarget)) {
    languageSwitcher.removeAttribute("data-open");
    languageTrigger?.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
});

let savedLanguage = "ko";
try {
  const storedLanguage = localStorage.getItem("resume-language");
  savedLanguage = ["ko", "ja", "en"].includes(storedLanguage)
    ? storedLanguage
    : "ko";
} catch (error) {
  // Use Korean as the default when Storage is unavailable.
}
applyLanguage(savedLanguage);
