(() => {
  "use strict";

  if (window.ShynetymeChuck?.mounted) return;

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src
    ? new URL(scriptElement.src, window.location.href)
    : new URL("js/about-deke-chuck.js", window.location.href);
  const sharedUrl = new URL("site-chuck.js?v=20260724-shared-chuck-v3", scriptUrl).href;

  const existing = document.querySelector("script[data-shynetyme-site-chuck]");
  if (existing) return;

  const script = document.createElement("script");
  script.src = sharedUrl;
  script.defer = true;
  script.dataset.shynetymeSiteChuck = "true";
  document.body.appendChild(script);
})();
