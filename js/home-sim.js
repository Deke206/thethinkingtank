(() => {
  "use strict";

  if (window.ShynetymeHomeSimLoader?.initialized) {
    return;
  }

  // BEGIN OBJECT: Production Home SIM source package.
  // The formatted controller remains plain readable JavaScript split into
  // numbered source files so no page contains one compressed run-on string.
  const SOURCE_PARTS = Object.freeze([
    "js/home-sim-source/home-sim-part-01.txt",
    "js/home-sim-source/home-sim-part-02.txt",
    "js/home-sim-source/home-sim-part-03.txt",
    "js/home-sim-source/home-sim-part-04.txt"
  ]);

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/home-sim.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);
  // END OBJECT: Production Home SIM source package.

  // BEGIN API CALL: Load and execute the formatted Home SIM controller.
  async function loadHomeSimController() {
    const sourceParts = await Promise.all(
      SOURCE_PARTS.map(async (path) => {
        const url = new URL(path, siteRoot);
        url.searchParams.set("v", "20260805-production-home-v1");

        const response = await fetch(url, {
          cache: "no-store",
          credentials: "same-origin"
        });

        if (!response.ok) {
          throw new Error(`Home SIM source request failed: ${path}`);
        }

        return response.text();
      })
    );

    const sourceBlob = new Blob(sourceParts, {
      type: "text/javascript"
    });
    const sourceUrl = URL.createObjectURL(sourceBlob);
    const controllerScript = document.createElement("script");

    controllerScript.src = sourceUrl;
    controllerScript.dataset.shynetymeHomeSimController = "true";

    controllerScript.addEventListener("load", () => {
      URL.revokeObjectURL(sourceUrl);
    }, { once: true });

    controllerScript.addEventListener("error", () => {
      URL.revokeObjectURL(sourceUrl);
      console.error("Home SIM controller failed to execute.");

      const status = document.getElementById("homeRenderStatus");

      if (status) {
        status.textContent = "Home SIM controller failed to execute";
      }
    }, { once: true });

    document.head.appendChild(controllerScript);
  }
  // END API CALL: Load and execute the formatted Home SIM controller.

  // BEGIN OBJECT: Public Home SIM loader API.
  window.ShynetymeHomeSimLoader = {
    initialized: true,
    sourceParts: SOURCE_PARTS,
    load: loadHomeSimController
  };
  // END OBJECT: Public Home SIM loader API.

  loadHomeSimController().catch((error) => {
    console.error(error);

    const status = document.getElementById("homeRenderStatus");

    if (status) {
      status.textContent = "Home SIM controller failed to load";
    }
  });
})();
