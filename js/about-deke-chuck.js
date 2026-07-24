(() => {
  "use strict";

  if (window.ShynetymeChuck?.mounted) return;

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src
    ? new URL(scriptElement.src, window.location.href)
    : new URL("js/about-deke-chuck.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const chuckCssUrl = new URL("css/about-deke-chuck.css?v=20260724-exact-thought-cloud-v1", siteRoot).href;
  const chuckSpriteUrl = new URL("js/chuck-sprite.js?v=20260724-real-chuck-frames", siteRoot).href;
  const scanAtlasUrl = new URL("assets/brand/chuck-search-map.webp?v=20260723", siteRoot).href;
  const laptopAtlasUrl = new URL("assets/brand/chuck-search-laptop.webp?v=20260723", siteRoot).href;
  const fallbackImageUrl = new URL("assets/brand/pet-chuck-mark.png", siteRoot).href;

  const loadStylesheet = (href, dataAttribute) => {
    const existing = document.querySelector(`link[${dataAttribute}]`);
    if (existing) {
      if (existing.href !== href) existing.href = href;
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(dataAttribute, "true");
    document.head.appendChild(link);
  };

  loadStylesheet(chuckCssUrl, "data-shynetyme-chuck");

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
  const BOTTOM_MESSAGE_INTERVAL_MS = 20000;
  const SCROLL_STOP_MS = 220;

  let chuckAnimation = null;
  let messageIndex = -1;
  let previousScrollY = window.scrollY;
  let scrollStopTimer = 0;
  let hideTimer = 0;
  let initialTimer = 0;
  let bottomCycleTimer = 0;
  let initialMessagePending = true;

  loadChuckSprite().then((spriteApi) => {
    chuckAnimation = spriteApi?.mount({
      button: trigger,
      image: trigger.querySelector("img"),
      scanUrl: scanAtlasUrl,
      laptopUrl: laptopAtlasUrl
    }) || null;
    chuckAnimation?.stop();
  });

  const isAtBottom = () => (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8
  );

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

  const clearBottomCycle = () => {
    window.clearTimeout(bottomCycleTimer);
    bottomCycleTimer = 0;
  };

  const scheduleNextBottomMessage = () => {
    clearBottomCycle();
    if (!isAtBottom()) return;

    bottomCycleTimer = window.setTimeout(() => {
      if (!isAtBottom()) return;
      showNextMessage();
      scheduleNextBottomMessage();
    }, BOTTOM_MESSAGE_INTERVAL_MS);
  };

  const startBottomCycle = (showImmediately = true) => {
    clearBottomCycle();
    if (!isAtBottom()) return;

    if (showImmediately) showNextMessage();
    scheduleNextBottomMessage();
  };

  const cancelInitialMessage = () => {
    initialMessagePending = false;
    window.clearTimeout(initialTimer);
  };

  const handleScroll = () => {
    cancelInitialMessage();
    clearBottomCycle();
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

      // No thought appears when ordinary scrolling stops. Bottom is the only exception.
      if (isAtBottom()) startBottomCycle(true);
    }, SCROLL_STOP_MS);
  };

  trigger.addEventListener("click", () => {
    cancelInitialMessage();
    widget.classList.remove("is-searching");
    chuckAnimation?.stop();
    showNextMessage();
    if (isAtBottom()) scheduleNextBottomMessage();
  });

  close.addEventListener("click", () => {
    hideThought();
    if (isAtBottom()) scheduleNextBottomMessage();
  });

  window.addEventListener("scroll", handleScroll, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideThought();
  });

  // One page-load thought only. It fades away after ten seconds.
  initialTimer = window.setTimeout(() => {
    if (!initialMessagePending) return;
    initialMessagePending = false;
    showNextMessage();
    if (isAtBottom()) scheduleNextBottomMessage();
  }, 650);

  window.addEventListener("pagehide", () => {
    chuckAnimation?.stop();
    window.clearTimeout(scrollStopTimer);
    window.clearTimeout(hideTimer);
    window.clearTimeout(initialTimer);
    clearBottomCycle();
  });

  window.ShynetymeChuck = {
    mounted: true,
    widget,
    showNextMessage,
    hideThought,
    startBottomCycle
  };
})();
