(() => {
  'use strict';

  function boot() {
    const engine = window.UHHGoalRouting;
    const form = document.getElementById('guardianForm');
    const question = document.getElementById('guardianQuestion');
    const answer = document.getElementById('guardianAnswer');
    const status = document.getElementById('guardianStatus');
    if (!engine || !engine.canonicalize || !form || !question || !answer) return;

    function renderGuard(result) {
      answer.replaceChildren();
      const notice = document.createElement('div');
      notice.className = result.kind === 'boundary' ? 'notice' : 'notice warning';
      const strong = document.createElement('strong');
      strong.textContent = `${result.title}: `;
      notice.append(strong, document.createTextNode(result.message));
      answer.append(notice);

      if (result.startFree?.href) {
        const p = document.createElement('p');
        p.textContent = result.kind === 'boundary' ? 'Supported general education can remain available without inventing a diagnosis or prescription.' : 'After the safety boundary, general education can remain available where appropriate.';
        const a = document.createElement('a');
        a.className = 'btn btn-secondary';
        a.href = result.startFree.href;
        a.textContent = `Open ${result.startFree.title}`;
        answer.append(p, a);
      }

      const meta = document.createElement('p');
      meta.className = 'small';
      meta.textContent = `${result.kind === 'boundary' ? 'Scope boundary' : `Safety precedence: ${result.safetyLevel || 'C'}`} · Route: ${result.routeId} · ${result.taxonomyVersion}. No diagnosis and no checkout.`;
      answer.append(meta);
      if (status) status.textContent = result.kind === 'boundary' ? 'Guardian applied the required educational scope boundary.' : 'Guardian applied the required safety boundary before ordinary routing.';
      answer.focus({ preventScroll: true });
      answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.addEventListener('submit', (event) => {
      const raw = question.value.trim();
      if (!raw) return;
      const result = engine.resolve({ freeText: raw, supportId: 'S00_FREE' });
      if (!['safety', 'medication', 'boundary'].includes(result.kind)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      renderGuard(result);
    }, true);
  }

  function failClosed() {
    const form = document.getElementById('guardianForm');
    const answer = document.getElementById('guardianAnswer');
    const status = document.getElementById('guardianStatus');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
      form.querySelectorAll('button[type="submit"],input[type="submit"]').forEach((control) => {
        control.disabled = true;
        control.setAttribute('aria-disabled', 'true');
      });
    }
    if (answer) {
      answer.replaceChildren();
      const notice = document.createElement('div');
      notice.className = 'notice warning';
      const strong = document.createElement('strong');
      strong.textContent = 'Safety layer unavailable: ';
      notice.append(strong, document.createTextNode('Guardian Lab did not load the required UHH safety-routing refinement. No Guardian response was generated. Reload the page before trying again.'));
      answer.append(notice);
    }
    if (status) status.textContent = 'Guardian safety layer did not load. No response was generated.';
  }

  if (!window.UHHGoalRouting) {
    failClosed();
    return;
  }
  if (window.UHHGoalRouting.canonicalize) {
    boot();
    return;
  }
  const script = document.createElement('script');
  script.src = 'assets/goal-routing-refinement.js?v=20260830-95-4';
  script.onload = () => window.UHHGoalRouting?.canonicalize ? boot() : failClosed();
  script.onerror = failClosed;
  document.head.appendChild(script);
})();
