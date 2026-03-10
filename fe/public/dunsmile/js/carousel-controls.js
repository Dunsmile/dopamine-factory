(() => {
  function updateDots(section, activeIndex) {
    const dots = section.querySelectorAll('[data-carousel-dot]');
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  }

  function nearestCardIndex(track, cards) {
    const base = track.getBoundingClientRect().left;
    let winner = 0;
    let minDist = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const dist = Math.abs(card.getBoundingClientRect().left - base);
      if (dist < minDist) {
        minDist = dist;
        winner = index;
      }
    });
    return winner;
  }

  function initSection(section) {
    const track = section.querySelector('.svc-related-carousel');
    const cards = Array.from(section.querySelectorAll('.svc-related-card'));
    const dots = Array.from(section.querySelectorAll('[data-carousel-dot]'));
    if (!track || cards.length === 0 || dots.length === 0) return;

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.getAttribute('data-carousel-dot') || '0');
        const target = cards[index];
        if (!target) return;
        track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
        updateDots(section, index);
      });
    });

    const onScroll = () => updateDots(section, nearestCardIndex(track, cards));
    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initAll() {
    document.querySelectorAll('.svc-related-section').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
