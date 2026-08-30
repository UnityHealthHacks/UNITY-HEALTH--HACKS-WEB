(() => {
  'use strict';

  const BUILD_ID = 'UHH-WEBSITE-9.5-DEVELOPMENT-2026-08-30';
  const TAXONOMY_VERSION = 'UHH-GOAL-TAXONOMY-2026-08-30-v1';

  const GOALS = [
    {
      id: 'G01_WEIGHT', vectorId: 'G01_WEIGHT',
      label: 'Manage my weight or body composition',
      keywords: ['lose weight','weight loss','body composition','fat loss','waist','healthy weight','gain weight','calorie deficit'],
      freeTitle: 'Weight-management fundamentals', freeHref: 'learn.html',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      limit: 'No specific amount or rate of weight change is promised.'
    },
    {
      id: 'G02_GENERAL_LIFESTYLE', vectorId: 'G02_LIFESTYLE',
      label: 'Improve my everyday habits',
      keywords: ['healthier lifestyle','better habits','get healthier','everyday habits','routine','consistency','eat better','move more','general lifestyle'],
      freeTitle: 'General lifestyle orientation', freeHref: 'start-here.html',
      alternativeId: 'G10_FOOD_INGREDIENT',
      structuredTitle: '30-Day Foundation', structuredHref: '30-day-plan.html',
      limit: 'The 30-Day Foundation is an option, not a required universal starting point.'
    },
    {
      id: 'G03_GUT_MICROBIOME', vectorId: 'G03_GUT',
      label: 'Support my gut and microbiome',
      keywords: ['gut health','microbiome','gut bacteria','probiotic','prebiotic','fermented','fiber variety','dysbiosis'],
      freeTitle: 'Gut and microbiome education', freeHref: 'gut-health.html',
      alternativeId: 'G04_DIGESTIVE_REFLUX',
      limit: 'This route does not diagnose dysbiosis, Candida overgrowth, or a universal need for a reset or probiotic.'
    },
    {
      id: 'G04_DIGESTIVE_REFLUX', vectorId: 'G04_DIGESTIVE',
      label: 'Work on digestive comfort or reflux',
      keywords: ['reflux','heartburn','gerd','indigestion','bloating','constipation','diarrhea','digestive discomfort','bowel changes'],
      freeTitle: 'Digestive and reflux education', freeHref: 'digestive-conditions.html',
      alternativeId: 'G03_GUT_MICROBIOME',
      limit: 'Symptoms are not used to diagnose a cause; alarm features take priority over routine lifestyle routing.'
    },
    {
      id: 'G05_BLOOD_PRESSURE', vectorId: 'G05_BP',
      label: 'Support healthier blood-pressure habits',
      keywords: ['blood pressure','hypertension','systolic','diastolic','bp reading','bp habits'],
      freeTitle: 'Blood-pressure lifestyle and measurement education', freeHref: 'learn.html',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      higherSafety: true,
      limit: 'Lifestyle education does not direct prescription changes; higher-safety paid routing is not available.'
    },
    {
      id: 'G06_LIPIDS_CV_RISK', vectorId: 'G06_LIPIDS',
      label: 'Learn about cholesterol, lipids, and heart-risk habits',
      keywords: ['cholesterol','ldl','hdl','triglyceride','apob','apo b','lp(a)','lipid','statin','cardiovascular risk'],
      freeTitle: 'Lipids and cardiovascular-risk education', freeHref: 'metabolic-health.html',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      higherSafety: true,
      limit: 'This route does not minimize atherogenic cholesterol risk or tell you to change a prescription.'
    },
    {
      id: 'G07_METABOLIC', vectorId: 'G07_METABOLIC',
      label: 'Improve my metabolic-health habits',
      keywords: ['insulin resistance','prediabetes','type 2 diabetes','diabetes','glucose','blood sugar','a1c','metabolic health'],
      freeTitle: 'Metabolic-health fundamentals', freeHref: 'metabolic-health.html',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      higherSafety: true,
      limit: 'Use prevention, improvement, and remission terms precisely; no guaranteed reversal or medication-change instruction.'
    },
    {
      id: 'G08_FASTING_MEAL_TIMING', vectorId: 'G08_FASTING',
      label: 'Learn about fasting and meal timing',
      keywords: ['fasting','intermittent fasting','time restricted','time-restricted','meal timing','eating window','omad','autophagy','prolonged fast'],
      freeTitle: 'Fasting and meal-timing education', freeHref: 'learn.html',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      higherSafety: true,
      limit: 'There is no universal exact hour when meaningful whole-body human autophagy is established to begin.'
    },
    {
      id: 'G09_PARASITE_PET_EXPOSURE', vectorId: 'G09_PARASITE',
      label: 'Learn about parasite or pet-exposure concerns',
      keywords: ['parasite','pinworm','worms','deworm','pet exposure','dog','cat','hookworm','roundworm','giardia','zoonotic'],
      freeTitle: 'Parasite and pet-exposure education', freeHref: 'parasites-candida.html',
      alternativeId: null,
      limit: 'Pet ownership, cravings, or nonspecific symptoms do not prove infection; no universal human deworming protocol is recommended.'
    },
    {
      id: 'G10_FOOD_INGREDIENT', vectorId: 'G10_FOOD',
      label: 'Understand a food, ingredient, or label',
      keywords: ['food label','ingredient','barcode','upc','ean','added sugar','sodium','fiber','additive','compare food','nutrition label'],
      freeTitle: 'Food & Ingredient Tools', freeHref: 'food-checker.html',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      limit: 'A barcode is only an identifier until a verified product database is connected; no diagnosis comes from a food entry.'
    },
    {
      id: 'G11_SLEEP_MOVEMENT_HYDRATION', vectorId: 'G11_HABITS',
      label: 'Work on sleep, movement, hydration, or routines',
      keywords: ['sleep','insomnia','snore','walking','walk more','exercise','movement','strength','hydration','water intake','electrolytes'],
      freeTitle: 'Sleep, movement, hydration, and routine education', freeHref: 'learn.html',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      limit: 'Hydration and electrolyte needs are context-specific; there is no universal gallon, half-body-weight, or salt-water rule.'
    },
    {
      id: 'G12_HELP_ME_CHOOSE', vectorId: 'G12_HELP',
      label: 'I’m not sure where to start',
      keywords: ['not sure','where do i start','help me choose','overwhelmed','don’t know where to start','dont know where to start','better energy','more energy'],
      freeTitle: 'Help Me Choose', freeHref: 'index.html#goal-first',
      alternativeId: 'G02_GENERAL_LIFESTYLE',
      limit: 'Help Me Choose is free and does not diagnose from your answers.'
    },
    {
      id: 'G13_OTHER', vectorId: 'G13_OTHER',
      label: 'Something else', keywords: [],
      freeTitle: 'Help Me Choose', freeHref: 'index.html#goal-first',
      alternativeId: 'G12_HELP_ME_CHOOSE',
      limit: 'Unsupported free text is not turned into an invented diagnosis or product.'
    }
  ];

  const GOAL_BY_ID = Object.fromEntries(GOALS.map((g) => [g.id, g]));
  const SUPPORT_ALIASES = {
    S00_FREE: 'S00_FREE', S0_LEARN: 'S00_FREE', free: 'S00_FREE', learn: 'S00_FREE',
    S01_SELF_GUIDED: 'S01_SELF_GUIDED', S1_SIMPLE: 'S01_SELF_GUIDED', self: 'S01_SELF_GUIDED', simple: 'S01_SELF_GUIDED',
    S02_STRUCTURED: 'S02_STRUCTURED', S2_STRUCTURED: 'S02_STRUCTURED', structured: 'S02_STRUCTURED',
    S03_GUARDIAN_RESEARCH: 'S03_GUARDIAN_RESEARCH', S3_GUARDIAN: 'S03_GUARDIAN_RESEARCH', guardian: 'S03_GUARDIAN_RESEARCH',
    S04_HUMAN: 'S04_HUMAN', S4_HUMAN: 'S04_HUMAN', human: 'S04_HUMAN',
    S05_HIGH_TOUCH: 'S05_HIGH_TOUCH', concierge: 'S05_HIGH_TOUCH', S5_UNSURE: 'S00_FREE', unsure: 'S00_FREE'
  };

  const normalize = (value = '') => String(value).toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const normalizeSupport = (value) => SUPPORT_ALIASES[value] || SUPPORT_ALIASES[String(value || '').trim()] || 'S00_FREE';
  const phraseHit = (text, phrase) => text.includes(phrase);

  function inferGoal(rawText = '') {
    const text = normalize(rawText);
    if (!text) return { goalId: 'G12_HELP_ME_CHOOSE', ambiguous: false, candidates: [] };
    const scored = GOALS.filter((g) => g.id !== 'G13_OTHER').map((goal) => ({
      goal,
      score: goal.keywords.reduce((total, term) => total + (phraseHit(text, term) ? Math.max(1, term.split(' ').length) : 0), 0)
    })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);

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

  function medicationIntercept(rawText = '') {
    const text = normalize(rawText);
    if (!text) return null;
    const action = /\b(stop|discontinue|reduce|taper|lower (?:my |the )?dose|replace|skip|change (?:my |the )?(?:dose|schedule)|come off|quit|stop taking|do i still need|can i get off|should i take less)\b/;
    const medication = /\b(prescription|medication|medicine|med|pill|statin|insulin|metformin|blood pressure (?:medicine|medication|pill)|acid reflux (?:medicine|medication)|diabetes (?:medicine|medication))\b/;
    if (!action.test(text) || !medication.test(text)) return null;
    return {
      type: 'medication', level: 'C', suppressSales: true,
      title: 'Medication decision boundary',
      message: 'Unity Health Hacks can help with lifestyle education, planning, tracking, and questions, but it does not tell you to stop, reduce, skip, replace, or change the schedule of a prescription. Medication decisions depend on why it was prescribed, objective measurements and risk, and appropriate clinician follow-up.'
    };
  }

  function parseBloodPressure(text) {
    const match = text.match(/\b(\d{2,3})\s*\/\s*(\d{2,3})\b/);
    if (!match) return null;
    return { systolic: Number(match[1]), diastolic: Number(match[2]) };
  }

  function safetyOverride(rawText = '', explicitGoalId = '') {
    const text = normalize(rawText);
    if (!text) return null;

    const bp = parseBloodPressure(text);
    const bpContext = explicitGoalId === 'G05_BLOOD_PRESSURE' || /blood pressure|\bbp\b|systolic|diastolic/.test(text);
    const bpSymptoms = /chest pain|shortness of breath|difficulty breathing|back pain|numbness|weakness|vision change|difficulty speaking|trouble speaking/.test(text);
    if (bpContext && /pregnan|pregnancy/.test(text)) {
      return {
        type: 'red-flag', level: 'C', suppressSales: true,
        title: 'Pregnancy-specific blood-pressure guidance',
        message: 'Pregnancy uses different severe-hypertension thresholds and symptom guidance than the ordinary adult blood-pressure rule. Use pregnancy-specific professional guidance rather than a generic UHH blood-pressure program.'
      };
    }
    if (bp && (bp.systolic > 180 || bp.diastolic > 120)) {
      if (bpSymptoms) {
        return {
          type: 'red-flag', level: 'E', suppressSales: true,
          title: 'Emergency blood-pressure safety message',
          message: 'A repeat blood-pressure reading above 180/120 together with concerning symptoms such as chest pain, shortness of breath, weakness, numbness, vision change, back pain, or difficulty speaking can represent a medical emergency. Call 911 or emergency services now. Do not wait for lifestyle changes or change medication on your own.'
        };
      }
      return {
        type: 'red-flag', level: 'U', suppressSales: true,
        title: 'Prompt blood-pressure evaluation',
        message: 'If a repeat blood-pressure reading remains above 180/120 without new emergency symptoms, contact an appropriate healthcare professional promptly. Do not self-adjust blood-pressure medication. General education can continue after the safety step.'
      };
    }
    if (bpContext && /extremely high|very high|severely high/.test(text) && bpSymptoms) {
      return {
        type: 'red-flag', level: 'U', suppressSales: true,
        title: 'Blood-pressure safety check',
        message: 'Very high blood pressure together with concerning symptoms needs prompt assessment. If a repeat reading is above 180/120 and symptoms such as chest pain, shortness of breath, weakness, numbness, vision change, back pain, or difficulty speaking are present, call 911 or emergency services. Do not use a lifestyle plan as a substitute for urgent evaluation.'
      };
    }

    const digestiveContext = explicitGoalId === 'G04_DIGESTIVE_REFLUX' || /reflux|heartburn|gerd|digestive|stomach|swallow|vomit|stool/.test(text);
    const digestiveAlarm = /trouble swallowing|difficulty swallowing|pain(?:ful)? swallowing|persistent vomiting|vomiting blood|coffee[- ]ground|black tarry|bloody stool|blood in (?:my )?stool|unexplained weight loss|losing weight without trying|loss of appetite/.test(text);
    if (digestiveContext && digestiveAlarm) {
      return {
        type: 'red-flag', level: 'U', suppressSales: true,
        title: 'Digestive symptoms need evaluation',
        message: 'Some digestive alarm features warrant appropriate medical evaluation rather than a routine self-guided reflux or gut plan. Unity Health Hacks does not diagnose the cause. General education can remain available after the evaluation guidance.'
      };
    }
    if (digestiveContext && /chest pain/.test(text)) {
      return {
        type: 'red-flag', level: 'U', suppressSales: true,
        title: 'Chest pain should not be assumed to be reflux',
        message: 'Chest pain should not be assumed to come from reflux. Seek appropriate urgent or emergency evaluation based on the severity and circumstances rather than relying on a digestive self-care route.'
      };
    }

    const severeHypo = /(low blood sugar|hypoglyc|glucose).*(unconscious|passed out|fainted|seizure|seizing|confus|cannot treat|can't treat|needs help)|(?:unconscious|passed out|fainted|seizure|seizing|profound confusion).*(low blood sugar|hypoglyc|glucose)/.test(text);
    if (severeHypo) {
      return {
        type: 'red-flag', level: 'E', suppressSales: true,
        title: 'Severe low blood sugar is an emergency',
        message: 'Loss of consciousness, seizure, profound confusion, inability to self-treat, or a severe low-glucose situation requiring another person’s help is an emergency. Follow emergency guidance and any prescribed rescue plan; Unity Health Hacks does not invent medication or glucagon dosing.'
      };
    }

    const dkaContext = /diabetes|blood sugar|glucose|ketone|insulin/.test(text);
    const dkaSignals = /high ketones|fruity breath|rapid breathing|deep breathing|trouble breathing|difficulty breathing|persistent vomiting|can't keep fluids|cannot keep fluids/.test(text);
    if (dkaContext && dkaSignals) {
      return {
        type: 'red-flag', level: 'E', suppressSales: true,
        title: 'Possible diabetes emergency',
        message: 'High ketones, fruity breath, troubled or deep breathing, persistent vomiting, inability to keep fluids down, or a severe diabetes symptom cluster can require emergency evaluation. Do not stop insulin or generate corrective dosing from this tool.'
      };
    }

    const fastingContext = explicitGoalId === 'G08_FASTING_MEAL_TIMING' || /fasting|fast for|intermittent fast|prolonged fast|autophagy/.test(text);
    const glucoseMedication = /insulin|sulfonylurea|meglitinide|glucose[- ]lowering|diabetes (?:medicine|medication)|blood sugar (?:medicine|medication)/.test(text);
    if (fastingContext && glucoseMedication) {
      return {
        type: 'red-flag', level: 'C', suppressSales: true,
        title: 'Fasting needs medication-aware planning',
        message: 'Fasting can raise hypoglycemia, hyperglycemia, dehydration, or other risks for some people using glucose-lowering medication. Use clinician-guided planning rather than a generic fasting schedule, and do not change medication dose or timing through UHH.'
      };
    }
    if (fastingContext && /pregnan|breastfeed|eating disorder|anorexia|bulimia|underweight|frail|acute illness/.test(text)) {
      return {
        type: 'red-flag', level: 'C', suppressSales: true,
        title: 'Fasting is not a routine self-guided route in this context',
        message: 'Pregnancy, breastfeeding, eating-disorder history or current risk, frailty/underweight, acute illness, and some medical contexts can materially change fasting safety. UHH will not issue a routine restrictive fasting plan here.'
      };
    }
    if (/\b(?:48|72|96|120)[- ]?hour (?:fast|fasting)|multi[- ]day fast|prolonged fast(?:ing)? protocol/.test(text)) {
      return {
        type: 'red-flag', level: 'C', suppressSales: true,
        title: 'Prolonged fasting needs a higher-safety review',
        message: 'A prolonged fast should not be treated as a routine general UHH product. Start with education and appropriate safety context rather than an automatic multi-day fasting protocol.'
      };
    }

    const apneaPattern = /(stop breathing|breathing pauses|gasping).*(sleep|snor|exhaust|daytime|tired)|(?:snore|snoring).*(stop breathing|breathing pauses|gasping|exhausted all day|daytime sleepiness)/.test(text);
    if (apneaPattern) {
      return {
        type: 'red-flag', level: 'U', suppressSales: true,
        title: 'Sleep symptoms deserve evaluation',
        message: 'Repeated breathing pauses, gasping, loud snoring with marked daytime sleepiness, or a similar pattern can warrant medical evaluation and discussion of a sleep study. UHH does not diagnose sleep apnea, and ordinary sleep-hygiene tips are not a substitute for evaluation.'
      };
    }

    return null;
  }

  function supportStatus(goal, supportId) {
    if (supportId === 'S00_FREE') return { state: 'AVAILABLE_FREE', text: 'Free/open education is available. No payment is required.' };
    if (supportId === 'S01_SELF_GUIDED') return { state: 'AVAILABLE_SELF_GUIDED', text: 'A self-guided educational route is available without live human support.' };
    if (supportId === 'S02_STRUCTURED') {
      if (goal.id === 'G02_GENERAL_LIFESTYLE') return { state: 'AVAILABLE_SELF_GUIDED', text: 'The 30-Day Foundation is available as a general-lifestyle structured option. It is not a universal required start.' };
      return { state: goal.higherSafety ? 'SAFETY_REVIEW_REQUIRED' : 'COMING_LATER', text: goal.higherSafety ? 'A paid/structured higher-safety route is not available. Use the safe free educational path while higher-safety release gates remain open.' : 'A goal-specific structured program is not yet complete. Use the available free/self-guided route instead.' };
    }
    if (supportId === 'S03_GUARDIAN_RESEARCH') return { state: 'PROTOTYPE_ONLY', text: 'Guardian is a local rule-based development prototype. No live AI service or AI billing is connected.' };
    if (supportId === 'S04_HUMAN') return { state: 'COMING_LATER', text: 'Human support is not currently offered as a live purchasable service. Scheduling, scope, privacy, legal, records, and payment gates remain required.' };
    return { state: 'COMING_LATER', text: 'High-touch coordination is a future capability and is not currently available or for sale.' };
  }

  function resolve(input = {}) {
    const freeText = String(input.freeText || input.goalText || '').slice(0, 500);
    let explicitGoalId = GOAL_BY_ID[input.goalId] ? input.goalId : '';
    const supportId = normalizeSupport(input.supportId || input.support);

    const safety = safetyOverride(freeText, explicitGoalId);
    if (safety) {
      const inferred = explicitGoalId || inferGoal(freeText).goalId;
      const goal = GOAL_BY_ID[inferred] || GOAL_BY_ID.G12_HELP_ME_CHOOSE;
      return {
        kind: 'safety', buildId: BUILD_ID, taxonomyVersion: TAXONOMY_VERSION,
        goalId: goal.id, routeId: goal.vectorId, goalLabel: goal.label,
        supportId, safetyIntercept: safety.type, safetyLevel: safety.level,
        title: safety.title, message: safety.message,
        startFree: { title: goal.freeTitle, href: goal.freeHref },
        pricingState: 'UNAVAILABLE', changeGoal: true, noDiagnosis: true, suppressSales: true
      };
    }

    const medication = medicationIntercept(freeText);
    if (medication) {
      const inferred = explicitGoalId || inferGoal(freeText).goalId;
      const goal = GOAL_BY_ID[inferred] || GOAL_BY_ID.G12_HELP_ME_CHOOSE;
      return {
        kind: 'medication', buildId: BUILD_ID, taxonomyVersion: TAXONOMY_VERSION,
        goalId: goal.id, routeId: goal.vectorId, goalLabel: goal.label,
        supportId, safetyIntercept: medication.type, safetyLevel: medication.level,
        title: medication.title, message: medication.message,
        startFree: { title: goal.freeTitle, href: goal.freeHref },
        pricingState: 'UNAVAILABLE', changeGoal: true, noDiagnosis: true, suppressSales: true
      };
    }

    if (explicitGoalId === 'G13_OTHER') explicitGoalId = '';
    const inferred = explicitGoalId ? { goalId: explicitGoalId, ambiguous: false, candidates: [explicitGoalId] } : inferGoal(freeText);
    if (inferred.ambiguous) {
      return {
        kind: 'clarification', buildId: BUILD_ID, taxonomyVersion: TAXONOMY_VERSION,
        goalId: 'G12_HELP_ME_CHOOSE', routeId: 'G12_HELP', supportId,
        safetyIntercept: 'clarification', candidates: inferred.candidates.map((id) => ({ id, label: GOAL_BY_ID[id].label })),
        title: 'One quick clarification',
        message: 'Your wording fits more than one supported goal. Choose the one you want to make primary rather than having UHH guess or medicalize the request.',
        startFree: { title: 'Help Me Choose', href: 'index.html#goal-first' },
        pricingState: 'FREE', changeGoal: true, noDiagnosis: true, suppressSales: false
      };
    }

    const goal = GOAL_BY_ID[inferred.goalId] || GOAL_BY_ID.G12_HELP_ME_CHOOSE;
    const availability = supportStatus(goal, supportId);
    const alternativeGoal = goal.alternativeId ? GOAL_BY_ID[goal.alternativeId] : null;
    const structured = supportId === 'S02_STRUCTURED' && goal.structuredHref ? { title: goal.structuredTitle, href: goal.structuredHref } : null;
    const reason = explicitGoalId
      ? `You selected “${goal.label}.” Your requested support level changes how much structure is shown, not which health goal is treated as relevant.`
      : `Your words most closely match “${goal.label}.” This is a deterministic educational route, not a diagnosis.`;

    return {
      kind: 'route', buildId: BUILD_ID, taxonomyVersion: TAXONOMY_VERSION,
      goalId: goal.id, routeId: goal.vectorId, goalLabel: goal.label,
      supportId, availabilityState: availability.state, availabilityText: availability.text,
      primary: structured || { title: goal.freeTitle, href: goal.freeHref },
      alternative: alternativeGoal ? { goalId: alternativeGoal.id, routeId: alternativeGoal.vectorId, title: alternativeGoal.freeTitle, href: alternativeGoal.freeHref } : null,
      startFree: { title: goal.freeTitle, href: goal.freeHref },
      reasonText: reason, limitText: goal.limit,
      pricingState: availability.state === 'AVAILABLE_FREE' || availability.state === 'AVAILABLE_SELF_GUIDED' ? 'FREE' : 'UNAVAILABLE',
      safetyIntercept: 'none', changeGoal: true, noDiagnosis: true, suppressSales: false
    };
  }

  window.UHHGoalRouting = Object.freeze({
    BUILD_ID, TAXONOMY_VERSION, GOALS: Object.freeze(GOALS.map((g) => Object.freeze({ ...g }))),
    resolve, inferGoal, medicationIntercept, safetyOverride, normalizeSupport
  });
})();
