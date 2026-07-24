(() => {
  "use strict";

  if (window.ShynetymeChuck?.mounted) return;

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src
    ? new URL(scriptElement.src, window.location.href)
    : new URL("js/site-chuck.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const chuckCssUrl = new URL("css/site-chuck.css?v=20260724-shared-chuck-v2", siteRoot).href;
  const chuckSpriteUrl = new URL("js/chuck-sprite.js?v=20260724-real-chuck-frames", siteRoot).href;
  const scanAtlasUrl = new URL("assets/brand/chuck-search-map.webp?v=20260723", siteRoot).href;
  const laptopAtlasUrl = new URL("assets/brand/chuck-search-laptop.webp?v=20260723", siteRoot).href;
  const fallbackImageUrl = new URL("assets/brand/pet-chuck-mark.png", siteRoot).href;

  const loadStylesheet = () => {
    const existing = document.querySelector("link[data-shynetyme-site-chuck]");
    if (existing) {
      if (existing.href !== chuckCssUrl) existing.href = chuckCssUrl;
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chuckCssUrl;
    link.dataset.shynetymeSiteChuck = "true";
    document.head.appendChild(link);
  };

  const removeRetiredGuide = () => {
    document.querySelectorAll(".site-guide-button, #siteGuidePanel").forEach((element) => element.remove());
  };

  const ensureWidget = () => {
    const existing = document.getElementById("dekeChuckWidget");
    if (existing) {
      removeRetiredGuide();
      return existing;
    }

    removeRetiredGuide();
    const widget = document.createElement("div");
    widget.className = "deke-chuck-widget";
    widget.id = "dekeChuckWidget";
    widget.innerHTML = `
      <div class="deke-chuck-thought deke-chuck-thought--yellow" id="dekeChuckThought" role="status" aria-live="polite" hidden>
        <button class="deke-chuck-thought__close" id="dekeChuckClose" type="button" aria-label="Close Chuck's message">×</button>
        <p class="deke-chuck-thought__text" id="dekeChuckText"></p>
        <a class="deke-chuck-thought__action" id="dekeChuckAction" href="#" target="_blank" rel="noopener"></a>
      </div>
      <button class="deke-chuck-trigger" id="dekeChuckTrigger" type="button" aria-expanded="false" aria-controls="dekeChuckThought" aria-label="Show Chuck's next thought">
        <span class="deke-chuck-search-light" aria-hidden="true"></span>
        <img src="${fallbackImageUrl}" width="118" height="118" alt="Chuck, the ShyneTyme Works robot-cat helper">
      </button>`;
    document.body.appendChild(widget);
    return widget;
  };

  const loadChuckSprite = () => new Promise((resolve) => {
    if (window.ShynetymeChuckSprite) {
      resolve(window.ShynetymeChuckSprite);
      return;
    }

    const existing = document.querySelector("script[data-shynetyme-chuck-sprite]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.ShynetymeChuckSprite || null), { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = chuckSpriteUrl;
    script.defer = true;
    script.dataset.shynetymeChuckSprite = "true";
    script.addEventListener("load", () => resolve(window.ShynetymeChuckSprite || null), { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.appendChild(script);
  });

  loadStylesheet();

  const widget = ensureWidget();
  const trigger = widget.querySelector("#dekeChuckTrigger");
  const thought = widget.querySelector("#dekeChuckThought");
  const text = widget.querySelector("#dekeChuckText");
  const action = widget.querySelector("#dekeChuckAction");
  const close = widget.querySelector("#dekeChuckClose");

  if (!trigger || !thought || !text || !action || !close) return;
  if (widget.dataset.chuckMounted === "true") return;
  widget.dataset.chuckMounted = "true";

  const messages = [
    {
      color: "yellow",
      text: "A little generator gas keeps Deke's PC powered and the work moving.",
      label: "Cash App",
      href: "https://cash.app/$westsidels310"
    },
    {
      color: "pink",
      text: "Prefer Venmo? Every bit helps keep another work session going.",
      label: "Venmo",
      href: "https://venmo.com/u/westlistingservices"
    },
    {
      color: "blue",
      text: "Have a paid project, referral, or useful lead for Deke?",
      label: "Message Me",
      href: "https://wa.me/13109452378?text=I%20saw%20ShyneTyme.Works%20and%20may%20have%20a%20project%20or%20lead%20for%20you."
    },
    {
      color: "green",
      text: "No project today? A quick hello still helps keep the momentum alive.",
      label: "Say Hi",
      href: "https://wa.me/13109452378?text=Hi%20Deke%20%E2%80%94%20I%20saw%20ShyneTyme.Works.%20Keep%20going!%20%F0%9F%99%82"
    }
  ];

  const MESSAGE_VISIBLE_MS = 10000;
  const SCROLL_STOP_MS = 220;
  let chuckAnimation = null;
  let messageIndex = -1;
  let previousScrollY = window.scrollY;
  let scrollStopTimer = 0;
  let hideTimer = 0;
  let footerVisible = false;
  let bottomThoughtShown = false;
  let footerObserver = null;

  loadChuckSprite().then((spriteApi) => {
    chuckAnimation = spriteApi?.mount({
      button: trigger,
      image: trigger.querySelector("img"),
      scanUrl: scanAtlasUrl,
      laptopUrl: laptopAtlasUrl
    }) || null;
    chuckAnimation?.stop();
  });

  const setColor = (color) => {
    thought.classList.remove(
      "deke-chuck-thought--yellow",
      "deke-chuck-thought--pink",
      "deke-chuck-thought--blue",
      "deke-chuck-thought--green"
    );
    thought.classList.add(`deke-chuck-thought--${color}`);
  };

  const hideThought = () => {
    window.clearTimeout(hideTimer);
    thought.classList.remove("is-visible");
    trigger.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (!thought.classList.contains("is-visible")) thought.hidden = true;
    }, 360);
  };

  const showMessage = (message) => {
    window.clearTimeout(hideTimer);
    widget.classList.remove("is-searching");
    chuckAnimation?.stop();
    setColor(message.color);
    text.textContent = message.text;
    action.textContent = message.label;
    action.href = message.href;
    thought.hidden = false;
    window.requestAnimationFrame(() => {
      thought.classList.add("is-visible");
      trigger.setAttribute("aria-expanded", "true");
    });
    hideTimer = window.setTimeout(hideThought, MESSAGE_VISIBLE_MS);
  };

  const showNextMessage = () => {
    messageIndex = (messageIndex + 1) % messages.length;
    showMessage(messages[messageIndex]);
  };

  const showBottomThoughtOnce = () => {
    if (!footerVisible || bottomThoughtShown) return;
    bottomThoughtShown = true;
    showNextMessage();
  };

  const handleScroll = () => {
    hideThought();
    const currentScrollY = window.scrollY;
    const mode = currentScrollY < previousScrollY ? "scan" : "laptop";
    previousScrollY = currentScrollY;
    widget.classList.add("is-searching");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      chuckAnimation?.start(mode);
    }

    window.clearTimeout(scrollStopTimer);
    scrollStopTimer = window.setTimeout(() => {
      widget.classList.remove("is-searching");
      chuckAnimation?.stop();
      showBottomThoughtOnce();
    }, SCROLL_STOP_MS);
  };

  const footer = document.querySelector("footer");
  if (footer && "IntersectionObserver" in window) {
    footerObserver = new IntersectionObserver((entries) => {
      footerVisible = entries.some((entry) => entry.isIntersecting);
      if (footerVisible) showBottomThoughtOnce();
    }, { threshold: .16 });
    footerObserver.observe(footer);
  } else {
    footerVisible = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  }

  trigger.addEventListener("click", () => {
    widget.classList.remove("is-searching");
    chuckAnimation?.stop();
    showNextMessage();
  });

  close.addEventListener("click", hideThought);
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideThought();
  });

  window.addEventListener("pagehide", () => {
    chuckAnimation?.stop();
    footerObserver?.disconnect();
    window.clearTimeout(scrollStopTimer);
    window.clearTimeout(hideTimer);
  }, { once: true });

  window.ShynetymeChuck = {
    mounted: true,
    widget,
    showNextMessage,
    hideThought,
    showBottomThoughtOnce
  };
})();
