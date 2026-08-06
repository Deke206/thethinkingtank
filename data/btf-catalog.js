(() => {
  "use strict";
  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src; script.defer = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error(`Image data request failed: ${src}`)), { once: true });
    document.head.appendChild(script);
  });
  window.SHYNETYME_BTF_READY = fetch("data/btf-catalog-meta.json", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Catalog metadata request failed");
      const meta = await response.json();
      const [chunks] = await Promise.all([
        Promise.all(meta.itemFiles.map(async (file) => {
          const result = await fetch(file, { cache: "no-store" });
          if (!result.ok) throw new Error(`Catalog item request failed: ${file}`);
          return result.json();
        })),
        Promise.all(meta.imageFiles.map(loadScript))
      ]);
      const sourceNames = { A: "Addressable Pixel Strip Quotation List", F: "FCOB LED Strip Price List", S: "Previously selected ShyneTyme catalog" };
      const images = window.SHYNETYME_BTF_IMAGES || {};
      const products = chunks.flat().map((p) => ({
        id:p[0], source:sourceNames[p[1]], sourcePage:p[2], sourceItem:p[3], category:p[4], name:p[5],
        description:p[7] || meta.specifications[p[6]] || "", model:p[8], productDetails:p[9], control:p[10],
        colors:p[11], voltages:p[12], waterproof:p[13], densities:p[14], widths:p[15], length:p[16],
        image:images[p[17]] || "", imageAlt:p[18], sourceItems:p[19], tags:p[20] || [],
        searchText:[p[0],p[4],p[5],p[7],meta.specifications[p[6]],p[8],p[9],p[10],p[11],p[12],p[13],p[14],p[15],p[16],p[19],...(p[20]||[])].join(" ")
      }));
      return { ...meta, products };
    });
})();
