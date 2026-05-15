window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.mermaid === 'undefined') {
    console.warn('[mermaid-init] Mermaid CDN not loaded');
    return;
  }
  window.mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
      fontFamily: "'Inter', 'Pretendard', sans-serif",
      primaryColor: '#E1EEFB',
      primaryTextColor: '#1D1D1F',
      primaryBorderColor: '#0071E3',
      lineColor: '#86868B',
      secondaryColor: '#F5F5F7',
      tertiaryColor: '#FBFBFD',
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
