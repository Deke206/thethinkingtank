# LEDexpo.html — Page Object Cheat Sheet v1.0

**Source file:** `LEDexpo.html`  
**Purpose:** Stable object names and additive semantic selectors for page editing.

## Object map

- `body.ledexpo-page` — **Ledexpo Page** (classes `.ledexpo-page`) → normalized `.page .page--ledexpo`
- `nav.navbar.navbar-expand-lg.navbar-dark.bg-dark.sticky-top` — **Primary navigation** (classes `.navbar .navbar-expand-lg .navbar-dark .bg-dark .sticky-top`) → normalized `.site-nav .zone .zone--top`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `a.navbar-brand.fw-bold.brand-lockup` — **Navbar Brand** (classes `.navbar-brand .fw-bold .brand-lockup`) [TRIGGER: link index.html]
- `img` — **Img 5** (no existing ID/class) → normalized `.media-object`
- `button.navbar-toggler` — **Toggle navigation** (classes `.navbar-toggler`) → normalized `.action-trigger` [TRIGGER: button; Bootstrap collapse; target #navMenu; controls #navMenu]
- `span.navbar-toggler-icon` — **Navbar Toggler Icon** (classes `.navbar-toggler-icon`)
- `#navMenu` — **NavMenu** (ID `#navMenu`; classes `.collapse .navbar-collapse`)
- `div.navbar-nav.ms-auto` — **Navbar Nav** (classes `.navbar-nav .ms-auto`)
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link build-my-bike.html]
- `a.nav-link` — **Nav Link** (classes `.nav-link`) [TRIGGER: link led-catalog.html]
- `a.nav-link.active` — **Nav Link** (classes `.nav-link .active`) [TRIGGER: link LEDexpo.html]
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
- `li.page-subheader-item` — **Page Subheader Item** (classes `.page-subheader-item`)
- `#main-content` — **Main page content** (ID `#main-content`) → normalized `.page-main`
- `#ledexpo-video-section` — **Ledexpo Video Section section** (ID `#ledexpo-video-section`; classes `.ledexpo-section`) → normalized `.page-section .page-section--ledexpo-video-section`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `#ledexpo-video-heading` — **Ledexpo Video Heading** (ID `#ledexpo-video-heading`; classes `.section-title .mb-4`)
- `#ledexpo-video-player` — **Ledexpo Video Player** (ID `#ledexpo-video-player`; classes `.ledexpo-panel .ledexpo-video-player`) → normalized `.component-object`
- `#ledexpo-video-frame` — **Ledexpo Video Frame** (ID `#ledexpo-video-frame`; classes `.ledexpo-video-frame`)
- `#ledexpo-feature-video` — **Illuminated bicycle ride near the waterfront** (ID `#ledexpo-feature-video`; classes `.ledexpo-video-embed`)
- `#ledexpo-video-selector` — **Choose a video** (ID `#ledexpo-video-selector`; classes `.ledexpo-video-selector`)
- `#ledexpo-video-choice-01` — **Ledexpo Video Choice 01 trigger** (ID `#ledexpo-video-choice-01`; classes `.ledexpo-video-choice`) → normalized `.action-trigger` [TRIGGER: button]
- `#ledexpo-video-choice-02` — **Ledexpo Video Choice 02 trigger** (ID `#ledexpo-video-choice-02`; classes `.ledexpo-video-choice`) → normalized `.action-trigger` [TRIGGER: button]
- `#ledexpo-video-description` — **Ledexpo Video Description** (ID `#ledexpo-video-description`; classes `.ledexpo-video-copy`)
- `#ledexpo-video-date` — **Ledexpo Video Date** (ID `#ledexpo-video-date`)
- `#ledexpo-video-description-title` — **Ledexpo Video Description Title** (ID `#ledexpo-video-description-title`; classes `.h4`)
- `#ledexpo-video-description-text` — **Ledexpo Video Description Text** (ID `#ledexpo-video-description-text`; classes `.mb-0`)
- `#ledexpo-gallery-section` — **Ledexpo Gallery Section section** (ID `#ledexpo-gallery-section`; classes `.ledexpo-section`) → normalized `.page-section .page-section--ledexpo-gallery-section`
- `div.container` — **Container** (classes `.container`) → normalized `.layout-container`
- `#ledexpo-gallery-heading` — **Ledexpo Gallery Heading** (ID `#ledexpo-gallery-heading`; classes `.section-title .mb-2`)
- `#ledexpo-gallery-list` — **Ledexpo Gallery List** (ID `#ledexpo-gallery-list`; classes `.ledexpo-gallery-list`)
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 67** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 69** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 71** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 73** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 75** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 77** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 79** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 81** (no existing ID/class) → normalized `.media-object`
- `article.ledexpo-panel.ledexpo-gallery-item` — **Ledexpo Panel** (classes `.ledexpo-panel .ledexpo-gallery-item`) → normalized `.component-object`
- `img` — **Img 83** (no existing ID/class) → normalized `.media-object`
- `footer.py-4.border-top` — **Site footer** (classes `.py-4 .border-top`) → normalized `.site-footer .zone .zone--top`
- `div.container.small.d-flex.flex-wrap.justify-content-between.gap-2` — **Container** (classes `.container .small .d-flex .flex-wrap .justify-content-between .gap-2`) → normalized `.layout-container`

## Naming rule

Use normalized selectors for future shared CSS/JavaScript; retain existing selectors wherever current functionality depends on them.
