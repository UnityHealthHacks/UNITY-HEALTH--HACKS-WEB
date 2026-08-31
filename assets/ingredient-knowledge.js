(() => {
'use strict';

const DATASET_VERSION='UHH-INGREDIENT-KNOWLEDGE-0.2.0-SOURCE-ANCHORED-2026-08-31';
const REVIEW_STATE='SOURCE_ANCHORED_PENDING_REGRESSION';
const REVIEWED_AT='2026-08-31';
const REVIEW_STATUS='source-anchored-pending-regression';

const src=(authority,citation,url)=>Object.freeze({authority,citation,url});

const records=[
 {id:'high-fructose-corn-syrup',name:'high fructose corn syrup',aliases:[],purposeFact:'a sweetener derived from corn starch; common HFCS formulations contain glucose and fructose',context:'FDA describes common forms including HFCS 42 and HFCS 55. Ingredient identity alone does not establish an individualized health effect.',interpretationBoundary:'Do not infer a disease state or personalized harm from label presence alone.',preferenceBoundary:'Member preferences about added sweeteners are separate from factual ingredient identity.',sources:[src('FDA','High Fructose Corn Syrup Questions and Answers','https://www.fda.gov/food/food-additives-petitions/high-fructose-corn-syrup-questions-and-answers'),src('FDA','Types of Food Ingredients','https://www.fda.gov/food/food-additives-and-gras-ingredients-information-consumers/types-food-ingredients')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'maltodextrin',name:'maltodextrin',aliases:[],purposeFact:'a nonsweet nutritive saccharide polymer composed of D-glucose units and prepared by partial hydrolysis of starch',context:'The federal regulation describes maltodextrin and permits food use consistent with current good manufacturing practice.',interpretationBoundary:'Presence alone does not diagnose a condition or establish a personalized metabolic outcome.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('eCFR','21 CFR 184.1444 — Maltodextrin','https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-184/subpart-B/section-184.1444')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'partially-hydrogenated',name:'partially hydrogenated',aliases:['partially hydrogenated oils'],purposeFact:'a label phrase associated with partially hydrogenated oils, formerly the primary dietary source of artificial trans fat in processed foods',context:'FDA determined partially hydrogenated oils are no longer generally recognized as safe and completed related regulatory actions. Review the full label rather than generalizing this phrase to all edible oils or naturally occurring trans fat.',interpretationBoundary:'Do not convert this phrase by itself into diagnosis, treatment, or medication advice.',preferenceBoundary:'Member avoidance preferences are separate from factual label interpretation.',sources:[src('FDA','Final Determination Regarding Partially Hydrogenated Oils','https://www.fda.gov/food/food-additives-petitions/final-determination-regarding-partially-hydrogenated-oils-removing-trans-fat'),src('FDA','FDA Completes Final Administrative Actions on Partially Hydrogenated Oils in Foods','https://www.fda.gov/food/hfp-constituent-updates/fda-completes-final-administrative-actions-partially-hydrogenated-oils-foods')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'carrageenan',name:'carrageenan',aliases:[],purposeFact:'a refined hydrocolloid from specified red seaweeds used as an emulsifier, stabilizer, or thickener under specified conditions',context:'Regulatory authorization and ingredient function are separate from individualized health interpretation.',interpretationBoundary:'Presence alone does not establish intolerance, disease, or an individualized risk conclusion.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('eCFR','21 CFR 172.620 — Carrageenan','https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-172/subpart-G/section-172.620')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'guar-gum',name:'guar gum',aliases:[],purposeFact:'an ingredient derived from guar seed used for functions that include formulation aid, emulsifier, stabilizer, and thickener',context:'Ingredient-purpose education only; regulated function does not establish an individualized digestive effect.',interpretationBoundary:'Presence alone does not establish a digestive cause for symptoms or a universal intolerance.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('eCFR','21 CFR 184.1339 — Guar gum','https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-184/subpart-B/section-184.1339'),src('FDA','Types of Food Ingredients','https://www.fda.gov/food/food-additives-and-gras-ingredients-information-consumers/types-food-ingredients')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'xanthan-gum',name:'xanthan gum',aliases:[],purposeFact:'a stabilizer or thickener',context:'FDA GINAS also lists emulsifier and foaming-agent functional classifications from Codex/JECFA. Ingredient function is separate from individualized health interpretation.',interpretationBoundary:'Presence alone does not establish a digestive cause for symptoms or a universal intolerance.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('FDA GINAS','Xanthan Gum — functional classifications and 21 CFR 172.695 reference','https://precision.fda.gov/ginas/app/ui/substances/6032c73c-10d8-46e8-8e33-99cc9216dea5')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'natural-flavor',name:'natural flavor',aliases:['natural flavors'],purposeFact:'a labeling category for specified flavoring constituents derived from listed natural source categories, where the significant function is flavoring rather than nutritional',context:'The label term is broad and does not identify one single chemical, source, or complete flavor formulation.',interpretationBoundary:'Do not infer a specific compound or individualized health effect from the category name alone.',preferenceBoundary:'Member preferences about flavorings are separate from factual label identity.',sources:[src('eCFR','21 CFR 101.22 — Foods; labeling of spices, flavorings, colorings and chemical preservatives','https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-B/section-101.22')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'sodium-nitrite',name:'sodium nitrite',aliases:[],purposeFact:'an ingredient authorized under specified conditions for uses that include preservation and color fixing in certain foods',context:'FDA also lists sodium nitrite among preservatives. Regulated use conditions are separate from individualized medical interpretation.',interpretationBoundary:'Presence alone does not establish individual risk, diagnosis, or a treatment decision.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('eCFR','21 CFR 172.175 — Sodium nitrite','https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-172/subpart-B/section-172.175'),src('FDA','Types of Food Ingredients','https://www.fda.gov/food/food-additives-and-gras-ingredients-information-consumers/types-food-ingredients')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'monosodium-glutamate',name:'monosodium glutamate',aliases:['msg'],purposeFact:'the sodium salt of glutamic acid, commonly used as a flavor enhancer',context:'FDA considers added MSG generally recognized as safe under intended food use and requires added MSG to be declared as monosodium glutamate on the ingredient panel.',interpretationBoundary:'Presence alone does not establish intolerance, a medical condition, or that every individual response is identical.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('FDA','Questions and Answers on Monosodium Glutamate (MSG)','https://www.fda.gov/food/food-additives-petitions/questions-and-answers-monosodium-glutamate-msg'),src('FDA','Types of Food Ingredients','https://www.fda.gov/food/food-additives-and-gras-ingredients-information-consumers/types-food-ingredients')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'sucralose',name:'sucralose',aliases:[],purposeFact:'a high-intensity sweetener approved by FDA as a food additive in the United States',context:'This records regulatory status and ingredient function; it does not state that every amount, use pattern, or individual response is risk-free.',interpretationBoundary:'Presence alone does not determine whether a food fits an individual health plan or establish a diagnosis.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('FDA','High-Intensity Sweeteners','https://www.fda.gov/food/food-additives-petitions/high-intensity-sweeteners')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false},
 {id:'aspartame',name:'aspartame',aliases:[],purposeFact:'an FDA-authorized high-intensity sweetener',context:'FDA states it does not have safety concerns when used under approved conditions of use, maintains an acceptable daily intake, and notes phenylalanine content is relevant for people with phenylketonuria.',interpretationBoundary:'Regulatory safety under approved conditions is separate from individualized medical advice or a claim that every response is identical.',preferenceBoundary:'Member preferences are separate from factual ingredient identity.',sources:[src('FDA','Aspartame and Other Sweeteners in Food','https://www.fda.gov/food/food-additives-petitions/aspartame-and-other-sweeteners-food')],reviewedAt:REVIEWED_AT,reviewStatus:REVIEW_STATUS,releaseReady:false}
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
  evidence:{sources:record.sources.map(source=>({...source})),reviewedAt:record.reviewedAt,reviewStatus:record.reviewStatus,releaseReady:record.releaseReady},
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
 const sourceAnchoredCount=records.filter(r=>r.sources.length>0&&r.reviewedAt&&r.reviewStatus===REVIEW_STATUS).length;
 return {datasetVersion:DATASET_VERSION,reviewState:REVIEW_STATE,recordCount:records.length,sourceAnchoredCount,releaseReadyCount,allSourceAnchored:sourceAnchoredCount===records.length,allReleaseReady:releaseReadyCount===records.length};
}

window.UHHIngredientKnowledge=Object.freeze({
 datasetVersion:DATASET_VERSION,
 lookupTerm,
 analyzeIngredientList,
 getDatasetStatus,
 records:records.map(publicRecord)
});
})();
