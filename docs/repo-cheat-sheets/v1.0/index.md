# index.html — Page Object Cheat Sheet v1.0

**Source file:** `index.html`  
**Purpose:** Stable object names and additive semantic selectors for page editing.

## Object map

- `body.home-page` — **Home Page** (classes `.home-page`) → normalized `.page .page--index`
- `nav.navbar.navbar-expand-lg.navbar-dark.bg-dark.sticky-top` — **Primary navigation** (classes `.navbar .navbar-expand-lg .navbar-dark .bg-dark .sticky-top`) → normalized `.site-nav .zone .zone--top`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `a.navbar-brand.fw-bold.brand-lockup` — **Navbar Brand** (classes `.navbar-brand .fw-bold .brand-lockup`) [TRIGGER: link #top]
- `img` — **Img 5** (no existing ID/class) → normalized `.media-object`
- `button.navbar-toggler` — **Toggle navigation** (classes `.navbar-toggler`) → normalized `.action-trigger` [TRIGGER: button; Bootstrap collapse; target #navMenu; controls #navMenu]
- `span.navbar-toggler-icon` — **Navbar Toggler Icon** (classes `.navbar-toggler-icon`)
- `#navMenu` — **NavMenu** (ID `#navMenu`; classes `.collapse .navbar-collapse`)
- `div.navbar-nav.ms-auto` — **Navbar Nav** (classes `.navbar-nav .ms-auto`)
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link build-my-bike.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link #effects]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link led-catalog.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link aboutme.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link contact.html]
- `#top` — **Page hero / banner** (ID `#top`; classes `.site-banner`) → normalized `.page-hero .zone .zone--top`
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
- `#main-content` — **Main page content** (ID `#main-content`) → normalized `.page-main`
- `#effects` — **Effects section** (ID `#effects`; classes `.effects-stage .py-5`) → normalized `.page-section .page-section--effects`
- `div.container-fluid.effects-stage__shell` — **Container Fluid** (classes `.container-fluid .effects-stage__shell`) → normalized `.layout-container`
- `div.effects-layout` — **Effects Layout** (classes `.effects-layout`) → normalized `.layout-row`
- `aside.ad-copy-card.ad-copy-card--cyan` — **Ad Copy Card** (classes `.ad-copy-card .ad-copy-card--cyan`) → normalized `.component-object`
- `#ride-ad-title` — **Ride Ad Title** (ID `#ride-ad-title`)
- `a.btn.btn-neon-cyan` — **Btn** (classes `.btn .btn-neon-cyan`) [TRIGGER: link build-my-bike.html]
- `article.effects-center.shynetyme-story` — **Effects Center** (classes `.effects-center .shynetyme-story`) → normalized `.zone .zone--center`
- `div.shynetyme-story__content` — **Shynetyme Story Content** (classes `.shynetyme-story__content`)
- `aside.ad-copy-card.ad-copy-card--pink` — **Ad Copy Card** (classes `.ad-copy-card .ad-copy-card--pink`) → normalized `.component-object`
- `#beyond-bike-ad-title` — **Beyond Bike Ad Title** (ID `#beyond-bike-ad-title`)
- `a.btn.btn-neon-pink` — **Btn** (classes `.btn .btn-neon-pink`) [TRIGGER: link contact.html]
- `#request` — **Request section** (ID `#request`; classes `.py-5 .bg-dark .text-white`) → normalized `.page-section .page-section--request`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `div.row.g-4.align-items-center` — **Row** (classes `.row .g-4 .align-items-center`) → normalized `.layout-row .zone .zone--center`
- `a.btn.btn-light.btn-lg` — **Btn** (classes `.btn .btn-light .btn-lg`) [TRIGGER: link build-my-bike.html]
- `footer.py-4.border-top` — **Site footer** (classes `.py-4 .border-top`) → normalized `.site-footer .zone .zone--top`
- `div.container.small.d-flex.flex-wrap.justify-content-between.gap-2` — **Container** (classes `.container .small .d-flex .flex-wrap .justify-content-between .gap-2`) → normalized `.layout-container`

## Naming rule

Use normalized selectors for future shared CSS/JavaScript; retain existing selectors wherever current functionality depends on them.
