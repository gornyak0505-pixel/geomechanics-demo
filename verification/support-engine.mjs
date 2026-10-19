export function support(p){
 const range=(k,a,b)=>{if(!Number.isFinite(p[k])||p[k]<a||p[k]>b)throw Error(`Поле ${k}: допустимо ${a}…${b}`);};
 for(const [k,a,b] of [['rqd',0,100],['jn',.5,60],['jr',.5,4],['ja',.75,20],['jw',.05,1],['srf',.5,400],['span',1,30],['wall',0,30],['length',1,10000],['esr',.5,5],['rebound',0,60],['boltRate',0,10000],['concreteRate',0,10000],['meshRate',0,1000],['requiredSpace',.3,5],['requiredLength',1,15],['requiredThickness',0,500]])range(k,a,b);
 const Q=Math.max(10,p.rqd)/p.jn*p.jr/p.ja*p.jw/p.srf;
 // Category C permanent mine openings; Q <= 0.1 -> ESR 1, NGI section 4.1.
 const esr=p.permanent&&Q<=.1?1:p.esr;
 const De=Math.max(p.span,p.wall)/esr, Dw=p.wall/esr;
 // Wall Q reduction intentionally not applied: uniform support and actual Q throughout.
 const crown=Math.PI*p.span/2, perimeter=crown+2*p.wall, area=perimeter*p.length;
 const hold=Q<1||p.challenging||Q>1000||Q<.001||De<1||De>100;
 const options=['a','b'].map(k=>{
 for(const [s,a,b] of [['Space',.3,5],['Length',1,15],['Thickness',0,500]])range(k+s,a,b);
 // Conservative take-off: integer anchors in each perimeter row, end rows included.
 const perRow=Math.ceil(perimeter/p[k+'Space']);
 const rows=Math.ceil(p.length/p[k+'Space'])+1;
 const bolts=perRow*rows, boltMetres=bolts*p[k+'Length'];
 const installed=area*p[k+'Thickness']/1000, supplied=installed/(1-p.rebound/100);
 const mesh=p[k+'Mesh']?area*1.1:0;
 const cost=boltMetres*p.boltRate+supplied*p.concreteRate+mesh*p.meshRate;
 const meets=p[k+'Space']<=p.requiredSpace&&p[k+'Length']>=p.requiredLength&&p[k+'Thickness']>=p.requiredThickness;
 return {name:k.toUpperCase(),perRow,rows,bolts,boltMetres,installed,supplied,mesh,cost,costPerMetre:cost/p.length,meets,eligible:meets&&p.confirmed&&!hold};
 });
 const eligible=options.filter(o=>o.eligible).sort((a,b)=>a.cost-b.cost);
 return {Q,esr,De,Dw,crown,perimeter,area,hold,options,best:eligible[0]?.name??null};
}
