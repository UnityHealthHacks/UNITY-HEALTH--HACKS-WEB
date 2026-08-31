(() => {
'use strict';

const DATASET_VERSION='UHH-INGREDIENT-KNOWLEDGE-0.1.0-STAGED-2026-08-31';
const REVIEW_STATE='STAGED_NON_RELEASE';

const records=[
 {id:'high-fructose-corn-syrup',name:'high fructose corn syrup',aliases:[],purposeFact:'an added sweetener',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not establish health impact for an individual.',preferenceBoundary:'Member preferences about added sweeteners are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'maltodextrin',name:'maltodextrin',aliases:[],purposeFact:'a starch-derived ingredient used for texture or bulk',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not diagnose a condition or determine whether a food fits an individual goal.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'partially-hydrogenated',name:'partially hydrogenated',aliases:[],purposeFact:'a phrase requiring careful review for trans fat',context:'Review the full label rather than inferring a complete nutrition profile from this phrase alone.',interpretationBoundary:'Do not convert this phrase by itself into diagnosis, treatment, or medication advice.',preferenceBoundary:'Member avoidance preferences are separate from factual label interpretation.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'carrageenan',name:'carrageenan',aliases:[],purposeFact:'a thickener or stabilizer',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not establish intolerance or disease.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'guar-gum',name:'guar gum',aliases:[],purposeFact:'a thickener and soluble fiber',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not establish a digestive cause for symptoms.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'xanthan-gum',name:'xanthan gum',aliases:[],purposeFact:'a thickener or stabilizer',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not establish a digestive cause for symptoms.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'natural-flavor',name:'natural flavor',aliases:['natural flavors'],purposeFact:'a broad flavoring category',context:'The label term is broad and does not identify every component of a flavor formulation.',interpretationBoundary:'Do not infer a specific compound or health effect from the category name alone.',preferenceBoundary:'Member preferences about flavorings are separate from factual label identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'sodium-nitrite',name:'sodium nitrite',aliases:[],purposeFact:'a curing and preservation ingredient',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not establish individual risk or diagnosis.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'monosodium-glutamate',name:'monosodium glutamate',aliases:['msg'],purposeFact:'a flavor enhancer also called MSG',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not establish intolerance or a medical condition.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'sucralose',name:'sucralose',aliases:[],purposeFact:'a high-intensity sweetener',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not determine whether a food fits an individual health plan.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false},
 {id:'aspartame',name:'aspartame',aliases:[],purposeFact:'a high-intensity sweetener',context:'Ingredient-purpose education only.',interpretationBoundary:'Presence alone does not determine whether a food fits an individual health plan.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[],reviewedAt:null,reviewStatus:'needs-source-review',releaseReady:false}
];

const normalize=value=>String(value??'').trim().toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ');
const byKey=new Map();
records.forEach(record=>{
 [record.name,...record.aliases].forEach(raw=>{
  const key=normalize(raw);
  const arr=byKey.get(key)||[];
  arr.push({record,matchedAs:key===normalize(record.name)?'canonical':'alias',matchedText:raw});
  byKey.set(key,arr);
 });
});

function publicRecord(record){
 return {
  id:record.id,
  name:record.name,
  aliases:[...record.aliases],
  purposeFact:record.purposeFact,
  context:record.context,
  interpretationBoundary:record.interpretationBoundary,
  preferenceBoundary:record.preferenceBoundary,
  evidence:{sources:[...record.sources],reviewedAt:record.reviewedAt,reviewStatus:record.reviewStatus,releaseReady:record.releaseReady},
  datasetVersion:DATASET_VERSION
 };
}

function lookupTerm(input){
 const entered=String(input??'').trim();
 const key=normalize(entered);
 if(!key)return {state:'unknown',entered,reason:'empty-input',datasetVersion:DATASET_VERSION};
 const matches=byKey.get(key)||[];
 if(matches.length===0)return {state:'unknown',entered,reason:'not-in-current-knowledge-base',datasetVersion:DATASET_VERSION};
 if(matches.length>1)return {state:'ambiguous',entered,candidates:matches.map(m=>publicRecord(m.record)),datasetVersion:DATASET_VERSION};
 const match=matches[0];
 return {state:'known',entered,matchedAs:match.matchedAs,canonicalName:match.record.name,record:publicRecord(match.record),datasetVersion:DATASET_VERSION};
}

function analyzeIngredientList(input){
 const entered=String(input??'').trim();
 if(!entered)return {state:'unknown',entered,items:[],datasetVersion:DATASET_VERSION};
 const rawItems=entered.split(/[;,\n]/).map(v=>v.trim()).filter(Boolean);
 const items=rawItems.map(lookupTerm);
 const states=new Set(items.map(item=>item.state));
 const state=states.size===1?[...states][0]:'mixed';
 return {state,entered,items,datasetVersion:DATASET_VERSION};
}

function getDatasetStatus(){
 const releaseReadyCount=records.filter(r=>r.releaseReady).length;
 return {datasetVersion:DATASET_VERSION,reviewState:REVIEW_STATE,recordCount:records.length,releaseReadyCount,allReleaseReady:releaseReadyCount===records.length};
}

window.UHHIngredientKnowledge=Object.freeze({
 datasetVersion:DATASET_VERSION,
 lookupTerm,
 analyzeIngredientList,
 getDatasetStatus,
 records:records.map(publicRecord)
});
})();
