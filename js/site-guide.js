(() => {
  const navbar = document.querySelector('.navbar .navbar-nav');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  /* REMOVE REQUEST ANCHOR MODIFICATION */

  /* KEEP NAV CLEAN */
  document.querySelectorAll('a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const label = link.textContent.trim();

    if (label === 'Effects' || href.includes('#effects')) {
      link.remove();
      return;
    }

    if (label === 'Request Install' || href.includes('#request')) {
      link.setAttribute('href','contact.html');
    }
  });

  /* REMOVE ANY OLD PAGE LOCATION BAR */
  const oldBar = document.querySelector('.page-location-bar');
  if (oldBar) oldBar.remove();
})();