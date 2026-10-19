# Engineering demos — verification and scope

Two browser-local tools: stope economics (Au or Cu) and homogeneous dump slope screening (Bishop Simplified). Existing rock-slope demo remains available.

## Reproduce checks

From the repository root, use Node.js 20+ and Python 3 with scipy installed:

```
python verification/build.py
node verification/test.mjs
python verification/independent_check.py
```

The builder reads `verification/engines.mjs` and writes the two self-contained root HTML pages. No packages are needed by visitors. Tests create `verification-input.json` for the independent Python root-solver check. `verification-summary.json` contains the independently calculated results of the release checks; it is not a design certification.

## Arithmetic conventions

- Rectangular stope is uniformly filled with ore before mining loss; loss has the same grade.
- Dilution is zero-grade waste / total ROM by mass. Mining and processing rates are per ROM tonne.
- Au grade is g/t and price USD/troy oz; 31.1034768 g/troy oz. Cu grade is percent and price USD/t metal.
- Metallurgical recovery and payable share are distinct. Backfill volume equals calculated excavated ore volume plus waste volume.
- Development and other assigned costs must exclude amounts already included in tonne rates. Cash margin has no taxes, royalties, financing, time axis or discounting; it is not project NPV.

## Bishop checks

The solver uses midpoint base inclination and pore pressure, exact circular-segment integration of slice area, and uniform supplied bulk unit weight. Static conditions only. Piezometric elevation decreases linearly from crest to toe. Added boundaries at crest/toe avoid integration across terrain corners. Water surcharge and external ponding are absent.

Published benchmark: Rocscience Slide2 Hand Calculation 1 (dry) and 2 (wet), Table 1/3, equation (6). The 7 tabulated slices produce F=2.112942662 and F=1.555196433 with tight numerical convergence, checked separately with scipy.brentq. The manuals report rounded answers 2.113 and 1.553 and a 0.005 iteration tolerance. Differences are shown explicitly and compared with that declared tolerance; the wet answer is not an exact match to three decimals.

Sources:
- https://static.rocscience.cloud/assets/verification-and-theory/Slide2/Hand-Calculation-1-Simple-Homogeneous-Dry-Slope.pdf
- https://static.rocscience.cloud/assets/verification-and-theory/Slide2/Hand-Calculation-2-Simple-Homogeneous-Wet-Slope.pdf

Search is a bounded grid plus local refinement over circular surfaces. Passing a slice benchmark does not independently validate the search. The program discloses search bounds and exclusion counts. Mesh comparisons hold circle geometry fixed. If refined slices show tensile effective normals or mesh change exceeds 0.5%, the result is HOLD. High cohesion, weak/heterogeneous foundations, seismic loading, liquefaction, tension cracks and noncircular mechanisms need a more complete model.

No jurisdiction-specific design compliance or universal acceptance FoS is claimed. The user chooses a screening criterion. No data are transmitted by the calculators; the contact action opens an email client.
