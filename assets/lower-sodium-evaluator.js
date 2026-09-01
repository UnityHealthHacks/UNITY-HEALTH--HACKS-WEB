(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.UHHLowerSodium = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const DAILY_VALUE_MG = 2300;

  function nullableNonnegativeNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  function positiveNumberOrNull(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function normalizeUnit(value) {
    return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
  }

  function comparableServing(currentQty, currentUnit, referenceQty, referenceUnit) {
    const cq = positiveNumberOrNull(currentQty);
    const rq = positiveNumberOrNull(referenceQty);
    const cu = normalizeUnit(currentUnit);
    const ru = normalizeUnit(referenceUnit);
    if (cq === null || rq === null || !cu || !ru) return false;
    return cq === rq && cu === ru;
  }

  function evaluate(input) {
    const data = input || {};
    const sodium = nullableNonnegativeNumber(data.sodiumMgPerServing);
    const reference = nullableNonnegativeNumber(data.referenceProductSodiumMgPerServing);
    const sodiumKnown = sodium !== null;
    const percentDV = sodiumKnown ? (sodium / DAILY_VALUE_MG) * 100 : null;
    const servingComparable = comparableServing(
      data.servingQuantity,
      data.servingUnit,
      data.referenceServingQuantity,
      data.referenceServingUnit
    );

    let reductionPercent = null;
    if (sodiumKnown && reference !== null && reference > 0 && servingComparable) {
      reductionPercent = ((reference - sodium) / reference) * 100;
    }

    const packageClaim = typeof data.packageClaim === 'string' ? data.packageClaim : 'none';
    const lowerSodiumSelected = data.lowerSodiumSelected === true;
    const clinicianDirectedRestriction = data.clinicianDirectedRestriction === true;

    return {
      dailyValueMg: DAILY_VALUE_MG,
      sodiumMgPerServing: sodium,
      sodiumKnown,
      percentDV,
      lowSodiumByAmount: sodiumKnown && sodium <= 140,
      lowDVContext: sodiumKnown && percentDV <= 5,
      highDVContext: sodiumKnown && percentDV >= 20,
      servingComparable,
      reductionPercent,
      reducedSodiumClaimSupportedByEnteredComparison:
        reductionPercent !== null && reductionPercent >= 25,
      packageClaim,
      lowerSodiumSelected,
      clinicianDirectedRestriction,
      suppressPersonalizedTarget: clinicianDirectedRestriction,
      showLowerSodiumComparisonGuidance: lowerSodiumSelected,
      sodiumUnknownPrompt: lowerSodiumSelected && !sodiumKnown,
      noSaltAddedDoesNotImplyLowSodium:
        packageClaim === 'no-salt-added' || packageClaim === 'unsalted'
    };
  }

  return {
    DAILY_VALUE_MG,
    nullableNonnegativeNumber,
    comparableServing,
    evaluate
  };
});
