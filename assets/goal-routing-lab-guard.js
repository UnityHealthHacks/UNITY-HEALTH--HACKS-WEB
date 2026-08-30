(() => {
  'use strict';

  function boot() {
    const engine = window.UHHGoalRouting;
    const form = document.getElementById('guardianForm');
    const question = document.getElementById('guardianQuestion');
    const answer = document.getElementById('guardianAnswer');
    const status = document.getElementById('guardianStatus');
    if (!engine || !form || !question || !answer) return;

    function renderGuard(result) {
      answer.replaceChildren();
      const notice = document.createElement('div');
      notice.className = 'notice warning';
      const strong = document.createElement('strong');
      strong.textContent = `${result.title}: `;
      notice.append(strong, document.createTextNode(result.message));
      answer.append(notice);

      if (result.startFree?.href) {
        const p = document.createElement('p');
        p.textContent = 'After the safety boundary, general education can remain available where appropriate.';
        const a = document.createElement('a');
        a.className = 'btn btn-secondary';
        a.href = result.startFree.href;
        a.textContent = `Open ${result.startFree.title}`;
        answer.append(p, a);
      }

      const meta = document.createElement('p');
      meta.className = 'small';
      meta.textContent = `Safety precedence: ${result.safetyLevel || 'C'} · Route: ${result.routeId} · ${result.taxonomyVersion}. No diagnosis and no checkout.`;
      answer.append(meta);
      if (status) status.textContent = 'Guardian applied the required safety boundary before ordinary routing.';
      answer.focus({ preventScroll: true });
      answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.addEventListener('submit', (event) => {
      const raw = question.value.trim();
      if (!raw) return;
      const result = engine.resolve({ freeText: raw, supportId: 'S00_FREE' });
      if (result.kind !== 'safety' && result.kind !== 'medication') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      renderGuard(result);
    }, true);
  }

  if (!window.UHHGoalRouting) return;
  if (window.UHHGoalRouting.canonicalize) {
    boot();
    return;
  }
  const script = document.createElement('script');
  script.src = 'assets/goal-routing-refinement.js?v=20260830-95-2';
  script.onload = boot;
  script.onerror = boot;
  document.head.appendChild(script);
})();
