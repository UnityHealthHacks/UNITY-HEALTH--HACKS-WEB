(() => {
'use strict';

function assert(condition,label,details=''){
 if(!condition)throw new Error(`${label}${details?`: ${details}`:''}`);
 return {label,status:'PASS'};
}

function run(){
 const k=window.UHHIngredientKnowledge;
 assert(k,'IK-00 module available');
 const results=[];
 const check=(condition,label,details='')=>results.push(assert(condition,label,details));

 const known=k.lookupTerm('xanthan gum');
 check(known.state==='known','IK-01 known exact term');
 check(known.record?.purposeFact==='a thickener or stabilizer','IK-01 xanthan explanation');

 const caseVariant=k.lookupTerm('XANTHAN GUM');
 check(caseVariant.state==='known'&&caseVariant.canonicalName==='xanthan gum','IK-02 case normalization');
 check(caseVariant.entered==='XANTHAN GUM','IK-02 entered text preserved');

 const unknown=k.lookupTerm('invented ingredient xyz');
 check(unknown.state==='unknown'&&unknown.reason==='not-in-current-knowledge-base','IK-03 unknown honesty');

 const alias=k.lookupTerm('MSG');
 check(alias.state==='known'&&alias.matchedAs==='alias'&&alias.canonicalName==='monosodium glutamate','IK-04 alias transparency');

 const collisions=k.records.flatMap(r=>[r.name,...r.aliases]).map(v=>String(v).toLowerCase());
 const duplicates=collisions.filter((v,i,a)=>a.indexOf(v)!==i);
 check(duplicates.length===0,'IK-05 no current ambiguous key collisions','Current staged dataset contains no deliberately ambiguous aliases; engine returns ambiguous if future collisions exist.');

 const falsePositive=k.lookupTerm('xanthan gummy candy');
 check(falsePositive.state==='unknown','IK-06 substring false-positive rejection');

 const multiple=k.analyzeIngredientList('xanthan gum, sucralose');
 check(multiple.items.length===2&&multiple.items.every(i=>i.state==='known'),'IK-07 multiple known terms');
 check(multiple.items[0].canonicalName!==multiple.items[1].canonicalName,'IK-07 records remain distinct');

 const structure=known.record;
 check(Boolean(structure.purposeFact&&structure.context&&structure.interpretationBoundary&&structure.preferenceBoundary),'IK-08 fact/context/preference separation');

 const status=k.getDatasetStatus();
 check(status.recordCount===11,'IK-09 expected staged record count');
 check(status.allReleaseReady===false&&status.releaseReadyCount===0,'IK-09 metadata gate fails closed until sources reviewed');
 check(k.records.every(r=>r.evidence&&Array.isArray(r.evidence.sources)&&'reviewStatus' in r.evidence&&'releaseReady' in r.evidence),'IK-09 evidence metadata schema present');

 check(typeof k.lookupTerm==='function'&&typeof k.analyzeIngredientList==='function','IK-10 local deterministic API');
 check(!('fetch' in k)&&!('askAI' in k)&&!('productLookup' in k),'IK-10 no live AI/product dependency exposed');

 check(!('diagnosis' in structure)&&!('medicationAdvice' in structure)&&!('commerce' in structure),'IK-11 safety boundary schema');

 check(status.datasetVersion===k.datasetVersion,'IK-12 version consistency');

 return {status:'PASS',count:results.length,results,datasetStatus:status};
}

window.UHHIngredientKnowledgeRegression=Object.freeze({run});
})();
