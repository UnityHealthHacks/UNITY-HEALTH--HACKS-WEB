(() => {
'use strict';

const normalize=value=>String(value??'').trim().toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ');
const stripLabel=value=>String(value??'').replace(/^\s*ingredients\s*:\s*/i,'').trim();

function splitTopLevel(text){
 const parts=[];
 let current='';
 let depth=0;
 let warning=false;
 for(const ch of String(text??'')){
  if(ch==='('){depth+=1;current+=ch;continue;}
  if(ch===')'){
   if(depth===0){warning=true;current+=ch;continue;}
   depth-=1;current+=ch;continue;
  }
  if((ch===','||ch===';'||ch==='\n'||ch==='\r')&&depth===0){
   const trimmed=current.trim();
   if(trimmed)parts.push(trimmed);
   current='';
   continue;
  }
  current+=ch;
 }
 const trimmed=current.trim();
 if(trimmed)parts.push(trimmed);
 if(depth!==0)warning=true;
 return {parts,warning};
}

function decomposeItem(text){
 const source=String(text??'').trim();
 const firstOpen=source.indexOf('(');
 if(firstOpen<0)return {outer:source,inner:null,warning:false};
 let depth=0;
 let close=-1;
 for(let i=firstOpen;i<source.length;i+=1){
  const ch=source[i];
  if(ch==='(')depth+=1;
  else if(ch===')'){
   depth-=1;
   if(depth===0){close=i;break;}
   if(depth<0)break;
  }
 }
 if(close<0){
  const outer=source.slice(0,firstOpen).trim();
  const inner=source.slice(firstOpen+1).trim();
  return {outer:outer||source,inner:inner||null,warning:true};
 }
 const outer=(source.slice(0,firstOpen)+source.slice(close+1)).trim().replace(/\s+/g,' ');
 const inner=source.slice(firstOpen+1,close).trim();
 const trailing=source.slice(close+1).trim();
 return {outer:outer||source,inner:inner||null,warning:Boolean(trailing&&outer===source)};
}

function parse(input){
 const knowledge=window.UHHIngredientKnowledge;
 if(!knowledge||typeof knowledge.lookupTerm!=='function'){
  throw new Error('Ingredient knowledge module is required before ingredient-list adapter.');
 }
 const originalText=String(input??'');
 const normalizedParseText=stripLabel(originalText);
 if(!normalizedParseText){
  return {originalText,normalizedParseText,parseStatus:'empty',items:[],datasetVersion:knowledge.datasetVersion};
 }
 const top=splitTopLevel(normalizedParseText);
 const items=[];
 let parseWarning=top.warning;

 function add(raw,depth,parentIndex,path){
  const decomposition=decomposeItem(raw);
  if(decomposition.warning)parseWarning=true;
  const outerText=decomposition.outer.trim();
  if(outerText){
   const lookup=knowledge.lookupTerm(outerText);
   const item={
    originalText:outerText,
    normalizedKey:normalize(outerText),
    depth,
    parentIndex,
    path,
    state:lookup.state,
    datasetVersion:lookup.datasetVersion
   };
   if(lookup.state==='known'){
    item.canonicalName=lookup.canonicalName;
    item.matchedAs=lookup.matchedAs;
    item.record=lookup.record;
   }else if(lookup.state==='ambiguous'){
    item.reason='needs-clarification';
    item.candidates=lookup.candidates||[];
   }else{
    item.reason=lookup.reason||'not-in-current-knowledge-base';
   }
   const thisIndex=items.length;
   items.push(item);
   if(decomposition.inner){
    const nested=splitTopLevel(decomposition.inner);
    if(nested.warning)parseWarning=true;
    nested.parts.forEach((part,childOffset)=>add(part,depth+1,thisIndex,`${path}.${childOffset}`));
   }
   return;
  }
  if(decomposition.inner){
   const nested=splitTopLevel(decomposition.inner);
   if(nested.warning)parseWarning=true;
   nested.parts.forEach((part,childOffset)=>add(part,depth,parentIndex,`${path}.${childOffset}`));
  }
 }

 top.parts.forEach((part,index)=>add(part,0,null,String(index)));
 return {
  originalText,
  normalizedParseText,
  parseStatus:parseWarning?'parsed-with-warning':'parsed',
  items,
  datasetVersion:knowledge.datasetVersion
 };
}

window.UHHIngredientListAdapter=Object.freeze({parse,splitTopLevel});
})();
