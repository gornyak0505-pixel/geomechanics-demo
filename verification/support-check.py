import math,json,subprocess
from pathlib import Path
p=dict(rqd=60,jn=9,jr=2,ja=2,jw=1,srf=1,span=5,wall=2,length=100,esr=1.6,permanent=True,rebound=15,boltRate=35,concreteRate=250,meshRate=12,requiredSpace=1.5,requiredLength=2.4,requiredThickness=75,aSpace=1.5,aLength=2.4,aThickness=75,aMesh=False,bSpace=1.2,bLength=3,bThickness=100,bMesh=True,confirmed=True,challenging=False)
js="import {support} from "+json.dumps((Path(__file__).parent/"support-engine.mjs").resolve().as_uri())+";console.log(JSON.stringify(support("+json.dumps(p)+")));"
r=json.loads(subprocess.check_output(['node','--input-type=module','-e',js]))
P=math.pi*2.5+4
for k,o in zip(['a','b'],r['options']):
 bolts=math.ceil(P/p[k+'Space'])*(math.ceil(100/p[k+'Space'])+1)
 concrete=P*100*p[k+'Thickness']/1000/.85
 mesh=P*100*1.1 if p[k+'Mesh'] else 0
 expected=bolts*p[k+'Length']*35+concrete*250+mesh*12
 assert o['bolts']==bolts
 assert abs(o['cost']-expected)<1e-8
print('PASS: independent Python material and cost check, options A and B')
print(json.dumps(r,ensure_ascii=False,indent=2))
