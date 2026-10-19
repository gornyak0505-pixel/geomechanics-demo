import json,math
from pathlib import Path
from scipy.optimize import brentq
root=Path(__file__).parent
d=json.loads((root/'verification-input.json').read_text());p=d['p'];actual=d['economics']
# Independent scalar arithmetic, not calls to the JS engine.
ore=p['length']*p['width']*p['height']*p['density'];recovered=ore*(1-p['loss']/100);rom=recovered/(1-p['dilution']/100);waste=rom-recovered
revenue=recovered*p['grade']/31.1034768*p['recovery']/100*p['payability']/100*p['price']
cost=rom*(p['mining']+p['processing'])+(recovered/p['density']+waste/p['wasteDensity'])*p['backfill']+p['devLength']*p['devRate']+p['fixed']
assert abs(actual['margin']-(revenue-cost))<1e-6
s=d['slices'];c=d['dump']['c'];t=math.tan(math.radians(d['dump']['phi']));drive=sum(v['W']*math.sin(v['alpha']) for v in s)
def residual(F):
 return sum((c*v['b']+(v['W']-v['u']*v['b'])*t)/(math.cos(v['alpha'])+math.sin(v['alpha'])*t/F) for v in s)-F*drive
F=brentq(residual,.5,3,xtol=1e-12)
assert abs(F-d['bishop'])<1e-8
# The tabulated wet example answer is rounded and has a 0.005 declared tolerance.
bench=[]
for wet in (False,True):
 W=[40,115,165,195,205,180,82.5];a=list(map(math.radians,[-9,.5,9,18.5,28,39,52]));u=[7.84,22.54,32.34,38.22,40.18,35.28,16.17] if wet else [0]*7;tf=math.tan(math.radians(20))
 def g(F):return sum((50+(w-uu*2.5)*tf)/(math.cos(aa)+math.sin(aa)*tf/F) for w,uu,aa in zip(W,u,a))-F*sum(w*math.sin(aa) for w,aa in zip(W,a))
 out=brentq(g,1,3,xtol=1e-12);assert abs(out-d['benchmarks'][int(wet)]['actual'])<1e-8;bench.append(out)
report={'status':'PASS','independent_method':'Python scalar material balance and scipy brentq root solver','stope_margin_USD':revenue-cost,'critical_circle_FoS':F,'critical_circle_difference':F-d['bishop'],'published_slices_independent_FoS':bench,'limits':'Benchmark verifies the slice solver. Critical surface search is bounded; not a certified design analysis.'}
(root/'verification-summary.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
