# Underground fleet comparison, version 1.0

Public page: `../underground-fleet.html`. Anonymous illustrative diesel equipment and fictional prices; this is a preliminary planning model, not equipment certification or a mine design.

## Model

Compares direct LHD haulage over the full route with a short LHD shuttle feeding underground trucks. Loose density is in-situ density divided by swell. Loads are limited by both rated payload and usable volume. Whole LHD passes fill each truck; the final pass may be partial but retains a full shuttle cycle. Truck service includes the LHD return after the final pass, conservatively.

Each combined group has one LHD and k trucks. Group output is truck payload times 60 divided by max(service time, truck cycle / k). Queue time appears after loader saturation. All machines share a synchronized effective operating clock: calendar hours × availability × utilization. This is not a stochastic availability or traffic simulation. Direct fleets are limited to 100 LHDs; combined search considers 1–40 groups, 1–30 trucks per group, and at most 400 trucks. The selected feasible composition minimizes equivalent annual cost while meeting annual ore plus waste and the input capacity margin. No standby machines are included.

Static checks cover transport width/height, user clearance allowances, outer turning radius, absolute grades, dumping height and transfer reach. They do not model swept paths, intersections, traffic, braking or stability. Speeds are user inputs for the route conditions.

Air per machine is max(user flow, rated power × user coefficient). All selected machines operate simultaneously in one ventilation circuit, plus other demand. Availability/utilization do not reduce air requirements. The default coefficient is illustrative, not a jurisdictional standard. Heat, gas, dust, DPM and network calculations are excluded. A fleet failing these input air or geometric checks is excluded from cost selection; constrained actual production and operating costs are left undefined.

Purchased CAPEX is paid at year zero. Annual cash OPEX includes active group cycle hours, fuel, hourly other costs, wages for all staffed calendar machine-hours and annual fixed costs. EAC annualizes CAPEX plus recurring OPEX minus discounted end-of-horizon salvage. Zero discount is supported. No replacements, inflation, tax, infrastructure, transfer facilities, ventilation energy, drilling, blasting or processing are included. This is not mine NPV/IRR.

All calculations run locally in the browser. Contact links prepare a user-reviewed message; they do not send automatically. HTML reports escape client text. JSON import validates the format/version and numeric parameters and accepts a UTF-8 BOM.

## Rebuild and verify

From repository root:

```sh
python verification/build-ug-fleet.py
node verification/ug-fleet-test.mjs
python verification/ug-fleet-independent.py
```

The build also refreshes navigation in existing tools. Test suite: 48 checks, including exhaustive feasible combined compositions for the control example, ventilation and geometric exclusions, saturation, zero interest, load limits and JSON validation. Independent Python recomputes cycles, capacities, hours, air, CAPEX, cash OPEX, discounted costs and EAC for both schemes.

Default arithmetic benchmark: 1,000,000 t/year, 4,207.5 effective hours/year; direct fleet 10 LHDs, 130 m³/s including other demand, EAC 4.480731606 USD/t; combined fleet 1 LHD + 3 trucks, 82 m³/s, EAC 2.082054485 USD/t. These results reflect the illustrative assumptions only and are not a real equipment recommendation.
