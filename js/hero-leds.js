(() => {
  const image = document.getElementById('heroLedOverlay');
  const toggle = document.getElementById('heroMagicToggle');
  if (!image || !toggle) return;

  const animated = 'assets/images/shynetyme-led-overlay.gif';
  const still = 'assets/images/shynetyme-led-overlay-still.webp';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reducedMotion.matches;

  function render() {
    image.src = playing ? animated : still;
    toggle.textContent = playing ? 'Pause LED magic' : 'Play LED magic';
    toggle.setAttribute('aria-pressed', String(!playing));
  }

  toggle.addEventListener('click', () => { playing = !playing; render(); });
  reducedMotion.addEventListener('change', event => { playing = !event.matches; render(); });
  render();
})();
