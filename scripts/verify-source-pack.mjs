#!/usr/bin/env node
// Source Pack validator with zero npm dependencies. Does not touch secrets or external URLs.
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const names=['SOURCE-HIERARCHY','PROJECT-OVERVIEW','REQUIREMENTS','SCOPE','ARCHITECTURE','SECURITY','TEST-BENCHMARK-PLAN','DEPLOYMENT','BACKLOG','DEFINITION-OF-DONE','DECISIONS-LEDGER','CHECKPOINT','DATABASE-DATA-MODEL','API-CONTRACTS','UI-UX','INTEGRATION-CONTRACTS','MIGRATION-RECOVERY','TRACEABILITY','SUPPLIER-MONITORING','BEHOT-PUBLIC-DISCOVERY','MODULE-MAP','FRONTEND-FIRST-DELIVERY','AI-PROVIDER-CONTRACTS','MARKETPLACE-ELIGIBILITY','MULTI-AGENT-PLAN'];
const required=['README.md','.env.example','.gitignore','work-orders/WO-BLG-001.md',...names.map((n,i)=>'docs/'+String(i).padStart(2,'0')+'-'+n+'.md')];
const errors=[];
for(const p of required){if(!existsSync(resolve(root,p)))errors.push('Missing: '+p);}
const wopath=resolve(root,'work-orders/WO-BLG-001.md');
if(existsSync(wopath)){
  const wo=readFileSync(wopath,'utf8');
  for(const title of ['OBJECTIVE','CONTEXT','SCOPE','OUT OF SCOPE','FILES / SOURCES TO READ','REQUIREMENTS','ARCHITECTURE RULES','CONSTRAINTS','ACCEPTANCE CRITERIA','TESTS','DELIVERABLES','REVIEW FORMAT','STOP CONDITION']){
    if(!wo.includes('## '+title))errors.push('WO-BLG-001 missing heading: '+title);
  }
}
function mdFiles(folder){
  if(!existsSync(folder))return [];
  return readdirSync(folder,{withFileTypes:true}).flatMap(e=>{
    const p=resolve(folder,e.name);
    if(e.isDirectory())return mdFiles(p);
    return e.isFile()&&extname(e.name)==='.md'?[p]:[];
  });
}
for(const file of [resolve(root,'README.md'),...mdFiles(resolve(root,'docs')),...mdFiles(resolve(root,'work-orders'))]){
  if(!existsSync(file))continue;
  const content=readFileSync(file,'utf8');
  for(const m of content.matchAll(/\]\(([^)]+)\)/g)){
    const raw=m[1].trim().replace(/\s+"[^"]*"$/,'');
    if(!raw||/^(?:https?:|mailto:|#|data:|\/\/)/i.test(raw))continue;
    const target=decodeURIComponent(raw.split('#')[0].split('?')[0]);
    if(!target||/[<>]/.test(target))continue;
    const full=resolve(dirname(file),target);
    if(!(full===root||full.startsWith(root+'/')))errors.push('Link escapes repo: '+relative(root,file));
    else if(!existsSync(full))errors.push('Broken link: '+relative(root,file)+' -> '+target);
  }
  for(const pattern of [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bsk-proj-[A-Za-z0-9_-]{20,}\b/]){
    if(pattern.test(content))errors.push('Potential secret in '+relative(root,file));
  }
}
if(errors.length){
  for(const e of errors)console.error('ERROR: '+e);
  console.error('Source Pack FAILED ('+errors.length+' error(s))');
  process.exitCode=1;
}else{
  console.log('Source Pack OK: '+required.length+' canonical files, WO sections, link integrity and secret markers checked.');
}
