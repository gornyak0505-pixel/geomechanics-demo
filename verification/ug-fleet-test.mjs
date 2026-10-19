import assert from 'node:assert/strict';
import {ugDefaults as p,calculateUG,ugBasis,ugScenario} from './ug-fleet-engine.mjs';
let checks=0;const ok=v=>{assert(v);checks++},close=(a,b)=>ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
const r=calculateUG(p);ok(r.direct.nLHD===10&&r.direct.nTruck===0);ok(r.combined.nLHD===1&&r.combined.nTruck===3);ok(r.best==='combined');
close(r.basis.directCycle,22+1/3);close(r.basis.truckLoading,5.925);close(r.basis.truckCycle,20.008333333333333);ok(r.basis.passes===3);
close(r.direct.airRequired,130);close(r.combined.airRequired,82);close(r.combined.cashPerT,1.5853766975308643);close(r.combined.eacPerT,2.082054484645929);
for(const s of [r.direct,r.combined]){ok(s.meetsMargin&&s.actual===1e6);for(const row of s.rows)ok(row.hours<=row.n*r.basis.effective+1e-6);close(s.presentCost,s.capex+s.cash*r.basis.pvf-s.capex*p.salvage/100/(1+p.discount/100)**p.years);}
let v=calculateUG({...p,availableAir:90});ok(v.direct===null&&v.combined!==null);ok(v.directCandidate.actual===null&&v.directCandidate.cash===null);
v=calculateUG({...p,availableAir:81});ok(v.best===null&&v.direct===null&&v.combined===null);ok(v.closestCombined.actual===null);
v=calculateUG({...p,truckW:5});ok(v.direct!==null&&v.combined===null&&v.best==='direct');
v=calculateUG({...p,clearW:2});ok(v.best===null&&v.directCandidate.actual===null);
v=calculateUG({...p,longGrade:16});ok(v.direct!==null&&v.combined===null);
v=calculateUG({...p,shortGrade:20});ok(v.best===null);
v=calculateUG({...p,lhdReach:3});ok(v.direct!==null&&v.combined===null);
v=calculateUG({...p,finalDumpH:4});ok(v.best===null);
v=calculateUG({...p,discount:0});close(v.combined.annualCapital,v.combined.capex*.8/p.years);
v=calculateUG({...p,body:10});close(v.basis.truckLoad,10*p.rho/p.swell);
v=calculateUG({...p,lhdPayload:6});close(v.basis.lhdLoad,6);
const saturated=ugScenario(p,r.basis,'combined',1,20);ok(saturated.extraQueue>0);close(saturated.q,r.basis.truckLoad*60/r.basis.truckLoading);
const air=ugBasis({...p,availability:20});close(air.airLHD,r.basis.airLHD);close(air.airTruck,r.basis.airTruck);
for(const changes of [{ore:0,waste:0},{hours:12,shifts:3},{airFactor:0,lhdAir:0},{truckEmpty:0},{margin:-1},{years:1.5}]){assert.throws(()=>calculateUG({...p,...changes}));checks++;}
// Exhaustively check selection against the documented count domain, including rejected air cases.
let feasible=0;for(let n=1;n<=40;n++)for(let k=1;k<=30;k++){if(n*k>400)continue;const s=ugScenario(p,r.basis,'combined',n,k);if(s.meetsMargin){feasible++;ok(s.eac>=r.combined.eac-1e-7);}}
console.log('PASS:',checks,'checks; feasible combined compositions:',feasible);
const {decodeUGProject}=await import('./ug-fleet-engine.mjs');
const saved=JSON.stringify({version:'ug-fleet-1.0',parameters:p,meta:{name:'Тестовый рудник',country:'Грузия',method:'Test',airBasis:'Illustrative',kind:'project'}});
const restored=decodeUGProject('\uFEFF'+saved);assert.deepEqual(restored.parameters,p);assert(restored.meta.kind==='project');
assert.throws(()=>decodeUGProject(saved.replace('ug-fleet-1.0','wrong')));
assert.throws(()=>decodeUGProject(JSON.stringify({version:'ug-fleet-1.0',parameters:{...p,lhdAir:0,airFactor:0}})));
console.log('PASS: JSON round trip, UTF-8 BOM, version and parameter validation');
