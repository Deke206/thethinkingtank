(() => {
  "use strict";

  const timeline = document.querySelector("[data-work-history-timeline]");
  const status = document.querySelector("[data-work-history-status]");
  if (!timeline) return;

  let observer;

  const applyNewestFirst = () => {
    const days = [...timeline.children].filter((item) => item.classList.contains("work-history__day"));
    if (!days.length) return;

    observer?.disconnect();

    days.forEach((day) => {
      const entries = day.querySelector(".work-history__entries");
      if (!entries) return;
      entries.replaceChildren(...[...entries.children].reverse());
    });

    timeline.replaceChildren(...days.reverse());
    timeline.setAttribute("aria-label", "Website edits from newest to oldest");
    timeline.dataset.historyOrder = "newest-first";

    if (status?.textContent) {
      status.textContent = status.textContent
        .replace(/displayed oldest to newest/gi, "displayed newest to oldest")
        .replace(/oldest to newest/gi, "newest to oldest");
    }

    observer?.observe(timeline, { childList: true });
  };

  observer = new MutationObserver(() => {
    window.requestAnimationFrame(applyNewestFirst);
  });

  observer.observe(timeline, { childList: true });
  applyNewestFirst();

  window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
})();
