from pathlib import Path
import json,math,subprocess
root=Path(__file__).parent
code='import {fleetDefaults as p,calculateFleet} from '+json.dumps((root/'fleet-engine.mjs').resolve().as_uri())+';console.log(JSON.stringify({p,r:calculateFleet(p)}));'
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',code]));p=data['p'];r=data['r'];a=r['auto']
# Independent arithmetic in Python, using the exported input set only.
target=p['ore']+p['waste'];density=p['rho']/p['swell'];payload=min(p['payload'],p['body']*density)
bucket=p['bucket']*p['fill']/100*density;passes=math.ceil(payload/bucket);loading=passes*p['bucketSec']/60+p['spot']
cycle=loading+p['dump']+p['delay']+sum(60*p[f'd{i}']/p[f'vL{i}']+60*p[f'd{i}']/p[f'vE{i}'] for i in range(1,4))
clock=p['days']*p['shifts']*p['shiftHours'];lh=clock*p['lhA']/100*p['lhU']/100;aux=clock*p['auxA']/100*p['auxU']/100
assert abs(cycle-r['basis']['cycle'])<1e-10
Dcycle=60*p['push']/1000/p['pushV']+60*p['push']/1000/p['returnV']+p['turnSec']/60;Dq=p['blade']*p['bladeFill']/100*60/Dcycle
hole=p['bench']+p['sub'];hole_cycle=hole/p['rop']*60+p['setup'];holes_one=math.floor(aux*60/hole_cycle);vol=p['burden']*p['spacing']*p['bench']
qgroup=payload*60/max(loading,cycle/a['k']);caps=[a['counts']['exc']*qgroup*lh,a['counts']['dozer']*Dq*aux*density/(p['dozePct']/100),a['counts']['rig']*holes_one*vol*p['rho']/(p['drillPct']/100)]
actual=min(target,*caps);holes=math.ceil(actual/p['rho']*p['drillPct']/100/vol)
hours={'exc':actual/qgroup,'truck':actual/qgroup*a['k'],'dozer':actual/density*p['dozePct']/100/Dq,'rig':holes*hole_cycle/60}
capital=0;cash=0
for t,n in a['counts'].items():
 purchase=n*p[t+'Price'];capital+=purchase
 cash+=hours[t]*(p[t+'Fuel']*p['fuelPrice']+p[t+'Other'])+n*clock*p['wage']+purchase*p['fixedPct']/100
pvf=sum((1+p['discount']/100)**(-y) for y in range(1,p['years']+1));present=capital+cash*pvf-capital*p['salvage']/100/(1+p['discount']/100)**p['years']
for got,expected in [(a['actual'],actual),(a['cash'],cash),(a['capex'],capital),(a['presentCost'],present),(a['eac'],present/pvf)]:assert math.isclose(got,expected,rel_tol=1e-11),(got,expected)
assert a['holes']==holes
print('PASS: independent Python cycle, capacity, integer holes, hours, OPEX, CAPEX, PV and EAC checks')
print(json.dumps({'cycle_min':cycle,'V0_actual_tpy':r['base']['actual'],'V1_counts':a['counts'],'V1_actual_tpy':actual,'V1_OPEX_USDpy':cash,'V1_EAC_USDpy':present/pvf,'V1_CAPEX_USD':capital},indent=2))
