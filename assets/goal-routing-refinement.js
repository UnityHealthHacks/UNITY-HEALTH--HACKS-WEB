(() => {
  'use strict';
  const base = window.UHHGoalRouting;
  if (!base) return;

  function canonicalize(raw = '') {
    let text = String(raw).slice(0, 500);
    text = text.replace(/blood[- ]pressure/gi, 'blood pressure');
    text = text.replace(/\blose\s+(?:about\s+|some\s+|\d+\s+)?pounds?\b/gi, (m) => `${m} weight loss`);
    text = text.replace(/\bgut help\b/gi, 'gut health');
    text = text.replace(/\bstomach is bad\b/gi, 'digestive discomfort');
    text = text.replace(/\b(?:i )?(?:do not|don't|dont) know where to start\b/gi, 'help me choose where do i start');
    return text;
  }

  function inferGoal(raw = '') {
    const text = canonicalize(raw).toLowerCase();
    const hasWeight = /weight|pounds?|body composition|fat loss/.test(text);
    const hasMetabolic = /blood sugar|glucose|a1c|prediabet|diabet|metabolic/.test(text);
    const hasFasting = /fasting|intermittent fast|meal timing|autophagy|eating window|omad/.test(text);
    const hasBP = /blood pressure|hypertension|\bbp\b/.test(text);
    const hasGut = /gut|microbiome/.test(text);
    const hasDigestive = /stomach|digestive|reflux|heartburn|gerd|bloat|bowel/.test(text);

    if (hasWeight && hasMetabolic) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G01_WEIGHT', 'G07_METABOLIC'] };
    if (hasWeight && hasFasting) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G01_WEIGHT', 'G08_FASTING_MEAL_TIMING'] };
    if (hasFasting && hasBP) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G08_FASTING_MEAL_TIMING', 'G05_BLOOD_PRESSURE'] };
    if (hasGut && hasDigestive) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G03_GUT_MICROBIOME', 'G04_DIGESTIVE_REFLUX'] };
    if (/\b(?:better|more) energy\b/.test(text) && !hasMetabolic && !hasFasting) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: false, candidates: ['G12_HELP_ME_CHOOSE'] };
    return base.inferGoal(text);
  }

  function dehydrationSafety(raw = '') {
    const text = canonicalize(raw).toLowerCase();
    const dehydration = /severe dehydration|significant dehydration|cannot keep fluids|can't keep fluids|unable to keep fluids/.test(text);
    const gi = /vomit|diarrhea|gastro|stomach|digestive/.test(text);
    if (!dehydration || !gi) return null;
    return {
      kind: 'safety', buildId: base.BUILD_ID, taxonomyVersion: base.TAXONOMY_VERSION,
      goalId: 'G04_DIGESTIVE_REFLUX', routeId: 'G04_DIGESTIVE', goalLabel: 'Work on digestive comfort or reflux',
      supportId: 'S00_FREE', safetyIntercept: 'red-flag', safetyLevel: 'U',
      title: 'Severe dehydration needs evaluation',
      message: 'Significant dehydration or inability to keep fluids down in a severe gastrointestinal illness can require prompt medical evaluation. UHH does not diagnose the cause, and a routine lifestyle or sales route should not come first.',
      startFree: { title: 'Digestive and reflux education', href: 'digestive-conditions.html' },
      pricingState: 'UNAVAILABLE', changeGoal: true, noDiagnosis: true, suppressSales: true
    };
  }

  function clarificationResult(found, supportId) {
    const labels = Object.fromEntries(base.GOALS.map((goal) => [goal.id, goal.label]));
    return {
      kind: 'clarification', buildId: base.BUILD_ID, taxonomyVersion: base.TAXONOMY_VERSION,
      goalId: 'G12_HELP_ME_CHOOSE', routeId: 'G12_HELP', supportId: base.normalizeSupport(supportId),
      safetyIntercept: 'clarification',
      candidates: found.candidates.map((id) => ({ id, label: labels[id] || id })),
      title: 'One quick clarification',
      message: 'Your wording fits more than one supported goal. Choose the one you want to make primary rather than having UHH guess or medicalize the request.',
      startFree: { title: 'Help Me Choose', href: 'index.html#goal-first' },
      pricingState: 'FREE', changeGoal: true, noDiagnosis: true, suppressSales: false
    };
  }

  function resolve(input = {}) {
    const originalText = String(input.freeText || input.goalText || '').slice(0, 500);
    const freeText = canonicalize(originalText);
    const customSafety = dehydrationSafety(freeText);
    if (customSafety) return { ...customSafety, supportId: base.normalizeSupport(input.supportId || input.support) };

    const explicitGoalId = input.goalId || '';
    if (!explicitGoalId || explicitGoalId === 'G13_OTHER') {
      const found = inferGoal(freeText);
      if (found.ambiguous) return clarificationResult(found, input.supportId || input.support);
      const routed = base.resolve({ ...input, goalId: found.goalId, freeText });
      if (routed.kind === 'route' && originalText.trim()) {
        routed.reasonText = `Your words most closely match “${routed.goalLabel}.” This is deterministic educational routing, not a diagnosis.`;
      }
      return routed;
    }
    return base.resolve({ ...input, freeText });
  }

  window.UHHGoalRouting = Object.freeze({
    ...base,
    canonicalize,
    inferGoal,
    resolve
  });
})();
