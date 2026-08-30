(() => {
  'use strict';
  const engine = window.UHHGoalRouting;
  const output = document.getElementById('routingRegressionResults');
  const summary = document.getElementById('routingRegressionSummary');
  if (!engine || !output || !summary) return;

  const cases = [
    ['V01','I want to lose 10 pounds and improve my eating habits.','S2_STRUCTURED',{kind:'route',routeId:'G01_WEIGHT'}],
    ['V01B','I want to lose some weight but I don’t want to count calories.','S1_SIMPLE',{kind:'route',routeId:'G01_WEIGHT'}],
    ['V02','I just want to get healthier, eat better, and be more consistent.','S1_SIMPLE',{kind:'route',routeId:'G02_LIFESTYLE'}],
    ['V03','I want to improve my gut health and understand my microbiome.','S2_STRUCTURED',{kind:'route',routeId:'G03_GUT'}],
    ['V03B','Which bad bacteria do I need to kill?','S0_LEARN',{noDiagnosis:true}],
    ['V04','I get heartburn after some meals and want to understand what might be contributing.','S0_LEARN',{kind:'route',routeId:'G04_DIGESTIVE'}],
    ['V04_RED','I have reflux and trouble swallowing and I’ve been losing weight without trying.','S0_LEARN',{kind:'safety',suppressSales:true}],
    ['V05','I want to improve my eating and activity habits to support healthier blood pressure.','S2_STRUCTURED',{kind:'route',routeId:'G05_BP',pricingState:'UNAVAILABLE'}],
    ['V05_MED','My blood pressure is better now. Should I stop my medication?','S0_LEARN',{kind:'medication',routeId:'G05_BP',suppressSales:true}],
    ['V05_RED','My blood pressure is 190/125 and I have chest pain.','S0_LEARN',{kind:'safety',safetyLevel:'E',suppressSales:true}],
    ['V06','I want to improve my cholesterol through food and exercise.','S1_SIMPLE',{kind:'route',routeId:'G06_LIPIDS'}],
    ['V06_MED','My body needs cholesterol, so should I stop my statin?','S0_LEARN',{kind:'medication',routeId:'G06_LIPIDS'}],
    ['V06_NEG','How do statins work?','S0_LEARN',{kind:'route',routeId:'G06_LIPIDS'}],
    ['V07','I was told I have prediabetes and I want to improve my habits.','S1_SIMPLE',{kind:'route',routeId:'G07_METABOLIC'}],
    ['V07_MED','My A1c improved. Can I stop my diabetes medicine?','S0_LEARN',{kind:'medication',routeId:'G07_METABOLIC'}],
    ['V07_FAST','I take glucose-lowering medicine and want to fast for 24 hours.','S0_LEARN',{kind:'safety',suppressSales:true}],
    ['V08','When does autophagy start if I fast?','S0_LEARN',{kind:'route',routeId:'G08_FASTING'}],
    ['V08_WEIGHT','I want intermittent fasting for weight loss.','S2_STRUCTURED',{kind:'clarification',routeId:'G12_HELP'}],
    ['V08_PROLONGED','Give me a 72-hour fasting protocol.','S0_LEARN',{kind:'safety',suppressSales:true}],
    ['V09','I have dogs. What parasite risks should I understand?','S0_LEARN',{kind:'route',routeId:'G09_PARASITE'}],
    ['V09_MYTH','I crave sugar and have pets, so that means I have parasites, right?','S0_LEARN',{kind:'route',routeId:'G09_PARASITE',noDiagnosis:true}],
    ['V10','Help me compare two foods for lower sodium.','S0_LEARN',{kind:'route',routeId:'G10_FOOD'}],
    ['V10_BARCODE','Scan this barcode for me.','S0_LEARN',{kind:'route',routeId:'G10_FOOD'}],
    ['V11_SLEEP','I just want to sleep better.','S1_SIMPLE',{kind:'route',routeId:'G11_HABITS'}],
    ['V11_SLEEP_RED','I snore loudly, my partner says I stop breathing, and I’m exhausted all day.','S1_SIMPLE',{kind:'safety',suppressSales:true}],
    ['V11_MOVE','I’m inactive and want to start moving more.','S1_SIMPLE',{kind:'route',routeId:'G11_HABITS'}],
    ['V11_HYDRATE','How much salt should everybody add to water every morning?','S0_LEARN',{kind:'route',routeId:'G11_HABITS'}],
    ['V12','I don’t know where to start. I just know my routine is terrible.','S5_UNSURE',{kind:'route',routeId:'G12_HELP',pricingState:'FREE'}],
    ['A01','I want to lose weight and improve my blood sugar.','S1_SIMPLE',{kind:'clarification'}],
    ['A02','My stomach is bad and I want gut help.','S0_LEARN',{kind:'clarification'}],
    ['A03','I want to fast and get my blood pressure down.','S0_LEARN',{kind:'clarification'}],
    ['A04','I want better energy.','S0_LEARN',{routeId:'G12_HELP',noDiagnosis:true}],
    ['M01','How do I taper my blood-pressure pill?','S0_LEARN',{kind:'medication',routeId:'G05_BP'}],
    ['M02','Can I stop my statin?','S0_LEARN',{kind:'medication',routeId:'G06_LIPIDS'}],
    ['M03','Can I reduce insulin because I’m eating better?','S0_LEARN',{kind:'medication',routeId:'G07_METABOLIC'}],
    ['M04','Should I stop my acid reflux medication and fix the root cause instead?','S0_LEARN',{kind:'medication',routeId:'G04_DIGESTIVE'}],
    ['M05','Can fasting replace my medicine?','S0_LEARN',{kind:'medication',suppressSales:true}],
    ['R01','I have reflux, persistent vomiting, and trouble swallowing.','S0_LEARN',{kind:'safety',suppressSales:true}],
    ['R02','My BP is 185/123 and I have weakness and trouble speaking.','S0_LEARN',{kind:'safety',safetyLevel:'E'}],
    ['R03','My blood sugar is low and I am confused and cannot treat it myself.','S0_LEARN',{kind:'safety',safetyLevel:'E'}],
    ['R04','I have severe dehydration and vomiting and cannot keep fluids down.','S0_LEARN',{kind:'safety',suppressSales:true}],
    ['R05','I snore, have breathing pauses in sleep, and severe daytime sleepiness.','S0_LEARN',{kind:'safety',suppressSales:true}],
    ['O01','Diagnose what disease I have from these symptoms.','S0_LEARN',{kind:'boundary',routeId:'UNSUPPORTED',noDiagnosis:true}],
    ['O02','Tell me exactly which prescription I should take.','S0_LEARN',{kind:'boundary',routeId:'UNSUPPORTED',noDiagnosis:true}],
    ['O03','Guarantee I will lose 15 pounds in 30 days.','S0_LEARN',{kind:'route',routeId:'G01_WEIGHT',noDiagnosis:true}],
    ['O04','Give every pet owner a parasite cleanse.','S0_LEARN',{kind:'route',routeId:'G09_PARASITE',noDiagnosis:true}],
    ['O05','Tell me the exact hour autophagy starts for everybody.','S0_LEARN',{kind:'route',routeId:'G08_FASTING',noDiagnosis:true}],
    ['S01_EXPLICIT','', 'S0_LEARN',{kind:'route',routeId:'G10_FOOD',pricingState:'FREE'},'G10_FOOD_INGREDIENT'],
    ['S02_HUMAN','', 'S4_HUMAN',{kind:'route',routeId:'G03_GUT',pricingState:'UNAVAILABLE'},'G03_GUT_MICROBIOME'],
    ['S03_STRUCTURED_GENERAL','', 'S2_STRUCTURED',{kind:'route',routeId:'G02_LIFESTYLE',pricingState:'FREE'},'G02_GENERAL_LIFESTYLE'],
    ['S04_STRUCTURED_BP','', 'S2_STRUCTURED',{kind:'route',routeId:'G05_BP',pricingState:'UNAVAILABLE'},'G05_BLOOD_PRESSURE']
  ];

  function matches(result, expected) {
    return Object.entries(expected).every(([key, value]) => result[key] === value);
  }

  const table = document.createElement('table');
  table.className = 'test-table';
  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  ['Test','Result','Actual route','Kind','Pricing'].forEach((label) => { const th=document.createElement('th'); th.textContent=label; hr.append(th); });
  thead.append(hr); table.append(thead);
  const tbody = document.createElement('tbody');
  let passed = 0;
  const failures = [];

  cases.forEach(([id, freeText, supportId, expected, goalId='']) => {
    let result;
    let ok = false;
    try {
      result = engine.resolve({ goalId, freeText, supportId });
      ok = matches(result, expected);
    } catch (error) {
      result = { routeId: 'ERROR', kind: error?.message || 'Exception', pricingState: '' };
    }
    if (ok) passed += 1; else failures.push({ id, expected, result });
    const row = document.createElement('tr');
    [id, ok ? 'PASS' : 'FAIL', result.routeId || result.goalId || '', result.kind || '', result.pricingState || ''].forEach((value) => { const td=document.createElement('td'); td.textContent=String(value); row.append(td); });
    tbody.append(row);
  });
  table.append(tbody);
  output.replaceChildren(table);
  summary.textContent = `${passed} of ${cases.length} deterministic source-browser vectors passed. Taxonomy: ${engine.TAXONOMY_VERSION}.`;
  summary.className = passed === cases.length ? 'notice success' : 'notice warning';

  if (failures.length) {
    const details = document.createElement('details');
    const title = document.createElement('summary');
    title.textContent = `${failures.length} mismatch${failures.length === 1 ? '' : 'es'} — open details`;
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(failures, null, 2);
    details.append(title, pre);
    output.append(details);
  }
})();
