(() => {
  'use strict';
  const base = window.UHHGoalRouting;
  if (!base) return;

  function canonicalize(raw = '') {
    let text = String(raw).slice(0, 500).replace(/[’‘]/g, "'");
    text = text.replace(/blood[- ]pressure/gi, 'blood pressure');
    text = text.replace(/\blose\s+(?:about\s+|some\s+|\d+\s+)?pounds?\b/gi, (m) => `${m} weight loss`);
    text = text.replace(/\blose\s+(?:about\s+|some\s+|\d+\s+)?weight\b/gi, (m) => `${m} weight loss`);
    text = text.replace(/\bgut help\b/gi, 'gut health');
    text = text.replace(/\bstomach is bad\b/gi, 'digestive discomfort');
    text = text.replace(/\b(?:i )?(?:do not|don't|dont) know where to start\b/gi, 'help me choose where do i start');
    if (/\bfast\b/i.test(text)) text += ' fasting';
    if (/\b(?:inactive|moving more|start moving|physical activity)\b/i.test(text)) text += ' movement';
    if (/\bsalt\b/i.test(text) && /\bwater\b/i.test(text)) text += ' hydration';
    return text;
  }

  const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function phraseHit(text, phrase) {
    if (/^[a-z0-9]+$/i.test(phrase) && phrase.length <= 3) {
      return new RegExp(`(?:^|[^a-z0-9])${escapeRegex(phrase)}(?:[^a-z0-9]|$)`, 'i').test(text);
    }
    return text.includes(phrase);
  }

  function scoredInfer(text) {
    const scored = base.GOALS.filter((goal) => goal.id !== 'G13_OTHER').map((goal) => ({
      goal,
      score: goal.keywords.reduce((total, term) => total + (phraseHit(text, term) ? Math.max(1, term.split(' ').length) : 0), 0)
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    if (!scored.length) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: false, candidates: [] };
    const top = scored[0];
    const second = scored[1];
    const ambiguous = Boolean(second && second.score >= top.score && top.goal.id !== 'G12_HELP_ME_CHOOSE');
    return {
      goalId: ambiguous ? 'G12_HELP_ME_CHOOSE' : top.goal.id,
      ambiguous,
      candidates: ambiguous ? [top.goal.id, second.goal.id] : [top.goal.id]
    };
  }

  function inferGoal(raw = '') {
    const text = canonicalize(raw).toLowerCase();
    const hasWeight = /\bweight\b|\bpounds?\b|body composition|fat loss/.test(text);
    const hasMetabolic = /blood sugar|glucose|a1c|prediabet|diabet|metabolic|\binsulin\b/.test(text);
    const hasFasting = /\bfast\b|fasting|intermittent fast|meal timing|autophagy|eating window|omad/.test(text);
    const hasBP = /blood pressure|hypertension|\bbp\b/.test(text);
    const hasGut = /\bgut\b|microbiome/.test(text);
    const hasDigestive = /stomach|digestive|reflux|heartburn|gerd|bloat|bowel/.test(text);
    const hasLipids = /cholesterol|\bldl\b|\bhdl\b|triglyceride|apob|apo b|lp\(a\)|lipid|statin|cardiovascular risk/.test(text);
    if (hasWeight && hasMetabolic) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G01_WEIGHT', 'G07_METABOLIC'] };
    if (hasWeight && hasFasting) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G01_WEIGHT', 'G08_FASTING_MEAL_TIMING'] };
    if (hasFasting && hasBP) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G08_FASTING_MEAL_TIMING', 'G05_BLOOD_PRESSURE'] };
    if (hasGut && hasDigestive) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: true, candidates: ['G03_GUT_MICROBIOME', 'G04_DIGESTIVE_REFLUX'] };
    if (/\b(?:better|more) energy\b/.test(text) && !hasMetabolic && !hasFasting) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: false, candidates: ['G12_HELP_ME_CHOOSE'] };
    if (hasLipids && !hasWeight && !hasMetabolic && !hasFasting && !hasBP && !hasGut && !hasDigestive) return { goalId: 'G06_LIPIDS_CV_RISK', ambiguous: false, candidates: ['G06_LIPIDS_CV_RISK'] };
    if (hasMetabolic && !hasWeight && !hasFasting && !hasBP && !hasGut && !hasDigestive && !hasLipids) return { goalId: 'G07_METABOLIC', ambiguous: false, candidates: ['G07_METABOLIC'] };
    return scoredInfer(text);
  }

  function boundaryResult(message) {
    return {
      kind: 'boundary', buildId: base.BUILD_ID, taxonomyVersion: base.TAXONOMY_VERSION,
      goalId: 'G12_HELP_ME_CHOOSE', routeId: 'UNSUPPORTED', goalLabel: 'Outside current UHH supported route set',
      supportId: 'S00_FREE', safetyIntercept: 'none',
      title: 'Educational boundary', message,
      startFree: { title: 'Evidence and safety information', href: 'evidence.html' },
      pricingState: 'FREE', changeGoal: true, noDiagnosis: true, suppressSales: true
    };
  }

  function unsupportedBoundary(raw = '') {
    const text = canonicalize(raw).toLowerCase();
    if (/diagnose (?:me|what|which)|what disease do i have|tell me what disease|diagnose my symptoms/.test(text)) {
      return boundaryResult('Unity Health Hacks does not diagnose a disease from symptoms or route text. It can provide general education and help organize questions or evaluation preparation without assigning a diagnosis.');
    }
    if (/which prescription (?:should|do) i take|tell me (?:exactly )?(?:which|what) prescription|prescribe (?:me|a)|what medication should i take|which medication should i take/.test(text)) {
      return boundaryResult('Unity Health Hacks does not choose or prescribe a prescription medication. It can provide general education about a medication topic and help organize questions for an appropriate qualified clinician.');
    }
    return null;
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

  function severeLowGlucoseSafety(raw = '') {
    const text = canonicalize(raw).toLowerCase();
    const lowGlucose = /low (?:blood sugar|glucose)|(?:blood sugar|glucose)(?: is| feels)? low/.test(text);
    const severe = /unconscious|passed out|fainted|seizure|seizing|profound confusion|confus|cannot treat|can't treat|needs help/.test(text);
    if (!lowGlucose || !severe) return null;
    return {
      kind: 'safety', buildId: base.BUILD_ID, taxonomyVersion: base.TAXONOMY_VERSION,
      goalId: 'G07_METABOLIC', routeId: 'G07_METABOLIC', goalLabel: 'Improve my metabolic-health habits',
      supportId: 'S00_FREE', safetyIntercept: 'red-flag', safetyLevel: 'E',
      title: 'Severe low blood sugar is an emergency',
      message: 'Loss of consciousness, seizure, profound confusion, inability to self-treat, or a severe low-glucose situation requiring another person’s help is an emergency. Follow emergency guidance and any prescribed rescue plan; Unity Health Hacks does not invent medication or glucagon dosing.',
      startFree: { title: 'Metabolic-health fundamentals', href: 'metabolic-health.html' },
      pricingState: 'UNAVAILABLE', changeGoal: true, noDiagnosis: true, suppressSales: true
    };
  }

  function clarificationResult(found, supportId) {
    const labels = Object.fromEntries(base.GOALS.map((goal) => [goal.id, goal.label]));
    return {
      kind: 'clarification', buildId: base.BUILD_ID, taxonomyVersion: base.TAXONOMY_VERSION,
      goalId: 'G12_HELP_ME_CHOOSE', routeId: 'G12_HELP', supportId: base.normalizeSupport(supportId),
      safetyIntercept: 'clarification', candidates: found.candidates.map((id) => ({ id, label: labels[id] || id })),
      title: 'One quick clarification',
      message: 'Your wording fits more than one supported goal. Choose the one you want to make primary rather than having UHH guess or medicalize the request.',
      startFree: { title: 'Help Me Choose', href: 'index.html#goal-first' },
      pricingState: 'FREE', changeGoal: true, noDiagnosis: true, suppressSales: false
    };
  }

  function resolve(input = {}) {
    const originalText = String(input.freeText || input.goalText || '').slice(0, 500);
    const freeText = canonicalize(originalText);
    const boundary = unsupportedBoundary(freeText);
    if (boundary) return { ...boundary, supportId: base.normalizeSupport(input.supportId || input.support) };
    const lowGlucose = severeLowGlucoseSafety(freeText);
    if (lowGlucose) return { ...lowGlucose, supportId: base.normalizeSupport(input.supportId || input.support) };
    const customSafety = dehydrationSafety(freeText);
    if (customSafety) return { ...customSafety, supportId: base.normalizeSupport(input.supportId || input.support) };

    const explicitGoalId = input.goalId || '';
    let routed;
    if (!explicitGoalId || explicitGoalId === 'G13_OTHER') {
      const found = inferGoal(freeText);
      if (found.ambiguous) return clarificationResult(found, input.supportId || input.support);
      routed = base.resolve({ ...input, goalId: found.goalId, freeText });
      if (routed.kind === 'route' && originalText.trim()) routed.reasonText = `Your words most closely match “${routed.goalLabel}.” This is deterministic educational routing, not a diagnosis.`;
    } else {
      routed = base.resolve({ ...input, freeText });
    }
    if (routed.kind === 'route' && /guarantee.*(?:weight|pounds?)|(?:weight|pounds?).*guarantee/.test(freeText.toLowerCase())) {
      routed.limitText = 'UHH cannot guarantee a specific amount or deadline for weight change. Individual outcomes vary, and the route remains educational.';
    }
    return routed;
  }

  window.UHHGoalRouting = Object.freeze({ ...base, canonicalize, inferGoal, unsupportedBoundary, severeLowGlucoseSafety, resolve });
})();
