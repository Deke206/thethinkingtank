# contact.html — Page Object Cheat Sheet v1.0

**Source file:** `contact.html`  
**Purpose:** Stable object names and additive semantic selectors for page editing.

## Object map

- `body.contact-page` — **Contact Page** (classes `.contact-page`) → normalized `.page .page--contact`
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
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link index.html#effects]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link led-catalog.html]
- `a.nav-link.active` — **Nav Link** (classes `.nav-link .active`) [TRIGGER: link contact.html]
- `header.site-banner` — **Page hero / banner** (classes `.site-banner`) → normalized `.page-hero`
- `#siteBannerCarousel` — **ShyneTyme Works project scenes** (ID `#siteBannerCarousel`; classes `.carousel .slide`)
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
- `#main-content` — **Main page content** (ID `#main-content`; classes `.py-5 .contact-main`) → normalized `.page-main`
- `section.container` — **Container section** (classes `.container`) → normalized `.page-section .page-section--container .layout-container`
- `form.contact-panel.contact-form` — **Page form** (classes `.contact-panel .contact-form`) → normalized `.form-object .component-object` [TRIGGER: form submit]
- `#contactName` — **ContactName** (ID `#contactName`; classes `.form-control`) → normalized `.form-control-object`
- `#contactEmail` — **ContactEmail** (ID `#contactEmail`; classes `.form-control`) → normalized `.form-control-object`
- `#contactPhone` — **ContactPhone** (ID `#contactPhone`; classes `.form-control`) → normalized `.form-control-object`
- `#contactProject` — **ContactProject** (ID `#contactProject`; classes `.form-select`) → normalized `.form-control-object`
- `#contactMessage` — **ContactMessage** (ID `#contactMessage`; classes `.form-control`) → normalized `.form-control-object`
- `div.col-12.d-flex.flex-wrap.gap-3.align-items-center` — **Col 12** (classes `.col-12 .d-flex .flex-wrap .gap-3 .align-items-center`) → normalized `.layout-column .zone .zone--center`
- `button.btn.btn-neon-cyan` — **Button 57 trigger** (classes `.btn .btn-neon-cyan`) → normalized `.action-trigger` [TRIGGER: button]
- `a.btn.btn-neon-pink` — **Btn** (classes `.btn .btn-neon-pink`) [TRIGGER: link build-my-bike.html]
- `section.social-launchpad.mt-4` — **Social Launchpad section** (classes `.social-launchpad .mt-4`) → normalized `.page-section .page-section--social-launchpad`
- `#socialTitle` — **SocialTitle** (ID `#socialTitle`)
- `div.social-launchpad__grid` — **Social Launchpad Grid** (classes `.social-launchpad__grid`) → normalized `.layout-row`
- `footer.py-4.border-top` — **Site footer** (classes `.py-4 .border-top`) → normalized `.site-footer .zone .zone--top`
- `div.container.small.d-flex.flex-wrap.justify-content-between.gap-2` — **Container** (classes `.container .small .d-flex .flex-wrap .justify-content-between .gap-2`) → normalized `.layout-container`

## Naming rule

Use normalized selectors for future shared CSS/JavaScript; retain existing selectors wherever current functionality depends on them.
