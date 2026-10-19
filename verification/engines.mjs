// Transparent, browser-local engineering screening engines. SI units; no network dependencies.
export function economics(p){
 for(const [k,v] of Object.entries(p))if(typeof v==='number'&&!Number.isFinite(v))throw Error('Некорректное число: '+k);
 for(const k of ['length','width','height','density','wasteDensity','price'])if(!(p[k]>0))throw Error('Требуется '+k+' > 0');
 for(const k of ['grade','mining','processing','backfill','devLength','devRate','fixed'])if(!(p[k]>=0))throw Error('Требуется '+k+' ≥ 0');
 for(const k of ['loss','dilution'])if(!(p[k]>=0&&p[k]<100))throw Error((k==='loss'?'Потери':'Разубоживание')+': требуется 0 ≤ значение < 100%');
 for(const k of ['recovery','payability'])if(!(p[k]>0&&p[k]<=100))throw Error((k==='recovery'?'Извлечение':'Оплата металла')+': требуется 0 < значение ≤ 100%');
 if(!['Au','Cu'].includes(p.metal))throw Error('Неизвестный металл');
 if(p.metal==='Cu'&&p.grade>100)throw Error('Содержание Cu не может превышать 100%');
 if(Math.max(p.length,p.width,p.height)>10000||Math.max(p.density,p.wasteDensity)>30||Math.max(p.grade,p.price,p.mining,p.processing,p.backfill,p.devLength,p.devRate,p.fixed)>1e10)throw Error('Параметры превышают диапазон демонстрационной модели');
 const volume=p.length*p.width*p.height,ore=volume*p.density,lost=ore*p.loss/100,recoveredOre=ore-lost,d=p.dilution/100,waste=recoveredOre*d/(1-d),rom=recoveredOre+waste;
 const unit=p.metal==='Au'?1/31.1034768:1/100,contained=recoveredOre*p.grade*unit,metal=contained*p.recovery/100,payable=metal*p.payability/100,revenue=payable*p.price;
 const excavation=recoveredOre/p.density+waste/p.wasteDensity,variable=rom*(p.mining+p.processing)+excavation*p.backfill,development=p.devLength*p.devRate,assigned=development+p.fixed,cost=variable+assigned,margin=revenue-cost,romGrade=p.grade*recoveredOre/rom;
 const denominator=recoveredOre*unit*(p.recovery/100)*(p.payability/100)*p.price,breakEvenGrade=cost/denominator;
 const costPerWaste=p.mining+p.processing+p.backfill/p.wasteDensity,available=revenue-recoveredOre*(p.mining+p.processing+p.backfill/p.density)-assigned;
 const maxWaste=costPerWaste>0?available/costPerWaste:null,maxDilution=available<0?null:maxWaste===null?100:100*maxWaste/(recoveredOre+maxWaste);
 return {volume,ore,lost,recoveredOre,waste,rom,excavation,contained,metal,payable,revenue,variable,development,assigned,cost,margin,romGrade,breakEvenGrade,maxDilution,massResidual:ore-recoveredOre-lost,romResidual:rom-recoveredOre-waste};
}
export function bishop(slices,c,phi,tolerance=1e-9){
 const t=Math.tan(phi*Math.PI/180),drive=slices.reduce((a,s)=>a+s.W*Math.sin(s.alpha),0);
 if(!(drive>1e-10))return null;
 if(c===0&&t===0)return {F:0,iterations:0,residual:0,tension:false,drive};
 const rhs=F=>{let sum=0;for(const s of slices){let m=Math.cos(s.alpha)+Math.sin(s.alpha)*t/F;if(!(m>1e-7))return NaN;sum+=(c*s.b+(s.W-s.u*s.b)*t)/m;}return sum/drive;};
 let F=2,it=0;
 for(;it<300;it++){const next=rhs(F);if(!(next>0&&Number.isFinite(next)))return null;if(Math.abs(next-F)<tolerance*Math.max(1,next)){F=next;break;}F=.5*(F+next);}
 if(it===300)return null;
 const residual=F-rhs(F);if(Math.abs(residual)>1e-6*Math.max(1,F))return null;
 let tension=false,minNormal=Infinity;for(const s of slices){const m=Math.cos(s.alpha)+Math.sin(s.alpha)*t/F;const N=(s.W-s.u*s.b-c*s.b*Math.tan(s.alpha)/F)/m;minNormal=Math.min(minNormal,N);if(N< -1e-7)tension=true;}
 return {F,iterations:it+1,residual,tension,minNormal,drive};
}
export function terrain(x,p){const B=p.H/Math.tan(p.beta*Math.PI/180);return x<=0?p.H:x>=B?0:p.H*(1-x/B);}
export function water(x,p){const B=p.H/Math.tan(p.beta*Math.PI/180);return x<=0?p.H*p.water/100:x>=B?0:p.H*p.water/100*(1-x/B);}
export function circle(p,entry,exit,offset,n=80){
 const ya=terrain(entry,p),yb=terrain(exit,p),dx=exit-entry,dy=yb-ya,L=Math.hypot(dx,dy);if(!(dx>p.H*.1&&offset>0))return null;
 const xc=(entry+exit)/2-offset*dy/L,yc=(ya+yb)/2+offset*dx/L,R=Math.hypot(L/2,offset);if(yc<Math.max(ya,yb))return null;
 const base=x=>yc-Math.sqrt(Math.max(0,R*R-(x-xc)**2));
 const primitive=x=>{const z=x-xc;return yc*x-.5*(z*Math.sqrt(Math.max(0,R*R-z*z))+R*R*Math.asin(Math.max(-1,Math.min(1,z/R))));};
 const B=p.H/Math.tan(p.beta*Math.PI/180),edges=Array.from({length:n+1},(_,i)=>entry+dx*i/n);for(const x of [0,B])if(x>entry+1e-9&&x<exit-1e-9)edges.push(x);edges.sort((a,b)=>a-b);
 const slices=[];let area=0;
 for(let i=0;i<edges.length-1;i++){const x1=edges[i],x2=edges[i+1],b=x2-x1;if(b<1e-8)continue;const x=(x1+x2)/2,z=base(x),top=terrain(x,p),zmin=base(Math.max(x1,Math.min(x2,xc)));if(zmin< -p.depth-1e-8||base(x1)>terrain(x1,p)+1e-7||base(x2)>terrain(x2,p)+1e-7||z>=top)return null;
 const A=b*(terrain(x1,p)+terrain(x2,p))/2-(primitive(x2)-primitive(x1));if(!(A>0))return null;
 const alpha=Math.asin(Math.max(-1,Math.min(1,(xc-x)/R))),u=9.81*Math.max(0,water(x,p)-z),Q=x<0?p.q*b:0;
 slices.push({x,x1,x2,b,z,top,area:A,W:p.gamma*A+Q,u,alpha});area+=A;
 }
 if(area<.002*p.H*p.H)return null;
 const result=bishop(slices,p.c,p.phi);if(!result)return null;
 return {...result,xc,yc,R,entry,exit,offset,area,slices,n:slices.length};
}
export function search(p,n=80){
 if(!(p.H>=1&&p.H<=200&&p.beta>=10&&p.beta<=60&&p.gamma>=10&&p.gamma<=35&&p.c>=0&&p.c<=100&&p.phi>=0&&p.phi<=55&&p.water>=0&&p.water<=80&&p.depth>=0&&p.depth<=p.H&&p.q>=0&&p.q<=500&&p.target>0))throw Error('Проверьте диапазоны параметров. Глубина однородного основания: 0…H.');
 const B=p.H/Math.tan(p.beta*Math.PI/180);let best=null,tested=0,converged=0,tensionCount=0;
 function test(a,b,t){tested++;const r=circle(p,a,b,t,n);if(!r)return;converged++;if(r.tension){tensionCount++;return;}if(!best||r.F<best.F)best=r;}
 for(let a=0;a<12;a++)for(let b=0;b<18;b++)for(let t=0;t<18;t++)test(-p.H*(.02+1.98*a/11),B*(.08+.92*b/17)+p.H*(b>14?(b-14)*.12:0),p.H*(.12+4.88*t/17));
 if(!best)return {best:null,tested,converged,tensionCount};
 let da=p.H*.18,db=(B+p.H*.36)/17,dt=p.H*.29;
 for(let pass=0;pass<4;pass++){const old=best;for(const ia of [-1,0,1])for(const ib of [-1,0,1])for(const it of [-1,0,1]){const a=old.entry+ia*da,b=old.exit+ib*db,t=old.offset+it*dt;if(a>=-2*p.H&&a<=-.005*p.H&&b>=.03*B&&b<=B+.5*p.H&&t>=.02*p.H&&t<=5*p.H)test(a,b,t);}da/=2;db/=2;dt/=2;}
 const boundary=best.entry< -1.95*p.H||best.exit>B+.45*p.H||best.offset>4.9*p.H||best.entry>-.01*p.H;
 return {best,tested,converged,tensionCount,boundary};
}
export function benchmarks(){const h=[.8,2.3,3.3,3.9,4.1,3.6,1.65],a=[-9,.5,9,18.5,28,39,52],u=[7.84,22.54,32.34,38.22,40.18,35.28,16.17];return [false,true].map(wet=>{const slices=h.map((v,i)=>({b:2.5,W:2.5*v*20,alpha:a[i]*Math.PI/180,u:wet?u[i]:0}));const r=bishop(slices,20,20);return {wet,actual:r?.F,expected:wet?1.553:2.113,pass:!!r&&Math.abs(r.F-(wet?1.553:2.113))<.005};});}
