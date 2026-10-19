export const fleetDefaults={ore:1000000,waste:2000000,rho:2.6,swell:1.35,days:330,shifts:2,shiftHours:10,lhA:85,lhU:75,auxA:85,auxU:70,margin:10,bucket:6,fill:90,bucketSec:30,spot:.6,payload:60,body:35,d1:.8,vL1:20,vE1:30,g1:0,d2:1.2,vL2:12,vE2:25,g2:8,d3:1,vL3:25,vE3:35,g3:0,dump:1,delay:1.5,dozePct:30,blade:12,bladeFill:85,push:50,pushV:3,returnV:6,turnSec:18,drillPct:80,bench:10,burden:3.5,spacing:4,sub:1,rop:25,setup:5,diameter:115,baseExc:1,baseK:4,baseDozer:1,baseRig:1,fuelPrice:1.1,excFuel:65,truckFuel:35,dozerFuel:30,rigFuel:22,excOther:40,truckOther:35,dozerOther:20,rigOther:25,excPrice:900000,truckPrice:650000,dozerPrice:450000,rigPrice:700000,wage:20,fixedPct:2,years:8,discount:8,salvage:20};
export function validateFleet(p){
 for(const [k,v] of Object.entries(fleetDefaults))if(!Number.isFinite(p[k]))throw Error('Заполните числовое поле: '+k);
 const check=(k,a,b,integer=false)=>{if(p[k]<a||p[k]>b||(integer&&!Number.isInteger(p[k])))throw Error(`Поле ${k}: диапазон ${a}…${b}${integer?', целое число':''}`);};
 for(const k of ['ore','waste'])check(k,0,2e8);
 if(p.ore+p.waste<=0)throw Error('Суммарная годовая масса должна быть больше нуля.');
 check('rho',.5,6);check('swell',1,2.5);check('days',1,365,true);check('shifts',1,3,true);check('shiftHours',1,12);if(p.shifts*p.shiftHours>24)throw Error('Сумма смен не может превышать 24 часа в сутки.');
 for(const k of ['lhA','lhU','auxA','auxU'])check(k,1,100);
 check('margin',0,50);check('bucket',.1,100);check('fill',1,120);check('bucketSec',5,180);check('spot',0,20);check('payload',1,500);check('body',1,500);
 for(let i=1;i<=3;i++){check('d'+i,0,50);check('vL'+i,1,80);check('vE'+i,1,80);check('g'+i,-20,20);}
 if(p.d1+p.d2+p.d3<=0)throw Error('Длина маршрута должна быть больше нуля.');
 check('dump',.1,30);check('delay',0,60);
 check('dozePct',0,100);check('blade',.1,100);check('bladeFill',1,120);check('push',1,300);check('pushV',.1,15);check('returnV',.1,20);check('turnSec',1,300);
 check('drillPct',0,100);check('bench',1,30);check('burden',.5,15);check('spacing',.5,20);check('sub',0,5);check('rop',.1,200);check('setup',0,120);check('diameter',50,400);
 check('baseExc',1,40,true);check('baseK',1,60,true);check('baseDozer',0,100,true);check('baseRig',0,100,true);
 check('fuelPrice',0,10);for(const type of ['exc','truck','dozer','rig']){check(type+'Fuel',0,1500);check(type+'Other',0,1000);check(type+'Price',1000,3e7);}
 check('wage',0,300);check('fixedPct',0,30);check('years',1,20,true);check('discount',0,30);check('salvage',0,80);
}
const up=x=>Math.ceil(x-1e-10);
export function fleetBasis(p){
 const target=p.ore+p.waste,calendar=p.days*p.shifts*p.shiftHours,lhHours=calendar*p.lhA/100*p.lhU/100,auxHours=calendar*p.auxA/100*p.auxU/100;
 const looseRho=p.rho/p.swell,bucketMass=p.bucket*p.fill/100*looseRho,load=Math.min(p.payload,p.body*looseRho);
 const passes=up(load/bucketMass),loading=passes*p.bucketSec/60+p.spot;
 let travelLoaded=0,travelEmpty=0;for(let i=1;i<=3;i++){travelLoaded+=60*p['d'+i]/p['vL'+i];travelEmpty+=60*p['d'+i]/p['vE'+i];}
 const cycle=loading+travelLoaded+travelEmpty+p.dump+p.delay;
 const dozeCycle=60*p.push/1000/p.pushV+60*p.push/1000/p.returnV+p.turnSec/60;
 const dozeRate=p.blade*p.bladeFill/100*60/dozeCycle;
 const holeLength=p.bench+p.sub,bankPerHole=p.burden*p.spacing*p.bench,holeCycle=60*holeLength/p.rop+p.setup,holesPerRig=Math.floor(auxHours*60/holeCycle+1e-10);
 const i=p.discount/100,pvFactor=i===0?p.years:-Math.expm1(-p.years*Math.log1p(i))/i,capitalFactor=(1-p.salvage/100/(1+i)**p.years)/pvFactor;
 return {target,calendar,lhHours,auxHours,looseRho,bucketMass,load,passes,loading,travelLoaded,travelEmpty,cycle,dozeCycle,dozeRate,holeLength,bankPerHole,holeCycle,holesPerRig,pvFactor,capitalFactor,compatible:bucketMass<=load+1e-9};
}
export function evaluateFleet(p,b,c){
 const groupRate=b.load*60/Math.max(b.loading,b.cycle/c.k);
 const lhCap=c.exc*groupRate*b.lhHours;
 const dozeCap=p.dozePct>0?c.dozer*b.dozeRate*b.auxHours*b.looseRho/(p.dozePct/100):Infinity;
 const drillCap=p.drillPct>0?c.rig*b.holesPerRig*b.bankPerHole*p.rho/(p.drillPct/100):Infinity;
 const capacity=Math.min(lhCap,dozeCap,drillCap),actual=Math.min(b.target,capacity),shortfall=Math.max(0,b.target-actual);
 const counts={exc:c.exc,truck:c.exc*c.k,dozer:c.dozer,rig:c.rig};
 const groupHours=actual/groupRate;
 const dozeVolume=actual/b.looseRho*p.dozePct/100,holes=p.drillPct>0?up(actual/p.rho*p.drillPct/100/b.bankPerHole):0,drillMetres=holes*b.holeLength;
 const hours={exc:groupHours,truck:groupHours*c.k,dozer:dozeVolume/b.dozeRate,rig:holes*b.holeCycle/60};
 const rows=Object.keys(counts).map(type=>{const n=counts[type],capex=n*p[type+'Price'],fuel=hours[type]*p[type+'Fuel'],other=hours[type]*p[type+'Other'],labour=n*b.calendar*p.wage,fixed=capex*p.fixedPct/100,cash=fuel*p.fuelPrice+other+labour+fixed,annualCapital=capex*b.capitalFactor;return {type,n,hours:hours[type],fuel,other,labour,fixed,cash,annualCapital,capex,eac:cash+annualCapital};});
 const sum=k=>rows.reduce((s,r)=>s+r[k],0),capex=sum('capex'),cash=sum('cash'),annualCapital=sum('annualCapital'),eac=cash+annualCapital;
 return {counts,k:c.k,groupRate,lhCap,dozeCap,drillCap,capacity,actual,shortfall,meets:shortfall<=Math.max(1e-6,b.target*1e-12),meetsMargin:capacity+1e-6>=b.target*(1+p.margin/100),bottleneck:lhCap<=dozeCap&&lhCap<=drillCap?'loadhaul':dozeCap<=drillCap?'dozer':'drill',extraQueue:Math.max(0,c.k*b.loading-b.cycle),match:c.k*b.loading/b.cycle,dozeVolume,holes,drillMetres,rows,capex,cash,annualCapital,eac,cashPerT:actual>0?cash/actual:null,eacPerT:actual>0?eac/actual:null,presentCost:capex+cash*b.pvFactor-capex*p.salvage/100/(1+p.discount/100)**p.years};
}
export function calculateFleet(p){
 validateFleet(p);const b=fleetBasis(p),base=evaluateFleet(p,b,{exc:p.baseExc,k:p.baseK,dozer:p.baseDozer,rig:p.baseRig});
 if(!b.compatible)return {basis:b,base,auto:null,searched:0,reason:'BUCKET_EXCEEDS_LOAD'};
 const planned=b.target*(1+p.margin/100);
 const dozer=p.dozePct>0?up(planned/b.looseRho*p.dozePct/100/(b.dozeRate*b.auxHours)):0;
 const plannedHoles=p.drillPct>0?up(planned/p.rho*p.drillPct/100/b.bankPerHole):0;
 if(plannedHoles>0&&b.holesPerRig===0)return {basis:b,base,auto:null,searched:0,reason:'NO_COMPLETE_HOLE'};
 const rig=plannedHoles>0?up(plannedHoles/b.holesPerRig):0;
 if(dozer>100||rig>100)return {basis:b,base,auto:null,searched:0,reason:'AUX_LIMIT'};
 let auto=null,searched=0;
 for(let exc=1;exc<=40;exc++)for(let k=1;k<=60;k++){
 if(exc*k>800)continue;searched++;
 if(exc*b.load*60/Math.max(b.loading,b.cycle/k)*b.lhHours+1e-6<planned)continue;
 const candidate=evaluateFleet(p,b,{exc,k,dozer,rig});
 if(!candidate.meetsMargin)continue;
 if(!auto||candidate.eac<auto.eac-1e-6||(Math.abs(candidate.eac-auto.eac)<1e-6&&candidate.capex<auto.capex))auto=candidate;
 }
 return {basis:b,base,auto,searched,reason:auto?null:'SEARCH_LIMIT'};
}
