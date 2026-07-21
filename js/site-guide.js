(() => {
  const button = document.querySelector('.site-guide-button');
  const panel = document.getElementById('siteGuidePanel');
  const close = panel?.querySelector('.site-guide-close');
  const navbar = document.querySelector('.navbar .navbar-nav');

  const builderPages = [
    { href: 'build-my-bike.html', label: "Child's Bicycle" },
    { href: 'build-my-auto.html', label: 'Auto' },
    { href: 'build-my-yacht.html', label: 'Yachts' }
  ];

  document.querySelectorAll('.navbar .nav-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const label = link.textContent.trim();
    if (label === 'Parts' || href.endsWith('#catalog')) {
      link.textContent = 'Catalog';
      link.setAttribute('href', 'catalog.html');
    }
  });

  if (navbar && !navbar.querySelector('.builder-nav-dropdown')) {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const builderHrefs = new Set(builderPages.map((page) => page.href));

    [...navbar.children].forEach((item) => {
      const link = item.matches('a') ? item : item.querySelector('a');
      const href = link?.getAttribute('href')?.split('#')[0];
      if (href && builderHrefs.has(href)) item.remove();
    });

    const activeBuilder = builderPages.some((page) => page.href === currentPage);
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-item dropdown builder-nav-dropdown';
    dropdown.innerHTML = `
      <a class="nav-link dropdown-toggle${activeBuilder ? ' active' : ''}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Builders</a>
      <ul class="dropdown-menu dropdown-menu-dark">
        ${builderPages.map((page) => {
          const active = page.href === currentPage;
          return `<li><a class="dropdown-item${active ? ' active' : ''}" ${active ? 'aria-current="page"' : ''} href="${page.href}">${page.label}</a></li>`;
        }).join('')}
      </ul>`;
    navbar.prepend(dropdown);
  }

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
  const bikePreview = document.getElementById('bikePreview');
  const adultTransform = 'translate(-13 54) scale(1.05)';

  const placeSmallBikeInAdultViewportArea = () => {
    if (!repositionedSizes.has(frameSizeSelect.value) || !bikePreview) return;

    const currentTransform = mainBike.transform.baseVal.consolidate();
    if (!currentTransform) return;

    // Preserve the exact scale assigned by bike-builder.js and measure only the
    // translation needed to occupy the adult bicycle's rendered viewport area.
    const currentScale = currentTransform.matrix.a;
    const currentTranslateX = currentTransform.matrix.e;
    const currentTranslateY = currentTransform.matrix.f;
    const previousTransition = mainBike.style.transition;
    mainBike.style.transition = 'none';

    const currentTransformValue = mainBike.getAttribute('transform');
    mainBike.setAttribute('transform', adultTransform);
    const adultRect = mainBike.getBoundingClientRect();
    mainBike.setAttribute('transform', currentTransformValue);
    const currentRect = mainBike.getBoundingClientRect();

    const svgMatrix = bikePreview.getScreenCTM();
    if (!svgMatrix || !svgMatrix.a || !svgMatrix.d) {
      mainBike.style.transition = previousTransition;
      return;
    }

    const adultCenterX = adultRect.left + (adultRect.width / 2);
    const currentCenterX = currentRect.left + (currentRect.width / 2);
    const translateX = currentTranslateX + ((adultCenterX - currentCenterX) / Math.abs(svgMatrix.a));
    const translateY = currentTranslateY + ((adultRect.top - currentRect.top) / Math.abs(svgMatrix.d));
    mainBike.setAttribute(
      'transform',
      `translate(${translateX.toFixed(3)} ${translateY.toFixed(3)}) scale(${currentScale})`
    );
    mainBike.style.transition = previousTransition;

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
  window.addEventListener('resize', placeAfterBuilderUpdate);
  placeSmallBikeInAdultViewportArea();
})();
