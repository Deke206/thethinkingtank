(() => {
  "use strict";

  if (!document.getElementById("bikeBuilderForm")) return;

  const currentScript = document.currentScript;
  const baseUrl = currentScript?.src
    ? new URL("./", currentScript.src)
    : new URL("js/", window.location.href);

  const files = [
    "bike-builder-bodies.js?v=20260723-liveview-v2",
    "bike-builder-renderer.js?v=20260723-liveview-v2",
    "bike-builder-liveview.js?v=20260723-liveview-v2"
  ];

  const loadNext = (index) => {
    if (index >= files.length) return;
    const script = document.createElement("script");
    script.src = new URL(files[index], baseUrl).href;
    script.defer = true;
    script.dataset.bikeBuilderModule = files[index].split("?")[0];
    script.addEventListener("load", () => loadNext(index + 1), { once: true });
    script.addEventListener("error", () => console.error(`Unable to load ${files[index]}`), { once: true });
    document.body.appendChild(script);
  };

  loadNext(0);
})();
