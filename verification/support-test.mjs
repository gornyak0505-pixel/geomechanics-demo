import assert from 'node:assert/strict';
import {support} from './support-engine.mjs';
const p={rqd:60,jn:9,jr:2,ja:2,jw:1,srf:1,span:5,wall:2,length:100,esr:1.6,permanent:true,rebound:15,boltRate:35,concreteRate:250,meshRate:12,requiredSpace:1.5,requiredLength:2.4,requiredThickness:75,aSpace:1.5,aLength:2.4,aThickness:75,aMesh:false,bSpace:1.2,bLength:3,bThickness:100,bMesh:true,confirmed:false,challenging:false};
let n=0;const check=(v)=>{assert(v);n++};
let r=support(p);check(Math.abs(r.Q-20/3)<1e-12);check(r.De===3.125);check(r.best===null);check(r.options[0].bolts===544);check(Math.abs(r.options[0].supplied-104.5939555938925)<1e-8);
check(support({...p,confirmed:true}).best==='A');check(support({...p,confirmed:true,challenging:true}).best===null);
check(support({...p,rqd:0}).Q===support({...p,rqd:10}).Q);
r=support({...p,rqd:10,jn:20,jr:.5,ja:20,jw:.05,srf:400});check(r.esr===1&&r.hold&&r.best===null);
check(support({...p,wall:8}).De===5);check(support({...p,length:1}).options[0].rows===2);
check(support({...p,requiredSpace:1}).options.every(o=>!o.meets));
for(const k of ['aSpace','bLength','srf']){assert.throws(()=>support({...p,[k]:0}));n++;}
check(support({...p,rebound:30}).options[0].supplied>support(p).options[0].supplied);
console.log(`PASS: ${n} checks`);
