(() => {
  const button = document.querySelector('.site-guide-button');
  const panel = document.getElementById('siteGuidePanel');
  const close = panel?.querySelector('.site-guide-close');
  if (!button || !panel || !close) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('a')?.focus();
  };

  button.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => { setOpen(false); button.focus(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) { setOpen(false); button.focus(); }
  });
})();

/* Keep the Build My Bike LED simulation animated on every device. */
(() => {
  const form = document.getElementById('bikeBuilderForm');
  const frameSizeSelect = document.getElementById('frameSize');
  const mainBike = document.getElementById('mainBikeGroup');
  const appControlIcons = document.getElementById('appControlIcons');
  if (!form || !frameSizeSelect || !mainBike || !appControlIcons) return;

  document.documentElement.classList.add('force-bike-planner-motion');

  if (!document.getElementById('bikePlannerMotionOverride')) {
    const motionStyle = document.createElement('style');
    motionStyle.id = 'bikePlannerMotionOverride';
    motionStyle.textContent = `
      html.force-bike-planner-motion .zone-on {
        animation: rgbTwinkle 1.35s linear infinite !important;
      }
      html.force-bike-planner-motion .zone-on:nth-of-type(2n) {
        animation-delay: -.35s !important;
        animation-duration: 1.05s !important;
      }
      html.force-bike-planner-motion .zone-on:nth-of-type(3n) {
        animation-delay: -.7s !important;
        animation-duration: 1.65s !important;
      }
      html.force-bike-planner-motion .legend-on {
        animation: legendTwinkle .9s infinite alternate !important;
      }
      html.force-bike-planner-motion .flag-flash-red #flagPoleLight,
      html.force-bike-planner-motion .flag-flash-orange #flagPoleLight {
        animation: flagCautionFlash .82s steps(1, end) infinite !important;
      }
      html.force-bike-planner-motion .tail-animated.zone-on .tail-pixel {
        animation: tailCenterOut 8s linear infinite !important;
      }
      html.force-bike-planner-motion .tail-animated .tail-center { animation-delay: 0s !important; }
      html.force-bike-planner-motion .tail-animated .tail-inner { animation-delay: .25s !important; }
      html.force-bike-planner-motion .tail-animated .tail-outer { animation-delay: .5s !important; }
      html.force-bike-planner-motion .signal-animated.zone-on .signal-segment {
        animation: directionalSignal 1.2s linear infinite !important;
      }
      html.force-bike-planner-motion .signal-animated .signal-step-1 { animation-delay: 0s !important; }
      html.force-bike-planner-motion .signal-animated .signal-step-2 { animation-delay: .16s !important; }
      html.force-bike-planner-motion .signal-animated .signal-step-3 { animation-delay: .32s !important; }
    `;
    document.head.appendChild(motionStyle);
  }

  const repositionedSizes = new Set(['toddler', 'preschool', 'youth']);
  const adultScale = 1.05;
  const adultTranslateX = Math.round(450 - (441 * adultScale));
  const adultTranslateY = Math.round(642 - (560 * adultScale));

  const placeSmallBikeInAdultViewportArea = () => {
    if (!repositionedSizes.has(frameSizeSelect.value)) return;

    const currentTransform = mainBike.transform.baseVal.consolidate();
    const bounds = mainBike.getBBox();
    if (!currentTransform || !bounds.width || !bounds.height) return;

    // Reuse the scale already assigned by bike-builder.js. This changes position only.
    const currentScale = currentTransform.matrix.a;
    const artworkCenterX = bounds.x + (bounds.width / 2);
    const adultCenterX = adultTranslateX + (artworkCenterX * adultScale);
    const adultTopY = adultTranslateY + (bounds.y * adultScale);
    const translateX = Math.round(adultCenterX - (artworkCenterX * currentScale));
    const translateY = Math.round(adultTopY - (bounds.y * currentScale));

    mainBike.setAttribute(
      'transform',
      `translate(${translateX} ${translateY}) scale(${currentScale})`
    );

    // Keep the controller icons attached to the bicycle after the position-only move.
    const wheelGapCenterX = translateX + (455 * currentScale);
    const wheelBottomY = translateY + (560 * currentScale);
    const iconScale = Math.min(1, Math.max(0.76, ((176 * currentScale) - 8) / 143));
    const iconTranslateX = Math.round(wheelGapCenterX - (72 * iconScale));
    const iconTranslateY = Math.round(wheelBottomY - (43 * iconScale));
    appControlIcons.setAttribute(
      'transform',
      `translate(${iconTranslateX} ${iconTranslateY}) scale(${iconScale})`
    );
  };

  const placeAfterBuilderUpdate = () => requestAnimationFrame(placeSmallBikeInAdultViewportArea);
  form.addEventListener('change', placeAfterBuilderUpdate);
  form.addEventListener('reset', () => setTimeout(placeSmallBikeInAdultViewportArea, 0));
  window.addEventListener('pageshow', placeSmallBikeInAdultViewportArea);
  placeSmallBikeInAdultViewportArea();
})();
