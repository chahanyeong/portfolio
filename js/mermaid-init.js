window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.mermaid === 'undefined') {
    console.warn('[mermaid-init] Mermaid CDN not loaded');
    return;
  }
  window.mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
      fontFamily: "'Pretendard', sans-serif",
      primaryColor: '#FFE1CD',
      primaryTextColor: '#2A2118',
      primaryBorderColor: '#FF6F0F',
      lineColor: '#946A47',
      secondaryColor: '#FAF4EC',
      tertiaryColor: '#FFF8F2',
    },
    flowchart: { useMaxWidth: true, htmlLabels: true },
  });

  // Before/After toggle
  const toggleBtns = document.querySelectorAll('.ba-toggle__btn');
  const diagrams = document.querySelectorAll('.ba-diagram');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.state;
      toggleBtns.forEach((b) => {
        const active = b.dataset.state === target;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      diagrams.forEach((d) => {
        d.classList.toggle('is-active', d.dataset.state === target);
      });
    });
  });
});
