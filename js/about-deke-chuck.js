(() => {
  "use strict";

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src ? new URL(scriptElement.src, window.location.href) : null;
  const siteRoot = scriptUrl ? new URL("../", scriptUrl) : new URL("../", window.location.href);
  const chuckSpriteUrl = new URL("js/chuck-sprite.js?v=20260723-real-chuck-frames", siteRoot).href;
  const scanAtlasUrl = new URL("assets/brand/chuck-search-map.webp?v=20260723", siteRoot).href;
  const laptopAtlasUrl = new URL("assets/brand/chuck-search-laptop.webp?v=20260723", siteRoot).href;
  const motionCssUrl = new URL("css/site-motion.css?v=20260723-real-chuck-frames", siteRoot).href;
  const heroCssUrl = new URL("css/site-hero.css?v=20260723-uniform-header-v2", siteRoot).href;

  const loadSharedStylesheet = (href, dataAttribute) => {
    if (document.querySelector(`link[${dataAttribute}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(dataAttribute, "true");
    document.head.appendChild(link);
  };

  loadSharedStylesheet(motionCssUrl, "data-shynetyme-motion");
  loadSharedStylesheet(heroCssUrl, "data-shynetyme-hero");

  const loadChuckSprite = () => new Promise((resolve) => {
    if (window.ShynetymeChuckSprite) {
      resolve(window.ShynetymeChuckSprite);
      return;
    }

    const existing = document.querySelector('script[data-shynetyme-chuck-sprite]');
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

  const widget = document.getElementById("dekeChuckWidget");
  const trigger = document.getElementById("dekeChuckTrigger");
  const thought = document.getElementById("dekeChuckThought");
  const text = document.getElementById("dekeChuckText");
  const action = document.getElementById("dekeChuckAction");
  const close = document.getElementById("dekeChuckClose");

  if (!widget || !trigger || !thought || !text || !action || !close) return;

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
      text: "Have a paid project, referral or useful lead for Deke?",
      label: "Message Me",
      href: "https://wa.me/13109452378?text=I%20saw%20your%20About%20Deke%20page%20and%20may%20have%20a%20project%20or%20lead%20for%20you."
    },
    {
      color: "yellow",
      text: "No project today? A quick hello or smile message still helps.",
      label: "Say Hi",
      href: "https://wa.me/13109452378?text=Hi%20Deke%20%E2%80%94%20I%20saw%20your%20banner.%20Keep%20going!%20%F0%9F%99%82"
    }
  ];

  let chuckAnimation = null;
  let messageIndex = -1;
  let previousScrollY = window.scrollY;
  let scrollTimer = 0;
  let hideTimer = 0;
  let revealTimer = 0;

  loadChuckSprite().then((spriteApi) => {
    chuckAnimation = spriteApi?.mount({
      button: trigger,
      image: trigger.querySelector("img"),
      scanUrl: scanAtlasUrl,
      laptopUrl: laptopAtlasUrl
    }) || null;
  });

  function setColor(color) {
    thought.classList.remove(
      "deke-chuck-thought--yellow",
      "deke-chuck-thought--pink",
      "deke-chuck-thought--blue"
    );
    thought.classList.add(`deke-chuck-thought--${color}`);
  }

  function hideThought() {
    window.clearTimeout(hideTimer);
    thought.classList.remove("is-visible");
    trigger.setAttribute("aria-expanded", "false");

    window.setTimeout(() => {
      if (!thought.classList.contains("is-visible")) thought.hidden = true;
    }, 360);
  }

  function scheduleHide() {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hideThought, 6800);
  }

  function showMessage(index) {
    const message = messages[index];
    setColor(message.color);
    text.textContent = message.text;
    action.textContent = message.label;
    action.href = message.href;
    thought.hidden = false;

    window.requestAnimationFrame(() => {
      thought.classList.add("is-visible");
      trigger.setAttribute("aria-expanded", "true");
      scheduleHide();
    });
  }

  function showNextMessage() {
    messageIndex = (messageIndex + 1) % messages.length;
    showMessage(messageIndex);
  }

  function handleScroll() {
    const currentScrollY = window.scrollY;
    const mode = currentScrollY < previousScrollY ? "scan" : "laptop";
    previousScrollY = currentScrollY;

    widget.classList.add("is-searching");
    chuckAnimation?.start(mode);
    hideThought();
    window.clearTimeout(scrollTimer);

    scrollTimer = window.setTimeout(() => {
      widget.classList.remove("is-searching");
      chuckAnimation?.stop();
      showNextMessage();
    }, 620);
  }

  trigger.addEventListener("click", () => {
    widget.classList.remove("is-searching");
    chuckAnimation?.stop();
    showNextMessage();
  });

  close.addEventListener("click", hideThought);
  window.addEventListener("scroll", handleScroll, { passive: true });

  thought.addEventListener("pointerenter", () => window.clearTimeout(hideTimer));
  thought.addEventListener("pointerleave", scheduleHide);
  thought.addEventListener("focusin", () => window.clearTimeout(hideTimer));
  thought.addEventListener("focusout", scheduleHide);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideThought();
  });

  revealTimer = window.setTimeout(showNextMessage, 1200);

  window.addEventListener("pagehide", () => {
    chuckAnimation?.stop();
    window.clearTimeout(scrollTimer);
    window.clearTimeout(hideTimer);
    window.clearTimeout(revealTimer);
  });
})();