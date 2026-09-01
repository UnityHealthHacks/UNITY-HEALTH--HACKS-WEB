'use strict';

const assert = require('node:assert/strict');
const ls = require('../assets/lower-sodium-evaluator.js');

const results = [];
function run(id, fn) {
  try {
    fn();
    results.push({ id, status: 'PASS' });
  } catch (error) {
    results.push({ id, status: 'FAIL', error: error.message });
  }
}

run('LS-01', () => {
  const r = ls.evaluate({ lowerSodiumSelected: true, sodiumMgPerServing: 120 });
  assert.equal(r.showLowerSodiumComparisonGuidance, true);
  assert.equal(r.lowSodiumByAmount, true);
  assert.equal(r.lowDVContext, false);
});

run('LS-02', () => {
  const r = ls.evaluate({ lowerSodiumSelected: true, sodiumMgPerServing: 230 });
  assert.equal(r.showLowerSodiumComparisonGuidance, true);
  assert.equal(r.sodiumKnown, true);
});

run('LS-03', () => {
  const r = ls.evaluate({ lowerSodiumSelected: true, sodiumMgPerServing: 460 });
  assert.equal(Math.round(r.percentDV), 20);
  assert.equal(r.highDVContext, true);
  assert.equal(r.suppressPersonalizedTarget, false);
});

run('LS-04', () => {
  const r = ls.evaluate({ lowerSodiumSelected: true, sodiumMgPerServing: null });
  assert.equal(r.sodiumKnown, false);
  assert.equal(r.sodiumMgPerServing, null);
  assert.equal(r.sodiumUnknownPrompt, true);
});

run('LS-05', () => {
  const r = ls.evaluate({ lowerSodiumSelected: false, sodiumMgPerServing: 700 });
  assert.equal(r.showLowerSodiumComparisonGuidance, false);
  assert.equal(r.highDVContext, true);
});

run('LS-06', () => {
  const r = ls.evaluate({
    lowerSodiumSelected: true,
    sodiumMgPerServing: 300,
    referenceProductSodiumMgPerServing: 500,
    servingQuantity: 1,
    servingUnit: 'cup',
    referenceServingQuantity: 1,
    referenceServingUnit: 'cup',
    packageClaim: 'reduced-sodium'
  });
  assert.equal(r.servingComparable, true);
  assert.equal(Math.round(r.reductionPercent), 40);
  assert.equal(r.reducedSodiumClaimSupportedByEnteredComparison, true);
});

run('LS-07', () => {
  const r = ls.evaluate({ sodiumMgPerServing: 420, packageClaim: 'no-salt-added' });
  assert.equal(r.noSaltAddedDoesNotImplyLowSodium, true);
  assert.equal(r.lowSodiumByAmount, false);
});

run('LS-08', () => {
  const r = ls.evaluate({
    sodiumMgPerServing: 300,
    referenceProductSodiumMgPerServing: 500,
    servingQuantity: 1,
    servingUnit: 'cup',
    referenceServingQuantity: 2,
    referenceServingUnit: 'cup'
  });
  assert.equal(r.servingComparable, false);
  assert.equal(r.reductionPercent, null);
});

run('LS-09', () => {
  // This pure evaluator intentionally exposes no medication-change capability.
  assert.equal(Object.prototype.hasOwnProperty.call(ls, 'changeMedication'), false);
});

run('LS-10', () => {
  const r = ls.evaluate({
    sodiumMgPerServing: 180,
    clinicianDirectedRestriction: true,
    lowerSodiumSelected: true
  });
  assert.equal(r.suppressPersonalizedTarget, true);
  assert.equal(r.showLowerSodiumComparisonGuidance, true);
});

run('NULL-VS-ZERO', () => {
  assert.equal(ls.evaluate({ sodiumMgPerServing: null }).sodiumKnown, false);
  const zero = ls.evaluate({ sodiumMgPerServing: 0 });
  assert.equal(zero.sodiumKnown, true);
  assert.equal(zero.sodiumMgPerServing, 0);
});

const failed = results.filter((r) => r.status !== 'PASS');
console.log(JSON.stringify({ suite: 'R-P2-04', results, pass: failed.length === 0 }, null, 2));
if (failed.length) process.exitCode = 1;
