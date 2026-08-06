(() => {
  "use strict";
  window.SHYNETYME_BTF_READY = fetch("data/btf-catalog-items.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Catalog data request failed");
      return response.json();
    });
})();
