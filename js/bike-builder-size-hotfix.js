(() => {
  "use strict";

  const NOTE_TEXT = "Please submit more than one builder of the selected type of bike you would like to have LEDs installed on.";
  const SMALL_FRAME_BASELINES = {
    toddler: 540,
    preschool: 565,
    youth: 590
  };

  let installed = false;
  let scheduledFrame = 0;

  const addStyles = () => {
    if (document.getElementById("bikeBuilderPrimaryOnlyStyles")) return;
    const style = document.createElement("style");
    style.id = "bikeBuilderPrimaryOnlyStyles";
    style.textContent = `
      .preview-multi-build-note {
        margin: 1rem -1rem -1rem;
        padding: .9rem 1rem;
        border-top: 1px solid rgba(49, 230, 255, .3);
        color: #eef8ff;
        background: linear-gradient(100deg, rgba(49, 230, 255, .08), rgba(155, 131, 255, .15));
        font-size: .88rem;
        font-weight: 750;
        line-height: 1.45;
      }
    `;
    document.head.appendChild(style);
  };

  const removeSecondaryBikeControls = () => {
    const yes = document.getElementById("addKidBikeYes");
    const no = document.getElementById("addKidBikeNo");
    const row = yes?.closest(".question-row") || no?.closest(".question-row");
    const placeholder = document.getElementById("kidBikeOptions");

    if (no) no.checked = true;

    if (placeholder && row && placeholder.closest(".question-row") === row) {
      row.parentElement?.insertBefore(placeholder, row);
    }

    if (placeholder) {
      placeholder.hidden = true;
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.replaceChildren();
      placeholder.style.display = "none";
    }

    row?.remove();

    const setupButton = document.querySelector('[data-bs-target="#bikeSetup"]');
    if (setupButton) setupButton.textContent = "1. Bicycle size";

    const kidBike = document.getElementById("kidBikeGroup");
    if (kidBike) {
      kidBike.setAttribute("hidden", "");
      kidBike.replaceChildren();
    }
  };

  const addPreviewFooterNote = () => {
    if (document.querySelector(".preview-multi-build-note")) return;
    const cardBody = document.querySelector(".preview-card .card-body");
    if (!cardBody) return;

    const note = document.createElement("p");
    note.className = "preview-multi-build-note";
    note.textContent = NOTE_TEXT;
    cardBody.appendChild(note);
  };

  const liftSmallPrimaryFrames = () => {
    const data = window.ShynetymeBikeBuilderData;
    const renderer = window.ShynetymeBikeBuilderRenderer;
    const frameSelect = document.getElementById("frameSize");
    const bodySelect = document.getElementById("bikeBodyStyle");
    const mainBike = document.getElementById("mainBikeGroup");
    const appIcons = document.getElementById("appControlIcons");
    if (!data || !renderer || !frameSelect || !bodySelect || !mainBike) return;

    const sizeKey = frameSelect.value;
    const bottomY = SMALL_FRAME_BASELINES[sizeKey];
    if (!bottomY) return;

    const body = data.bikeBodies[bodySelect.value] || data.bikeBodies.comfort;
    const size = data.sizeConfig[sizeKey];
    if (!body || !size) return;

    const transform = renderer.fitTransform(body, size.scale, 450, 825, bottomY);
    mainBike.setAttribute(
      "transform",
      `translate(${transform.x} ${transform.y}) scale(${transform.scale})`
    );

    if (appIcons) {
      const gapCenter = (body.rearWheel.x + body.frontWheel.x) / 2;
      const wheelBottom = Math.max(
        body.rearWheel.y + body.rearWheel.r,
        body.frontWheel.y + body.frontWheel.r
      );
      const iconScale = Math.max(.58, Math.min(.92, transform.scale * .85));
      const iconX = Math.round(transform.x + gapCenter * transform.scale - 72 * iconScale);
      const iconY = Math.round(transform.y + wheelBottom * transform.scale - 43 * iconScale);
      appIcons.setAttribute("transform", `translate(${iconX} ${iconY}) scale(${iconScale})`);
    }
  };

  const applyFixes = () => {
    removeSecondaryBikeControls();
    addPreviewFooterNote();
    liftSmallPrimaryFrames();
  };

  const scheduleFixes = () => {
    window.cancelAnimationFrame(scheduledFrame);
    scheduledFrame = window.requestAnimationFrame(() => {
      scheduledFrame = window.requestAnimationFrame(applyFixes);
    });
  };

  const install = () => {
    if (installed) return true;
    const form = document.getElementById("bikeBuilderForm");
    const bodySelect = document.getElementById("bikeBodyStyle");
    if (!form || !bodySelect || !window.ShynetymeBikeBuilderRenderer) return false;

    installed = true;
    addStyles();
    applyFixes();
    form.addEventListener("change", scheduleFixes);
    form.addEventListener("reset", () => window.setTimeout(scheduleFixes, 40));
    return true;
  };

  const observer = new MutationObserver(() => {
    if (install()) observer.disconnect();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  let attempts = 0;
  const waitForLiveView = () => {
    if (install()) return;
    attempts += 1;
    if (attempts < 120) window.setTimeout(waitForLiveView, 50);
    else observer.disconnect();
  };

  waitForLiveView();
})();
