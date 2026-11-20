document.addEventListener('DOMContentLoaded', () => {
  const hamburgerButton = document.getElementById('hamburger-btn');
  const navigationMenu = document.getElementById('nav-menu');

  if (!hamburgerButton || !navigationMenu) {
    return;
  }

  hamburgerButton.addEventListener('click', () => {
    const isActive = navigationMenu.classList.toggle('active');
    hamburgerButton.setAttribute('aria-expanded', String(isActive));
  });
});
