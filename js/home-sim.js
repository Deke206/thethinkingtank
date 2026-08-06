(() => {
  "use strict";

  if (window.ShynetymeHomeSimLoader?.initialized) {
    return;
  }

  // BEGIN OBJECT: Production Home SIM source package.
  const SOURCE_PARTS = Object.freeze([
    "js/home-sim-source/home-sim-part-00.txt",
    "js/home-sim-source/home-sim-part-01.txt",
    "js/home-sim-source/home-sim-part-02.txt",
    "js/home-sim-source/home-sim-part-03.txt",
    "js/home-sim-source/home-sim-part-04.txt",
    "js/home-sim-source/home-sim-part-05.txt"
  ]);

  const SOURCE_REVISION = "20260806-home-loader-v5";
  const GEOMETRY_PATH = "data/home-sim-approved-geometry.json";

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/home-sim.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);
  // END OBJECT: Production Home SIM source package.

  // BEGIN OBJECT: Locked geometry naming compatibility.
  // The approved data currently names the second scene `back`, while the
  // production controller uses the internal scene key `rear`. Coordinates and
  // geometry are unchanged; only the scene-key alias is normalized in memory.
  function installGeometryCompatibility() {
    if (window.ShynetymeHomeGeometryCompatibility?.initialized) {
      return;
    }

    const nativeFetch = window.fetch.bind(window);

    window.fetch = async function shynetymeHomeGeometryFetch(input, init) {
      const response = await nativeFetch(input, init);
      const inputUrl = input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.href
          : String(input);
      const requestUrl = new URL(inputUrl, window.location.href);

      if (!requestUrl.pathname.endsWith(`/${GEOMETRY_PATH}`) || !response.ok) {
        return response;
      }

      const payload = await response.clone().json();
      const collection = payload.scenes || payload.views;

      if (collection?.back && !collection.rear) {
        collection.rear = collection.back;
        delete collection.back;
      }

      const headers = new Headers(response.headers);
      headers.set("Content-Type", "application/json; charset=utf-8");

      return new Response(JSON.stringify(payload), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    };

    window.ShynetymeHomeGeometryCompatibility = Object.freeze({
      initialized: true,
      geometryPath: GEOMETRY_PATH
    });
  }
  // END OBJECT: Locked geometry naming compatibility.

  // BEGIN API CALL: Load and execute the formatted Home SIM controller.
  async function loadHomeSimController() {
    installGeometryCompatibility();

    const sourceParts = await Promise.all(
      SOURCE_PARTS.map(async (path) => {
        const url = new URL(path, siteRoot);
        url.searchParams.set("v", SOURCE_REVISION);

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

    // Execute as an inline script rather than a blob URL. The formatted
    // controller resolves assets from document.currentScript; a blob URL is
    // non-hierarchical and cannot be used as a relative URL base.
    const controllerScript = document.createElement("script");
    controllerScript.textContent = sourceParts.join("\n");
    controllerScript.dataset.shynetymeHomeSimController = "true";
    document.head.appendChild(controllerScript);
  }
  // END API CALL: Load and execute the formatted Home SIM controller.

  // BEGIN OBJECT: Public Home SIM loader API.
  window.ShynetymeHomeSimLoader = {
    initialized: true,
    revision: SOURCE_REVISION,
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