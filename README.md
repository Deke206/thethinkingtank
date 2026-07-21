# ShyneTyme Works — Mobile LED Effects

A Bootstrap 5 website and product catalog for ShyneTyme Works: custom 5V WS2812B mobile LED projects in Los Angeles, including bicycles, e-bikes, helmets, vans, motorcycles, automobiles, boats, patios, and custom installations.

## Website goals

- Show working bicycle and helmet LED effects.
- Explain phone-controlled ESP32/WLED lighting.
- Present simple installation packages.
- Maintain a focused catalog of compatible 5V WS2812B parts.
- Collect installation requests through the interactive bicycle builder.

## Repository structure

```text
index.html
catalog.html
build-my-bike.html
css/site.css
css/bike-builder.css
js/catalog.js
js/bike-builder.js
js/hero-carousel.js
js/site-guide.js
data/products.json
COPYRIGHT.md
THIRD_PARTY_NOTICES.md
PRIVACY.md
TERMS.md
```

## Catalog

`catalog.html` loads the retained product list from `data/products.json` through `js/catalog.js`. The catalog remains independent from any scraper and can later be connected to Shopify product data or purchase links.

## Publishing

The site is designed for GitHub Pages. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then save.

## Rights

Original site content and media are all rights reserved unless a file or section states otherwise. Third-party libraries and product materials retain their respective licenses and ownership.
