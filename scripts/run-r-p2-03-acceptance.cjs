'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const assert=(condition,label)=>{if(!condition)throw new Error(label);return {label,status:'PASS'};};

function browserContext(){
 const window={};
 return vm.createContext({window,console,Object,Array,String,Number,Boolean,Map,Set,RegExp,JSON,Math,Date});
}

function runBrowserScript(context,rel,sourceOverride){
 const source=sourceOverride??read(rel);
 vm.runInContext(source,context,{filename:rel});
}

function runStandardIngredientAndAdapterRegression(){
 const context=browserContext();
 runBrowserScript(context,'assets/ingredient-knowledge.js');
 runBrowserScript(context,'assets/ingredient-knowledge-regression.js');
 runBrowserScript(context,'assets/ingredient-list-adapter.js');
 runBrowserScript(context,'assets/ingredient-list-adapter-regression.js');
 const ik=context.window.UHHIngredientKnowledgeRegression.run();
 const fl=context.window.UHHIngredientListAdapterRegression.run();
 return {ik,fl};
}

function runActualLookupAmbiguityFixture(){
 const original=read('assets/ingredient-knowledge.js');
 const marker='const records=[\n';
 assert(original.includes(marker),'IK-05 fixture injection marker missing');
 const fixture=" {id:'fixture-one',name:'fixture one',aliases:['shared ambiguity fixture'],purposeFact:'test fixture only',context:'test fixture only',interpretationBoundary:'test fixture only',preferenceBoundary:'test fixture only',sources:[],reviewedAt:null,reviewStatus:'fixture',releaseReady:false},\n {id:'fixture-two',name:'fixture two',aliases:['shared ambiguity fixture'],purposeFact:'test fixture only',context:'test fixture only',interpretationBoundary:'test fixture only',preferenceBoundary:'test fixture only',sources:[],reviewedAt:null,reviewStatus:'fixture',releaseReady:false},\n";
 const instrumented=original.replace(marker,marker+fixture);
 const context=browserContext();
 runBrowserScript(context,'assets/ingredient-knowledge.js',instrumented);
 const result=context.window.UHHIngredientKnowledge.lookupTerm('shared ambiguity fixture');
 assert(result.state==='ambiguous','IK-05 actual lookup path did not return ambiguous');
 assert(Array.isArray(result.candidates)&&result.candidates.length===2,'IK-05 ambiguous candidates not preserved');
 return {status:'PASS',state:result.state,candidateCount:result.candidates.length};
}

function runCrossFeatureStaticRegression(){
 const site=read('assets/site.js');
 const routing=read('assets/goal-routing.js');
 const barcode=read('assets/barcode-scanner.js');
 const results=[];
 const check=(condition,label)=>results.push(assert(condition,label));

 check(!site.includes('lowerSodium&&sodium>=300'),'IK-12 lower-sodium arbitrary 300 mg gate absent');
 check(site.includes("if(lowerSodium)notes.push('Because you selected lower-sodium comparisons"),'IK-12 lower-sodium selected-state guidance preserved');
 check(site.includes("const barcode=(v('barcodeValue')?.value||'').trim().slice(0,32)"),'IK-12 site barcode remains string');
 check(barcode.includes('.value.trim()'),'IK-12 manual barcode scanner reads string value');
 check(barcode.includes('textContent=code')||barcode.includes('textContent = code'),'IK-12 manual barcode display preserves captured string');

 check(routing.includes('function medicationIntercept'),'IK-12 medication intercept function present');
 check(routing.includes('stop, reduce, skip, replace, or change the schedule of a prescription'),'IK-12 medication-change safety copy preserved');
 check(routing.includes('suppressSales: true'),'IK-12 safety override can suppress sales');
 check(routing.includes('higher-safety paid routing is not available'),'IK-12 higher-safety paid route hard-disable wording preserved');
 check(routing.includes('Help Me Choose is free'),'IK-12 free help-me-choose boundary preserved');

 return {status:'PASS',count:results.length,results};
}

function run(){
 const standard=runStandardIngredientAndAdapterRegression();
 const ambiguity=runActualLookupAmbiguityFixture();
 const crossFeature=runCrossFeatureStaticRegression();
 return {
  status:'PASS',
  standard,
  ambiguity,
  crossFeature,
  boundary:'Source/integration regression only. Browser/device/CP07 acceptance remains separate; no releaseReady promotion is authorized.'
 };
}

try{
 const result=run();
 process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
}catch(error){
 process.stderr.write(`${error&&error.stack?error.stack:String(error)}\n`);
 process.exitCode=1;
}
