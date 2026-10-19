from pathlib import Path
import json,math,subprocess
root=Path(__file__).parent
js='import {ugDefaults as p,calculateUG} from '+json.dumps((root/'ug-fleet-engine.mjs').resolve().as_uri())+';console.log(JSON.stringify({p,r:calculateUG(p)}));'
z=json.loads(subprocess.check_output(['node','--input-type=module','-e',js]));p=z['p'];r=z['r']
target=p['ore']+p['waste'];rho=p['rho']/p['swell'];L=min(p['lhdPayload'],p['bucket']*p['fill']/100*rho);T=min(p['truckPayload'],p['body']*rho)
calendar=p['days']*p['shifts']*p['hours'];eff=calendar*p['availability']/100*p['utilization']/100
short=(p['shortM']/1000)*(1/p['lhdLoaded']+1/p['lhdEmpty'])*60+p['fillSec']/60+p['lhdDumpSec']/60+p['transferDelay']
direct=(p['shortM']/1000+p['longKm'])*(1/p['lhdLoaded']+1/p['lhdEmpty'])*60+p['fillSec']/60+p['lhdDumpSec']/60+p['directDelay']
service=math.ceil(T/L)*short+p['truckSpot'];cycle=service+60*p['longKm']*(1/p['truckLoaded']+1/p['truckEmpty'])+p['truckDump']+p['truckDelay']
pvf=sum((1+p['discount']/100)**(-y) for y in range(1,p['years']+1));out={}
for mode in ['direct','combined']:
 s=r[mode];n=s['nLHD'];k=s['k'];q=L*60/direct if mode=='direct' else T*60/max(service,cycle/k)
 capacity=n*q*eff;hours=target/q;truck_hours=hours*k
 capex=n*p['lhdPrice']+n*k*p['truckPrice'];cash=hours*(p['lhdFuel']*p['fuelPrice']+p['lhdOther'])+truck_hours*(p['truckFuel']*p['fuelPrice']+p['truckOther'])+(n+n*k)*calendar*p['wage']+capex*p['fixedPct']/100
 air=p['otherAir']+n*max(p['lhdAir'],p['lhdPower']*p['airFactor'])+n*k*max(p['truckAir'],p['truckPower']*p['airFactor'])
 pv=capex+cash*pvf-capex*p['salvage']/100/(1+p['discount']/100)**p['years'];eac=pv/pvf
 for a,b in [(s['capacity'],capacity),(s['cash'],cash),(s['capex'],capex),(s['airRequired'],air),(s['eac'],eac),(s['presentCost'],pv)]:assert math.isclose(a,b,rel_tol=1e-11),(mode,a,b)
 assert capacity>=target*(1+p['margin']/100)
 out[mode]=dict(lhd=n,trucks=n*k,capacity_tpy=capacity,air_m3s=air,cash_USD_per_t=cash/target,EAC_USD_per_t=eac/target)
print('PASS: independent Python cycles, payloads, capacities, hours, ventilation, CAPEX, OPEX, PV and EAC for both schemes')
print(json.dumps(out,indent=2))
