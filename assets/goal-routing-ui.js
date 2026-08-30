(() => {
  'use strict';

  function boot() {
    const engine = window.UHHGoalRouting;
    if (!engine) return;

    const text = (tag, value, className = '') => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      node.textContent = value;
      return node;
    };

    function linkButton(label, href, primary = false) {
      const a = document.createElement('a');
      a.className = `btn ${primary ? 'btn-primary' : 'btn-secondary'}`;
      a.href = href;
      a.textContent = label;
      return a;
    }

    function resetGoal(form, container) {
      form.reset();
      container.replaceChildren(text('p', 'Choose a goal and UHH will show a fresh educational route.', 'small'));
      form.querySelector('input[name="uhhGoal"]')?.focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderResult(container, result, form) {
      container.replaceChildren();
      const status = document.createElement('div');
      status.className = result.kind === 'safety' || result.kind === 'medication' ? 'notice warning' : 'notice success';
      status.append(text('strong', result.title || result.goalLabel || 'Your route'));
      if (result.message) status.append(document.createTextNode(` ${result.message}`));
      container.append(status);

      if (result.kind === 'clarification') {
        if (result.message) container.append(text('p', result.message));
        if (result.candidates?.length) {
          const ul = document.createElement('ul');
          ul.className = 'clean';
          result.candidates.forEach((candidate) => ul.append(text('li', candidate.label)));
          container.append(ul);
        }
        const actions = document.createElement('div');
        actions.className = 'actions';
        actions.append(linkButton('Start Free: Help Me Choose', result.startFree.href, true));
        const change = text('button', 'Change My Goal', 'btn btn-secondary');
        change.type = 'button';
        change.addEventListener('click', () => resetGoal(form, container));
        actions.append(change);
        container.append(actions);
        return;
      }

      const summary = document.createElement('article');
      summary.className = 'card';
      summary.append(text('p', `Goal route: ${result.goalLabel}`));
      if (result.reasonText) summary.append(text('p', result.reasonText));
      if (result.availabilityText) summary.append(text('p', result.availabilityText));
      if (result.limitText) {
        const limit = document.createElement('p');
        limit.append(text('strong', 'Important limit: '), document.createTextNode(result.limitText));
        summary.append(limit);
      }
      summary.append(text('p', `Route ID: ${result.routeId} · Taxonomy: ${result.taxonomyVersion}`, 'small'));
      container.append(summary);

      const actions = document.createElement('div');
      actions.className = 'actions';
      if (result.kind === 'route' && result.primary?.href) actions.append(linkButton(result.primary.title, result.primary.href, true));
      if (result.startFree?.href && (!result.primary || result.startFree.href !== result.primary.href || result.kind !== 'route')) {
        actions.append(linkButton(`Start Free: ${result.startFree.title}`, result.startFree.href, result.kind !== 'route'));
      }
      if (result.alternative?.href) actions.append(linkButton(`Alternative: ${result.alternative.title}`, result.alternative.href, false));
      const change = text('button', 'Change My Goal', 'btn btn-secondary');
      change.type = 'button';
      change.addEventListener('click', () => resetGoal(form, container));
      actions.append(change);
      container.append(actions);
    }

    function saveMinimalProfile(form, result) {
      if (form.dataset.saveProfile !== 'true') return true;
      const name = form.querySelector('[data-routing-name]')?.value.trim().slice(0, 40) || '';
      const profile = { name, goalId: result.goalId, routeId: result.routeId, supportId: result.supportId, taxonomyVersion: result.taxonomyVersion };
      try {
        localStorage.setItem('uhhGuardianProfile', JSON.stringify(profile));
        return true;
      } catch {
        return false;
      }
    }

    document.querySelectorAll('[data-goal-routing-form]').forEach((form) => {
      const resultBox = document.querySelector(form.dataset.resultTarget || '[data-goal-routing-result]');
      const status = form.querySelector('[data-routing-status]');
      if (!resultBox) return;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const selected = form.querySelector('input[name="uhhGoal"]:checked');
        const freeText = form.querySelector('[data-goal-text]')?.value.trim().slice(0, 500) || '';
        const support = form.querySelector('[data-support]')?.value || 'S00_FREE';
        if (!selected && !freeText) {
          if (status) status.textContent = 'Choose a goal or describe what you want to accomplish.';
          form.querySelector('input[name="uhhGoal"]')?.focus();
          return;
        }
        if (status) status.textContent = '';
        const result = engine.resolve({ goalId: selected?.value || '', freeText, supportId: support });
        const saved = saveMinimalProfile(form, result);
        renderResult(resultBox, result, form);
        if (!saved) {
          const warning = document.createElement('div');
          warning.className = 'notice warning';
          warning.textContent = 'This browser blocked local storage. Your routing result is still shown, but UHH did not confirm it was saved on this device.';
          resultBox.prepend(warning);
        }
        resultBox.focus({ preventScroll: true });
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
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
