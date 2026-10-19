export const ugDefaults={ore:600000,waste:400000,rho:2.6,swell:1.4,days:330,shifts:2,hours:10,availability:85,utilization:75,margin:10,shortM:50,longKm:1.45,shortGrade:0,longGrade:10,lhdLoaded:8,lhdEmpty:10,truckLoaded:12,truckEmpty:18,bucket:6,fill:95,lhdPayload:12,truckPayload:30,body:18,fillSec:40,lhdDumpSec:25,directDelay:1,transferDelay:.05,truckSpot:.5,truckDump:1,truckDelay:1,clearW:4.5,clearH:4.5,sideGap:.35,topGap:.3,availableR:8,transferH:4.8,finalDumpH:6,lhdW:2.5,lhdH:2.4,lhdR:6.5,lhdGrade:18,lhdReach:3.6,lhdRaised:4,truckW:2.8,truckH:2.8,truckR:7.5,truckGrade:15,truckLoadingH:3,truckRaised:5.5,dropGap:.3,availableAir:140,otherAir:10,lhdPower:150,truckPower:300,lhdAir:12,truckAir:20,airFactor:.06,lhdFuel:25,truckFuel:32,lhdOther:30,truckOther:35,lhdPrice:650000,truckPrice:850000,fuelPrice:1.1,wage:20,fixedPct:2,years:8,discount:8,salvage:20};
export function validateUG(p){
 for(const k of Object.keys(ugDefaults))if(!Number.isFinite(p[k]))throw Error('Заполните числовое поле: '+k);
 const ck=(k,a,b,int=false)=>{if(p[k]<a||p[k]>b||(int&&!Number.isInteger(p[k])))throw Error(`Поле ${k}: ${a}…${b}${int?', целое число':''}`);};
 ck('ore',0,1e8);ck('waste',0,1e8);if(p.ore+p.waste<=0)throw Error('Годовая масса должна быть больше нуля.');ck('rho',.5,6);ck('swell',1,2.5);ck('days',1,365,true);ck('shifts',1,3,true);ck('hours',1,12);if(p.shifts*p.hours>24)throw Error('Суммарно не более 24 часов в сутки.');
 for(const k of ['availability','utilization'])ck(k,1,100);ck('margin',0,50);ck('shortM',1,1000);ck('longKm',.01,15);ck('shortGrade',-25,25);ck('longGrade',-25,25);
 for(const k of ['lhdLoaded','lhdEmpty','truckLoaded','truckEmpty'])ck(k,.5,40);
 ck('bucket',.1,30);ck('fill',1,120);ck('lhdPayload',1,40);ck('truckPayload',1,100);ck('body',1,100);ck('fillSec',5,180);ck('lhdDumpSec',2,180);
 for(const k of ['directDelay','transferDelay','truckSpot','truckDelay'])ck(k,0,60);ck('truckDump',.1,30);
 for(const k of ['clearW','clearH','transferH','finalDumpH'])ck(k,1,15);ck('sideGap',0,2);ck('topGap',0,2);ck('availableR',1,30);ck('dropGap',0,2);
 for(const k of ['lhdW','lhdH','lhdReach','lhdRaised','truckW','truckH','truckLoadingH','truckRaised'])ck(k,.5,12);
 for(const k of ['lhdR','truckR'])ck(k,1,20);for(const k of ['lhdGrade','truckGrade'])ck(k,0,30);
 ck('availableAir',0,1000);ck('otherAir',0,1000);ck('airFactor',0,1);for(const k of ['lhdPower','truckPower'])ck(k,10,1500);for(const k of ['lhdAir','truckAir'])ck(k,0,150);
 if(Math.max(p.lhdAir,p.airFactor*p.lhdPower)<=0||Math.max(p.truckAir,p.airFactor*p.truckPower)<=0)throw Error('Задайте положительную потребность в воздухе для каждого типа машины.');
 for(const k of ['lhdFuel','truckFuel'])ck(k,0,500);for(const k of ['lhdOther','truckOther'])ck(k,0,1000);for(const k of ['lhdPrice','truckPrice'])ck(k,1000,1e7);
 ck('fuelPrice',0,10);ck('wage',0,300);ck('fixedPct',0,30);ck('years',1,20,true);ck('discount',0,30);ck('salvage',0,80);
}
const ugCeil=x=>Math.ceil(x-1e-10);
export function ugBasis(p){
 const target=p.ore+p.waste,calendar=p.days*p.shifts*p.hours,effective=calendar*p.availability/100*p.utilization/100,rhoLoose=p.rho/p.swell;
 const lhdLoad=Math.min(p.lhdPayload,p.bucket*p.fill/100*rhoLoose),truckLoad=Math.min(p.truckPayload,p.body*rhoLoose),passes=ugCeil(truckLoad/lhdLoad);
 const shortTravel=60*p.shortM/1000*(1/p.lhdLoaded+1/p.lhdEmpty),directTravel=60*(p.shortM/1000+p.longKm)*(1/p.lhdLoaded+1/p.lhdEmpty);
 const directCycle=p.fillSec/60+p.lhdDumpSec/60+directTravel+p.directDelay;
 const shuttleCycle=p.fillSec/60+p.lhdDumpSec/60+shortTravel+p.transferDelay;
 const truckLoading=passes*shuttleCycle+p.truckSpot,truckTravel=60*p.longKm*(1/p.truckLoaded+1/p.truckEmpty),truckCycle=truckLoading+truckTravel+p.truckDump+p.truckDelay;
 const directRate=lhdLoad*60/directCycle,airLHD=Math.max(p.lhdAir,p.airFactor*p.lhdPower),airTruck=Math.max(p.truckAir,p.airFactor*p.truckPower);
 const rate=p.discount/100,pvf=rate===0?p.years:-Math.expm1(-p.years*Math.log1p(rate))/rate,capitalFactor=(1-p.salvage/100/(1+rate)**p.years)/pvf;
 return {target,calendar,effective,rhoLoose,lhdLoad,truckLoad,passes,shortTravel,directTravel,directCycle,shuttleCycle,truckLoading,truckTravel,truckCycle,directRate,airLHD,airTruck,pvf,capitalFactor};
}
export function ugChecks(p,mode){
 const near=(a,b)=>a<=b+1e-9,rows=[];const add=(name,needed,available,unit)=>rows.push({name,needed,available,unit,ok:near(needed,available)});
 add('ПДМ: ширина с двумя зазорами',p.lhdW+2*p.sideGap,p.clearW,'м');add('ПДМ: транспортная высота с зазором',p.lhdH+p.topGap,p.clearH,'м');add('ПДМ: наружный радиус поворота',p.lhdR,p.availableR,'м');
 add('ПДМ: модуль уклона',mode==='direct'?Math.max(Math.abs(p.shortGrade),Math.abs(p.longGrade)):Math.abs(p.shortGrade),p.lhdGrade,'%');
 add('ПДМ: рабочая высота при разгрузке',p.lhdRaised+p.topGap,mode==='direct'?p.finalDumpH:p.transferH,'м');
 if(mode==='combined'){
 add('Самосвал: ширина с двумя зазорами',p.truckW+2*p.sideGap,p.clearW,'м');add('Самосвал: транспортная высота с зазором',p.truckH+p.topGap,p.clearH,'м');add('Самосвал: наружный радиус поворота',p.truckR,p.availableR,'м');add('Самосвал: модуль уклона',Math.abs(p.longGrade),p.truckGrade,'%');add('Перегрузка: требуемая высота разгрузки ПДМ',p.truckLoadingH+p.dropGap,p.lhdReach,'м');add('Самосвал: поднятый кузов с зазором',p.truckRaised+p.topGap,p.finalDumpH,'м');
 }
 return rows;
}
export function ugScenario(p,b,mode,n,k=0){
 const q=mode==='direct'?b.directRate:b.truckLoad*60/Math.max(b.truckLoading,b.truckCycle/k),nTruck=mode==='direct'?0:n*k,capacity=n*q*b.effective;
 const airRequired=p.otherAir+n*b.airLHD+nTruck*b.airTruck,airOK=airRequired<=p.availableAir+1e-9,checks=ugChecks(p,mode),geometryOK=checks.every(r=>r.ok),withinLimits=mode==='direct'?n<=100:n<=40&&k<=30&&n*k<=400,eligible=airOK&&geometryOK&&withinLimits;
 const potential=Math.min(b.target,capacity),actual=eligible?potential:null,workHours=eligible?potential/q:null;
 const counts={lhd:n,truck:nTruck};const rows=['lhd','truck'].map(type=>{const number=counts[type],hours=workHours===null?null:type==='lhd'?workHours:workHours*k,capex=number*p[type+'Price'],labour=number*b.calendar*p.wage,fixed=capex*p.fixedPct/100,variable=hours===null?null:hours*(p[type+'Fuel']*p.fuelPrice+p[type+'Other']),cash=variable===null?null:variable+labour+fixed,capital=capex*b.capitalFactor;return {type,n:number,hours,capex,labour,fixed,variable,cash,capital,fuel:hours===null?null:hours*p[type+'Fuel']};});
 const capex=rows.reduce((s,r)=>s+r.capex,0),cash=eligible?rows.reduce((s,r)=>s+r.cash,0):null,annualCapital=capex*b.capitalFactor,eac=cash===null?null:cash+annualCapital;
 return {mode,nLHD:n,nTruck,k,q,capacity,potential,actual,shortfall:actual===null?null:Math.max(0,b.target-actual),airRequired,airOK,checks,geometryOK,withinLimits,eligible,meetsMargin:eligible&&capacity+1e-6>=b.target*(1+p.margin/100),workHours,extraQueue:mode==='combined'?Math.max(0,k*b.truckLoading-b.truckCycle):0,rows,capex,cash,annualCapital,eac,cashPerT:actual>0?cash/actual:null,eacPerT:actual>0?eac/actual:null,presentCost:eligible?eac*b.pvf:null};
}
export function calculateUG(p){
 validateUG(p);const b=ugBasis(p),required=b.target*(1+p.margin/100);let direct=null,combined=null,closestCombined=null;
 const directNeeded=ugCeil(required/(b.directRate*b.effective)),directCandidate=ugScenario(p,b,'direct',directNeeded);
 if(directNeeded<=100&&directCandidate.meetsMargin)direct=directCandidate;
 let searched=0,feasible=0;
 for(let n=1;n<=40;n++)for(let k=1;k<=30;k++){
 if(n*k>400)continue;searched++;
 const cap=n*b.truckLoad*60/Math.max(b.truckLoading,b.truckCycle/k)*b.effective;
 if(cap+1e-6<required)continue;
 const r=ugScenario(p,b,'combined',n,k);
 if(!closestCombined||r.airRequired<closestCombined.airRequired-1e-9||(Math.abs(r.airRequired-closestCombined.airRequired)<1e-9&&r.capex<closestCombined.capex))closestCombined=r;
 if(!r.meetsMargin)continue;feasible++;
 if(!combined||r.eac<combined.eac-1e-6||(Math.abs(r.eac-combined.eac)<1e-6&&r.capex<combined.capex))combined=r;
 }
 const candidates=[direct,combined].filter(Boolean).sort((a,b)=>a.eac-b.eac);
 return {basis:b,direct,combined,directCandidate,closestCombined,directNeeded,searched,feasible,best:candidates[0]?.mode??null};
}

export function decodeUGProject(text){
 const raw=JSON.parse(text.replace(/^\uFEFF/,''));
 if(raw.version!=='ug-fleet-1.0'||!raw.parameters)throw Error('Нужен JSON этой программы.');
 const parameters=Object.fromEntries(Object.keys(ugDefaults).map(k=>[k,raw.parameters[k]]));validateUG(parameters);
 const meta=raw.meta||{};return {parameters,meta:{name:typeof meta.name==='string'?meta.name.slice(0,100):'',country:typeof meta.country==='string'?meta.country.slice(0,100):'',method:typeof meta.method==='string'?meta.method.slice(0,200):'',airBasis:typeof meta.airBasis==='string'?meta.airBasis.slice(0,300):'',kind:meta.kind==='project'?'project':'demo'}};
}
