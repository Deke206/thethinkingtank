(() => {
  "use strict";

  if (window.ShynetymeChuck?.mounted) return;

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src
    ? new URL(scriptElement.src, window.location.href)
    : new URL("js/site-chuck.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const chuckCssUrl = new URL("css/site-chuck.css?v=20260724-cloud-guidance", siteRoot).href;
  const cloudCssUrl = new URL("css/site-chuck-cloud.css?v=20260725-single-layer-v1", siteRoot).href;
  const chuckSpriteUrl = new URL("js/chuck-sprite.js", siteRoot).href;
  const scanAtlasUrl = new URL("assets/brand/chuck-search-map.webp", siteRoot).href;
  const laptopAtlasUrl = new URL("assets/brand/chuck-search-laptop.webp", siteRoot).href;
  const fallbackImageUrl = new URL("assets/brand/pet-chuck-mark.png", siteRoot).href;
  const aboutDekeUrl = new URL("aboutme.html", siteRoot).href;
  const bikeBuilderUrl = new URL("build-my-bike.html", siteRoot).href;

  const loadStylesheet = (href, attribute) => {
    const existing = document.querySelector(`link[${attribute}]`);
    if (existing) {
      if (existing.href !== href) existing.href = href;
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(attribute, "true");
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
      <div class="deke-chuck-thought deke-chuck-thought--cyan" id="dekeChuckThought" role="status" aria-live="polite" hidden>
        <button class="deke-chuck-thought__close" id="dekeChuckClose" type="button" aria-label="Close Chuck's message">×</button>
        <p class="deke-chuck-thought__text" id="dekeChuckText"></p>
        <a class="deke-chuck-thought__action" id="dekeChuckAction" href="#"></a>
      </div>
      <button class="deke-chuck-trigger" id="dekeChuckTrigger" type="button" aria-expanded="false" aria-controls="dekeChuckThought" aria-label="Tickle Chuck for another thought">
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

  loadStylesheet(chuckCssUrl, "data-shynetyme-site-chuck");
  loadStylesheet(cloudCssUrl, "data-shynetyme-site-chuck-cloud");

  const widget = ensureWidget();
  const trigger = widget.querySelector("#dekeChuckTrigger");
  const thought = widget.querySelector("#dekeChuckThought");
  const text = widget.querySelector("#dekeChuckText");
  const action = widget.querySelector("#dekeChuckAction");
  const close = widget.querySelector("#dekeChuckClose");

  if (!trigger || !thought || !text || !action || !close) return;
  if (widget.dataset.chuckMounted === "true") return;
  widget.dataset.chuckMounted = "true";

  const welcomeMessage = {
    color: "cyan",
    text: "Welcome to\nShyneTyme.Works!\nRead about Deke\nbelow.",
    label: "Deke",
    href: aboutDekeUrl
  };

  const rotatingMessages = [
    {
      color: "pink",
      text: "Need help?\nTickle Chuck.\nI'll point\nthe way.",
      label: "Next",
      href: "#chuck-next"
    },
    {
      color: "violet",
      text: "Need Shyne?\nTry the LED\nBike Factory.",
      label: "LED\nBike Sim",
      href: bikeBuilderUrl
    },
    {
      color: "amber",
      text: "Need another\nspot?\nTickle Chuck\nagain.",
      label: "Next",
      href: "#chuck-next"
    }
  ];

  const MESSAGE_VISIBLE_MS = 10000;
  const AFTER_SCROLL_DELAY_MS = 15000;
  const SCROLL_STOP_MS = 240;

  let chuckAnimation = null;
  let messageIndex = -1;
  let previousScrollY = window.scrollY;
  let scrollStopTimer = 0;
  let delayedThoughtTimer = 0;
  let hideTimer = 0;
  let welcomeTimer = 0;

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
      "deke-chuck-thought--green",
      "deke-chuck-thought--blue",
      "deke-chuck-thought--cyan",
      "deke-chuck-thought--pink",
      "deke-chuck-thought--violet",
      "deke-chuck-thought--amber"
    );
    thought.classList.add(`deke-chuck-thought--${color}`);
  };

  const hideThought = () => {
    window.clearTimeout(hideTimer);
    thought.classList.remove("is-visible", "is-materializing");
    trigger.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (!thought.classList.contains("is-visible")) thought.hidden = true;
    }, 380);
  };

  const materializeThought = () => {
    thought.classList.remove("is-materializing");
    void thought.offsetWidth;
    thought.classList.add("is-materializing");
  };

  const showMessage = (message) => {
    window.clearTimeout(hideTimer);
    widget.classList.remove("is-searching");
    chuckAnimation?.stop();
    setColor(message.color);
    text.textContent = message.text;
    text.style.whiteSpace = "pre-line";
    action.textContent = message.label;
    action.style.whiteSpace = "pre-line";
    action.href = message.href;
    thought.hidden = false;
    materializeThought();

    window.requestAnimationFrame(() => {
      thought.classList.add("is-visible");
      trigger.setAttribute("aria-expanded", "true");
    });

    hideTimer = window.setTimeout(hideThought, MESSAGE_VISIBLE_MS);
  };

  const showNextMessage = () => {
    messageIndex = (messageIndex + 1) % rotatingMessages.length;
    showMessage(rotatingMessages[messageIndex]);
  };

  const cancelDelayedThought = () => {
    window.clearTimeout(delayedThoughtTimer);
    delayedThoughtTimer = 0;
  };

  const scheduleAfterScrollThought = () => {
    cancelDelayedThought();
    delayedThoughtTimer = window.setTimeout(showNextMessage, AFTER_SCROLL_DELAY_MS);
  };

  const handleScroll = () => {
    window.clearTimeout(welcomeTimer);
    cancelDelayedThought();
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
      scheduleAfterScrollThought();
    }, SCROLL_STOP_MS);
  };

  trigger.addEventListener("click", () => {
    cancelDelayedThought();
    widget.classList.remove("is-searching");
    chuckAnimation?.stop();
    showNextMessage();
  });

  action.addEventListener("click", (event) => {
    if (action.getAttribute("href") === "#chuck-next") {
      event.preventDefault();
      showNextMessage();
    }
  });

  close.addEventListener("click", hideThought);
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideThought();
  });

  welcomeTimer = window.setTimeout(() => showMessage(welcomeMessage), 650);

  window.addEventListener("pagehide", () => {
    chuckAnimation?.stop();
    window.clearTimeout(scrollStopTimer);
    window.clearTimeout(delayedThoughtTimer);
    window.clearTimeout(hideTimer);
    window.clearTimeout(welcomeTimer);
  }, { once: true });

  window.ShynetymeChuck = {
    mounted: true,
    widget,
    showNextMessage,
    hideThought,
    showWelcome: () => showMessage(welcomeMessage)
  };
})();
