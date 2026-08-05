# led-catalog.html — Page Object Cheat Sheet v1.0

**Source file:** `led-catalog.html`  
**Purpose:** Stable object names and additive semantic selectors for page editing.

## Object map

- `body.catalog-page` — **Catalog Page** (classes `.catalog-page`) → normalized `.page .page--led-catalog`
- `a.skip-link` — **Skip Link** (classes `.skip-link`) [TRIGGER: link #main-content]
- `nav.navbar.navbar-expand-lg.navbar-dark.bg-dark.sticky-top` — **Primary navigation** (classes `.navbar .navbar-expand-lg .navbar-dark .bg-dark .sticky-top`) → normalized `.site-nav .zone .zone--top`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `a.navbar-brand.fw-bold.brand-lockup` — **Navbar Brand** (classes `.navbar-brand .fw-bold .brand-lockup`) [TRIGGER: link index.html]
- `img` — **Img 6** (no existing ID/class) → normalized `.media-object`
- `button.navbar-toggler` — **Toggle navigation** (classes `.navbar-toggler`) → normalized `.action-trigger` [TRIGGER: button; Bootstrap collapse; target #navMenu; controls #navMenu]
- `span.navbar-toggler-icon` — **Navbar Toggler Icon** (classes `.navbar-toggler-icon`)
- `#navMenu` — **NavMenu** (ID `#navMenu`; classes `.collapse .navbar-collapse`)
- `div.navbar-nav.ms-auto` — **Navbar Nav** (classes `.navbar-nav .ms-auto`)
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link build-my-bike.html]
- `a.nav-link.active` — **Nav Link** (classes `.nav-link .active`) [TRIGGER: link led-catalog.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link aboutme.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link contact.html]
- `header.site-banner` — **Page hero / banner** (classes `.site-banner`) → normalized `.page-hero`
- `#siteBannerCarousel` — **ShyneTyme.Works project scenes** (ID `#siteBannerCarousel`; classes `.carousel .slide`)
- `div.carousel-indicators` — **Carousel Indicators** (classes `.carousel-indicators`)
- `button.active` — **Slide 1** (classes `.active`) → normalized `.action-trigger` [TRIGGER: button; target #siteBannerCarousel]
- `button` — **Slide 2** (no existing ID/class) → normalized `.action-trigger` [TRIGGER: button; target #siteBannerCarousel]
- `button` — **Slide 3** (no existing ID/class) → normalized `.action-trigger` [TRIGGER: button; target #siteBannerCarousel]
- `button` — **Slide 4** (no existing ID/class) → normalized `.action-trigger` [TRIGGER: button; target #siteBannerCarousel]
- `div.carousel-inner` — **Carousel Inner** (classes `.carousel-inner`)
- `div.carousel-item.active` — **Carousel Item** (classes `.carousel-item .active`)
- `img.d-block.w-100.site-banner-image` — **D Block** (classes `.d-block .w-100 .site-banner-image`) → normalized `.media-object`
- `div.carousel-caption.site-banner-caption` — **Carousel Caption** (classes `.carousel-caption .site-banner-caption`)
- `span.site-banner-callout.site-banner-callout--cyan` — **Site Banner Callout** (classes `.site-banner-callout .site-banner-callout--cyan`)
- `div.carousel-item` — **Carousel Item** (classes `.carousel-item`)
- `img.d-block.w-100.site-banner-image` — **D Block** (classes `.d-block .w-100 .site-banner-image`) → normalized `.media-object`
- `div.carousel-caption.site-banner-caption` — **Carousel Caption** (classes `.carousel-caption .site-banner-caption`)
- `span.site-banner-callout.site-banner-callout--pink` — **Site Banner Callout** (classes `.site-banner-callout .site-banner-callout--pink`)
- `div.carousel-item` — **Carousel Item** (classes `.carousel-item`)
- `img.d-block.w-100.site-banner-image` — **D Block** (classes `.d-block .w-100 .site-banner-image`) → normalized `.media-object`
- `div.carousel-caption.site-banner-caption` — **Carousel Caption** (classes `.carousel-caption .site-banner-caption`)
- `span.site-banner-callout.site-banner-callout--amber` — **Site Banner Callout** (classes `.site-banner-callout .site-banner-callout--amber`)
- `div.carousel-item` — **Carousel Item** (classes `.carousel-item`)
- `img.d-block.w-100.site-banner-image` — **D Block** (classes `.d-block .w-100 .site-banner-image`) → normalized `.media-object`
- `div.carousel-caption.site-banner-caption` — **Carousel Caption** (classes `.carousel-caption .site-banner-caption`)
- `span.site-banner-callout.site-banner-callout--violet` — **Site Banner Callout** (classes `.site-banner-callout .site-banner-callout--violet`)
- `button.carousel-control-prev` — **Carousel Control Prev trigger** (classes `.carousel-control-prev`) → normalized `.action-trigger` [TRIGGER: button; target #siteBannerCarousel]
- `span.carousel-control-prev-icon` — **Carousel Control Prev Icon** (classes `.carousel-control-prev-icon`)
- `button.carousel-control-next` — **Carousel Control Next trigger** (classes `.carousel-control-next`) → normalized `.action-trigger` [TRIGGER: button; target #siteBannerCarousel]
- `span.carousel-control-next-icon` — **Carousel Control Next Icon** (classes `.carousel-control-next-icon`)
- `#page-subheader` — **Breadcrumb** (ID `#page-subheader`) → normalized `.page-breadcrumb`
- `#page-subheader-row` — **Page Subheader Row** (ID `#page-subheader-row`)
- `#page-subheader-text` — **Page Subheader Text** (ID `#page-subheader-text`)
- `li.page-subheader-item` — **Page Subheader Item** (classes `.page-subheader-item`)
- `li.page-subheader-item` — **Page Subheader Item** (classes `.page-subheader-item`)
- `#main-content` — **Main page content** (ID `#main-content`) → normalized `.page-main`
- `#catalog` — **Catalog section** (ID `#catalog`; classes `.catalog-section .py-5`) → normalized `.page-section .page-section--catalog`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `div.catalog-toolbar` — **Catalog Toolbar** (classes `.catalog-toolbar`)
- `#catalogSearch` — **CatalogSearch** (ID `#catalogSearch`; classes `.form-control`) → normalized `.form-control-object`
- `#categoryFilter` — **Filter parts by category** (ID `#categoryFilter`; classes `.form-select .catalog-filter`) → normalized `.form-control-object`
- `#catalogCount` — **CatalogCount** (ID `#catalogCount`; classes `.catalog-count`)
- `#catalogGrid` — **CatalogGrid** (ID `#catalogGrid`; classes `.row .g-4 .mt-3`) → normalized `.layout-row`
- `#productModal` — **ProductModal** (ID `#productModal`; classes `.modal .fade .catalog-modal`) → normalized `.component-object`
- `div.modal-dialog.modal-xl.modal-dialog-centered.modal-dialog-scrollable` — **Modal Dialog** (classes `.modal-dialog .modal-xl .modal-dialog-centered .modal-dialog-scrollable`) → normalized `.zone .zone--center .component-object`
- `div.modal-content` — **Modal Content** (classes `.modal-content`) → normalized `.component-object`
- `div.modal-header` — **Modal Header** (classes `.modal-header`) → normalized `.component-object`
- `#productModalCategory` — **ProductModalCategory** (ID `#productModalCategory`; classes `.section-kicker .mb-0`) → normalized `.component-object`
- `button.btn-close.btn-close-white` — **Close** (classes `.btn-close .btn-close-white`) → normalized `.action-trigger` [TRIGGER: button]
- `div.modal-body` — **Modal Body** (classes `.modal-body`) → normalized `.component-object`
- `div.catalog-modal-image-wrap` — **Catalog Modal Image Wrap** (classes `.catalog-modal-image-wrap`) → normalized `.component-object`
- `#productModalImage` — **ProductModalImage** (ID `#productModalImage`; classes `.catalog-modal-image`) → normalized `.media-object .component-object`
- `#productModalDescription` — **ProductModalDescription** (ID `#productModalDescription`; classes `.h4 .mb-4`) → normalized `.component-object`
- `#productModalSpecs` — **ProductModalSpecs** (ID `#productModalSpecs`; classes `.catalog-spec-list`) → normalized `.component-object`
- `#productModalIncluded` — **ProductModalIncluded** (ID `#productModalIncluded`; classes `.catalog-included .d-none`) → normalized `.component-object`
- `div.modal-footer.catalog-modal-footer` — **Modal Footer** (classes `.modal-footer .catalog-modal-footer`) → normalized `.component-object`
- `#modalAddMaterial` — **ModalAddMaterial trigger** (ID `#modalAddMaterial`; classes `.btn .btn-neon-cyan .catalog-modal-add`) → normalized `.action-trigger .component-object` [TRIGGER: button]
- `label.catalog-modal-field` — **Catalog Modal Field** (classes `.catalog-modal-field`) → normalized `.component-object`
- `#modalQuantity` — **ModalQuantity** (ID `#modalQuantity`; classes `.form-control .form-control-sm`) → normalized `.form-control-object .component-object`
- `label.catalog-modal-field` — **Catalog Modal Field** (classes `.catalog-modal-field`) → normalized `.component-object`
- `#modalArea` — **ModalArea** (ID `#modalArea`; classes `.form-control .form-control-sm`) → normalized `.form-control-object .component-object`
- `#modalMaterialStatus` — **ModalMaterialStatus** (ID `#modalMaterialStatus`; classes `.catalog-modal-status`) → normalized `.component-object`
- `button.btn.btn-outline-light.catalog-modal-close` — **Catalog Modal Close trigger** (classes `.btn .btn-outline-light .catalog-modal-close`) → normalized `.action-trigger .component-object` [TRIGGER: button]
- `footer.py-4.border-top` — **Site footer** (classes `.py-4 .border-top`) → normalized `.site-footer .zone .zone--top`
- `div.container.small.d-flex.flex-wrap.justify-content-between.gap-2` — **Container** (classes `.container .small .d-flex .flex-wrap .justify-content-between .gap-2`) → normalized `.layout-container`

## Naming rule

Use normalized selectors for future shared CSS/JavaScript; retain existing selectors wherever current functionality depends on them.
