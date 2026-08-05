(() => {
  "use strict";
  const files = [
    "data/btf-family-1.json",
    "data/btf-family-2.json",
    "data/btf-family-3.json"
  ];
  window.SHYNETYME_BTF_READY = Promise.all(
    files.map(async (file) => {
      const response = await fetch(file, { cache: "no-store" });
      if (!response.ok) throw new Error(`Catalog data request failed: ${file}`);
      return response.json();
    })
  ).then((groups) => {
    const products = groups.flat().map((p) => ({
      id: p[0],
      category: p[1],
      name: p[2],
      description: p[3],
      control: p[4],
      colors: p[5],
      voltages: p[6],
      waterproof: p[7],
      densities: p[8],
      widths: p[9],
      applications: p[10],
      sourceItems: p[13],
      variants: Array.from({ length: p[12] - p[11] + 1 }, (_, index) => {
        const item = p[11] + index;
        return {
          item,
          length: "See project specification",
          voltage: p[6],
          density: p[8],
          waterproof: p[7],
          width: p[9],
          detail: `Manufacturer item ${item}; exact option details confirmed in the project quote.`
        };
      })
    }));
    return {
      catalogVersion: "2026-08-05",
      source: {
        manufacturer: "BTF-LIGHTING",
        received: "2026-08-03",
        publicPricing: "Project quote only"
      },
      totalFamilies: 42,
      totalVariants: 197,
      categories: [
        { id: "all", label: "All Products" },
        { id: "FCOB White & CCT", label: "FCOB White & CCT" },
        { id: "FCOB Color", label: "FCOB Color" },
        { id: "FCOB Addressable", label: "FCOB Addressable" },
        { id: "Pixel RGB", label: "Pixel RGB" },
        { id: "Pixel RGBW & RGBCCT", label: "Pixel RGBW & RGBCCT" },
        { id: "Narrow & Specialty", label: "Narrow & Specialty" },
        { id: "Outdoor & Redundant Signal", label: "Outdoor & Redundant Signal" }
      ],
      products
    };
  });
})();
