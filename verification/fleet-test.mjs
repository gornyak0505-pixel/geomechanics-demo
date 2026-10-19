import assert from 'node:assert/strict';
import {fleetDefaults as defaults,calculateFleet,fleetBasis,evaluateFleet} from './fleet-engine.mjs';
const p={...defaults},r=calculateFleet(p);let checks=0;const ok=x=>{assert(x);checks++},close=(a,b,t=1e-8)=>ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)));
ok(r.auto.counts.exc===1&&r.auto.counts.truck===6&&r.auto.counts.dozer===1&&r.auto.counts.rig===1);
close(r.basis.load,60);ok(r.basis.passes===6);close(r.basis.cycle,23.094285714285714);ok(!r.base.meets&&r.auto.meets&&r.auto.meetsMargin);
close(r.auto.cashPerT,r.auto.cash/r.auto.actual);ok(r.auto.holes===6594&&r.auto.drillMetres===72534);
close(r.auto.presentCost,r.auto.eac*r.basis.pvFactor);
for(const scenario of [r.base,r.auto]){ok(scenario.actual<=scenario.capacity+1e-6);close(scenario.cash,scenario.rows.reduce((s,v)=>s+v.cash,0));for(const row of scenario.rows)ok(row.hours<=row.n*(row.type==='exc'||row.type==='truck'?r.basis.lhHours:r.basis.auxHours)+1e-6);}
let z=calculateFleet({...p,discount:0});close(z.auto.annualCapital,z.auto.capex*.8/p.years);
z=calculateFleet({...p,dozePct:0,drillPct:0});ok(z.auto.counts.dozer===0&&z.auto.counts.rig===0&&z.auto.drillMetres===0);
z=calculateFleet({...p,baseRig:0});ok(z.base.actual===0&&z.base.cashPerT===null&&!z.base.meets);
z=calculateFleet({...p,bucket:50});ok(z.auto===null&&z.reason==='BUCKET_EXCEEDS_LOAD');
z=calculateFleet({...p,body:20});close(z.basis.load,20*p.rho/p.swell);ok(z.basis.load<p.payload);
z=calculateFleet({...p,days:1,shifts:1,shiftHours:1,auxA:1,auxU:1,rop:.1});ok(z.auto===null&&z.reason==='NO_COMPLETE_HOLE');
z=calculateFleet({...p,baseK:20});ok(z.base.extraQueue>0);close(z.base.groupRate,60*z.basis.load/z.basis.loading);
z=calculateFleet({...p,d1:p.d1*2,d2:p.d2*2,d3:p.d3*2});ok(z.base.lhCap<r.base.lhCap);
for(const bad of [{ore:0,waste:0},{lhA:0},{shifts:3,shiftHours:10},{baseK:1.5},{payload:NaN},{swell:.9}]){assert.throws(()=>calculateFleet({...p,...bad}));checks++;}
// Independent exhaustive scan over the documented region: no feasible composition has lower annual cost.
let better=0,feasible=0;for(let e=1;e<=40;e++)for(let k=1;k<=60;k++){if(e*k>800)continue;const v=evaluateFleet(p,r.basis,{exc:e,k,dozer:1,rig:1});if(v.meetsMargin){feasible++;if(v.eac<r.auto.eac-1e-6)better++;}}
ok(feasible>0&&better===0);
console.log('PASS:',checks,'checks; feasible search candidates:',feasible);
