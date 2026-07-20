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

/*
 * Build My Bike device parity fixes.
 * This block is intentionally page-scoped so the planner keeps its full LED
 * simulation on phones/tablets and smaller bicycle sizes remain centered.
 */
(() => {
  const form = document.getElementById('bikeBuilderForm');
  const frameSizeSelect = document.getElementById('frameSize');
  const mainBike = document.getElementById('mainBikeGroup');
  const appControlIcons = document.getElementById('appControlIcons');
  const sizeLabel = document.getElementById('sizeLabel');
  if (!form || !frameSizeSelect || !mainBike || !appControlIcons || !sizeLabel) return;

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

  const sizeConfig = {
    toddler: { label: 'Toddler / balance bike', scale: 0.66 },
    preschool: { label: 'Small child / preschool bicycle', scale: 0.75 },
    youth: { label: 'Youth bicycle', scale: 0.85 },
    teen: { label: 'Teen / small-adult bicycle', scale: 0.94 },
    adult: { label: 'Adult Bicycle', scale: 1 }
  };

  const artworkCenterX = 441;
  const artworkCenterY = 280;
  const adultScale = 1.05;
  const adultTranslateY = 54;
  const adultVisualCenterY = adultTranslateY + (artworkCenterY * adultScale);

  const applyPrimaryBikePlacement = () => {
    const config = sizeConfig[frameSizeSelect.value] || sizeConfig.adult;
    const stageScale = Number((config.scale * adultScale).toFixed(4));

    // Keep every size centered on the adult bike's visual center instead of
    // forcing small bikes down to the adult tire baseline where phones clip them.
    const translateX = Math.round(450 - (artworkCenterX * stageScale));
    const translateY = Math.round(adultVisualCenterY - (artworkCenterY * stageScale));
    mainBike.setAttribute('transform', `translate(${translateX} ${translateY}) scale(${stageScale})`);

    // Keep the selected controller icons attached to the repositioned bike.
    const wheelGapCenterX = translateX + (455 * stageScale);
    const wheelBottomY = translateY + (560 * stageScale);
    const iconScale = Math.min(1, Math.max(0.76, ((176 * stageScale) - 8) / 143));
    const iconTranslateX = Math.round(wheelGapCenterX - (72 * iconScale));
    const iconTranslateY = Math.round(wheelBottomY - (43 * iconScale));
    appControlIcons.setAttribute(
      'transform',
      `translate(${iconTranslateX} ${iconTranslateY}) scale(${iconScale})`
    );
    sizeLabel.textContent = config.label;
  };

  const applyAfterBuilderUpdate = () => requestAnimationFrame(applyPrimaryBikePlacement);
  form.addEventListener('change', applyAfterBuilderUpdate);
  form.addEventListener('reset', () => setTimeout(applyPrimaryBikePlacement, 0));
  window.addEventListener('pageshow', applyPrimaryBikePlacement);
  applyPrimaryBikePlacement();
})();
