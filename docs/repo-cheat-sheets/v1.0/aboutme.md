# aboutme.html — Page Object Cheat Sheet v1.0

**Source file:** `aboutme.html`  
**Purpose:** Stable object names and additive semantic selectors for page editing.

## Object map

- `body.deke-page` — **Deke Page** (classes `.deke-page`) → normalized `.page .page--aboutme`
- `a.skip-link` — **Skip Link** (classes `.skip-link`) [TRIGGER: link #main-content]
- `nav.navbar.navbar-expand-lg.navbar-dark.bg-dark.sticky-top` — **Primary navigation** (classes `.navbar .navbar-expand-lg .navbar-dark .bg-dark .sticky-top`) → normalized `.site-nav .zone .zone--top`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `a.navbar-brand.fw-bold.brand-lockup` — **Navbar Brand** (classes `.navbar-brand .fw-bold .brand-lockup`) [TRIGGER: link index.html]
- `img` — **Img 6** (no existing ID/class) → normalized `.media-object`
- `button.navbar-toggler` — **Toggle navigation** (classes `.navbar-toggler`) → normalized `.action-trigger` [TRIGGER: button; Bootstrap collapse; target #navMenu; controls #navMenu]
- `span.navbar-toggler-icon` — **Navbar Toggler Icon** (classes `.navbar-toggler-icon`)
- `#navMenu` — **NavMenu** (ID `#navMenu`; classes `.collapse .navbar-collapse`)
- `div.navbar-nav.ms-auto` — **Navbar Nav** (classes `.navbar-nav .ms-auto`)
- `a.nav-link.active` — **Nav Link** (classes `.nav-link .active`) [TRIGGER: link aboutme.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link build-my-bike.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link led-catalog.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link contact.html]
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
- `#main-content` — **Main page content** (ID `#main-content`; classes `.deke-main .py-5`) → normalized `.page-main`
- `div.container.deke-shell` — **Container** (classes `.container .deke-shell`) → normalized `.layout-container`
- `section.deke-support.mb-4` — **Deke Support section** (classes `.deke-support .mb-4`) → normalized `.page-section .page-section--deke-support`
- `#supportDeke` — **SupportDeke** (ID `#supportDeke`; classes `.section-title`)
- `a.btn.btn-neon-cyan.btn-lg` — **Btn** (classes `.btn .btn-neon-cyan .btn-lg`) [TRIGGER: link https://wa.me/13109452378?text=I%20saw%20your%20ShyneTyme%20banner%20and%20read%20your%20About%20Deke%20page.]
- `a.btn.btn-neon-pink.btn-lg` — **Btn** (classes `.btn .btn-neon-pink .btn-lg`) [TRIGGER: link mailto:westsidelistingservices@gmail.com?subject=I%20Saw%20Your%20ShyneTyme%20Banner]
- `a.btn.btn-outline-light.btn-lg` — **Btn** (classes `.btn .btn-outline-light .btn-lg`) [TRIGGER: link index.html]
- `div.deke-pay-grid` — **Fundraising and optional support links** (classes `.deke-pay-grid`) → normalized `.layout-row`
- `a.deke-pay-card.deke-pay-card--gofundme` — **Open Deke's GoFundMe campaign** (classes `.deke-pay-card .deke-pay-card--gofundme`) → normalized `.component-object` [TRIGGER: link https://gofund.me/3d95a8595]
- `img` — **Img 57** (no existing ID/class) → normalized `.media-object`
- `a.deke-pay-card` — **Support Deke through Cash App at dollar sign DekesworkinIT** (classes `.deke-pay-card`) → normalized `.component-object` [TRIGGER: link https://cash.app/$DekesworkinIT]
- `img` — **Img 59** (no existing ID/class) → normalized `.media-object`
- `a.deke-pay-card.deke-pay-card--venmo` — **Support Deke through Venmo at westlistingservices** (classes `.deke-pay-card .deke-pay-card--venmo`) → normalized `.component-object` [TRIGGER: link https://venmo.com/u/westlistingservices]
- `section.deke-alert.mb-4` — **Deke Alert section** (classes `.deke-alert .mb-4`) → normalized `.page-section .page-section--deke-alert`
- `#rightNow` — **RightNow** (ID `#rightNow`; classes `.section-title .mt-2`) → normalized `.zone .zone--right`
- `#workHistory` — **WorkHistory section** (ID `#workHistory`; classes `.work-history .mb-4`) → normalized `.page-section .page-section--workhistory`
- `#workHistoryTitle` — **WorkHistoryTitle** (ID `#workHistoryTitle`; classes `.section-title`)
- `div.deke-story-grid.mb-4` — **Deke Story Grid** (classes `.deke-story-grid .mb-4`) → normalized `.layout-row`
- `article.deke-card` — **Deke Card** (classes `.deke-card`) → normalized `.component-object`
- `#whatYouSee` — **WhatYouSee** (ID `#whatYouSee`)
- `article.deke-card.deke-card--accent` — **Deke Card** (classes `.deke-card .deke-card--accent`) → normalized `.component-object`
- `#whatICanDo` — **WhatICanDo** (ID `#whatICanDo`)
- `div.deke-story-grid.mb-4` — **Deke Story Grid** (classes `.deke-story-grid .mb-4`) → normalized `.layout-row`
- `article.deke-card` — **Deke Card** (classes `.deke-card`) → normalized `.component-object`
- `#backgroundBrief` — **BackgroundBrief** (ID `#backgroundBrief`)
- `aside.deke-card.deke-card--accent` — **Deke Card** (classes `.deke-card .deke-card--accent`) → normalized `.component-object`
- `#carsAndVans` — **CarsAndVans** (ID `#carsAndVans`)
- `section.deke-honk` — **Street banner message** (classes `.deke-honk`) → normalized `.page-section .page-section--deke-honk`
- `footer.py-4.border-top` — **Site footer** (classes `.py-4 .border-top`) → normalized `.site-footer .zone .zone--top`
- `div.container.small.d-flex.flex-wrap.justify-content-between.gap-2` — **Container** (classes `.container .small .d-flex .flex-wrap .justify-content-between .gap-2`) → normalized `.layout-container`

## Naming rule

Use normalized selectors for future shared CSS/JavaScript; retain existing selectors wherever current functionality depends on them.
