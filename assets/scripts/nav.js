(() => {
  const menuRoot = document.querySelector('[data-menu="analysis"]');
  if (!menuRoot) {
    return;
  }

  const trigger = menuRoot.querySelector('.product-nav-trigger');
  if (!trigger) {
    return;
  }

  function setOpen(open) {
    menuRoot.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  }

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!menuRoot.classList.contains('is-open'));
  });

  menuRoot.addEventListener('mouseenter', () => {
    setOpen(true);
  });

  menuRoot.addEventListener('mouseleave', () => {
    setOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (!menuRoot.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });
})();

