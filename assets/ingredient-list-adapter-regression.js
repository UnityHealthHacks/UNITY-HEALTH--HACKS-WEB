(() => {
'use strict';

function assert(condition,label,details=''){
 if(!condition)throw new Error(`${label}${details?`: ${details}`:''}`);
 return {label,status:'PASS'};
}

function run(){
 const a=window.UHHIngredientListAdapter;
 const k=window.UHHIngredientKnowledge;
 assert(a&&k,'FL-00 modules available');
 const results=[];
 const check=(condition,label,details='')=>results.push(assert(condition,label,details));

 let r=a.parse('xanthan gum, sucralose');
 check(r.parseStatus==='parsed'&&r.items.length===2,'FL-01 simple known list');
 check(r.items.every(i=>i.state==='known'),'FL-01 both known');
 check(r.items[0].canonicalName==='xanthan gum'&&r.items[1].canonicalName==='sucralose','FL-01 order preserved');
 const xanthanPurpose=String(r.items[0].record?.purposeFact||'').toLowerCase();
 check(xanthanPurpose.includes('thickener')&&xanthanPurpose.includes('stabilizer'),'FL-01 xanthan bounded explanation');

 r=a.parse('XANTHAN GUM');
 check(r.items[0]?.state==='known'&&r.items[0]?.canonicalName==='xanthan gum','FL-02 case normalization');
 check(r.originalText==='XANTHAN GUM'&&r.items[0]?.originalText==='XANTHAN GUM','FL-02 original text preserved');

 r=a.parse('xanthan gummy candy');
 check(r.items.length===1&&r.items[0].state==='unknown','FL-03 substring false-positive rejected');

 r=a.parse('MSG, natural flavors');
 check(r.items[0]?.state==='known'&&r.items[0]?.matchedAs==='alias'&&r.items[0]?.canonicalName==='monosodium glutamate','FL-04 MSG alias transparency');
 check(r.items[1]?.state==='known'&&r.items[1]?.matchedAs==='alias'&&r.items[1]?.canonicalName==='natural flavor','FL-04 natural flavors alias transparency');

 r=a.parse('seasoning (salt, maltodextrin, natural flavor), xanthan gum');
 check(r.items.length===5,'FL-05 outer plus subingredients preserved');
 check(r.items[0]?.originalText==='seasoning'&&r.items[0]?.depth===0&&r.items[0]?.state==='unknown','FL-05 outer seasoning retained');
 check(r.items[1]?.originalText==='salt'&&r.items[1]?.depth===1&&r.items[1]?.state==='unknown','FL-05 salt subordinate unknown');
 check(r.items[2]?.canonicalName==='maltodextrin'&&r.items[2]?.depth===1&&r.items[2]?.parentIndex===0,'FL-05 maltodextrin subordinate known');
 check(r.items[3]?.canonicalName==='natural flavor'&&r.items[3]?.depth===1&&r.items[3]?.parentIndex===0,'FL-05 natural flavor subordinate known');
 check(r.items[4]?.canonicalName==='xanthan gum'&&r.items[4]?.depth===0,'FL-05 xanthan top-level known');

 r=a.parse('modified food starch (corn), xanthan gum');
 check(r.items[0]?.state==='unknown'&&r.items[0]?.originalText==='modified food starch','FL-06 outer descriptor remains unknown');
 check(r.items[1]?.state==='unknown'&&r.items[1]?.originalText==='corn'&&r.items[1]?.depth===1,'FL-06 unsupported corn remains unknown');
 check(r.items[2]?.canonicalName==='xanthan gum','FL-06 xanthan known');

 r=a.parse('carrageenan; guar gum\nsodium nitrite');
 check(r.items.length===3&&r.items.every(i=>i.state==='known'),'FL-07 semicolon newline parsing');
 check(r.items.map(i=>i.canonicalName).join('|')==='carrageenan|guar gum|sodium nitrite','FL-07 order preserved');

 r=a.parse('invented ingredient xyz, xanthan gum');
 check(r.items[0]?.state==='unknown'&&r.items[0]?.reason==='not-in-current-knowledge-base','FL-08 unknown honesty');
 check(r.items[1]?.canonicalName==='xanthan gum','FL-08 known neighbor preserved');

 r=a.parse('seasoning (maltodextrin, natural flavor, xanthan gum');
 check(r.parseStatus==='parsed-with-warning','FL-09 malformed parenthesis warning');
 check(r.originalText==='seasoning (maltodextrin, natural flavor, xanthan gum','FL-09 original malformed text preserved');
 check(r.items.some(i=>i.canonicalName==='maltodextrin')&&r.items.some(i=>i.canonicalName==='natural flavor')&&r.items.some(i=>i.canonicalName==='xanthan gum'),'FL-09 safely recognized exact nested tokens');

 r=a.parse('Ingredients:');
 check(r.parseStatus==='empty'&&r.items.length===0,'FL-10 label-only empty');

 r=a.parse('xanthan gum, xanthan gum');
 check(r.items.length===2&&r.items.every(i=>i.canonicalName==='xanthan gum'),'FL-11 duplicate occurrence preserved');
 check(r.items[0].path!==r.items[1].path,'FL-11 occurrence positions distinct');

 r=a.parse('Ingredients: xanthan gum');
 check(r.originalText==='Ingredients: xanthan gum'&&r.normalizedParseText==='xanthan gum','FL-12 parsing does not rewrite original label');
 check(!('diagnosis' in r)&&!('medicationAdvice' in r)&&!('commerce' in r)&&!('productIdentity' in r),'FL-12 safety and commerce boundary schema');
 check(k.getDatasetStatus().releaseReadyCount===0,'FL-12 release gate remains closed');

 return {status:'PASS',count:results.length,results,datasetStatus:k.getDatasetStatus()};
}

window.UHHIngredientListAdapterRegression=Object.freeze({run});
})();
