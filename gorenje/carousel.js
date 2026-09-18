(() => {
  const root = document.querySelector('.banner-carousel');
  if (!root) return;
  const viewport = root.querySelector('.banner-slides');
  const track = root.querySelector('.banner-track');
  const originals = [...track.children], count = originals.length;
  const dots = [...root.querySelectorAll('[data-slide]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = count, paused = reduced.matches, hovering = false, timer, moving = false;
  function clone(s) { const c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }
  track.prepend(...originals.map(clone));
  track.append(...originals.map(clone));
  const slides = [...track.children];
  function paint(animate = false) {
    track.style.transition = animate && !reduced.matches ? 'transform 850ms cubic-bezier(.22,.68,.2,1)' : 'none';
    const slide = slides[index];
    const offset = slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
    track.style.transform = 'translateX(' + (-offset) + 'px)';
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index % count)));
    originals.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== index % count)));
  }
  function settle() {
    moving = false;
    if (index < count || index >= count * 2) { index = count + ((index % count) + count) % count; paint(); }
  }
  function go(next) {
    if (moving || next === index) return;
    index = next; moving = !reduced.matches; paint(true);
    if (reduced.matches) settle();
  }
  const stop = () => clearInterval(timer);
  function schedule() {
    stop();
    if (!paused && !hovering && !root.contains(document.activeElement) && !document.hidden)
      timer = setInterval(() => go(index + 1), 5000);
  }
  dots.forEach((d, i) => d.addEventListener('click', () => { go(count + i); schedule(); }));
  track.addEventListener('transitionend', e => { if (e.target === track && e.propertyName === 'transform') settle(); });
  root.addEventListener('mouseenter', () => { hovering = true; stop(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', () => setTimeout(schedule, 0));
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); go(index + (e.key === 'ArrowLeft' ? -1 : 1)); }
  });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { paused = reduced.matches; settle(); paint(); schedule(); });
  new ResizeObserver(() => { settle(); paint(); }).observe(viewport);
  root.querySelector('.banner-controls').hidden = false;
  paint(); schedule();
})();
