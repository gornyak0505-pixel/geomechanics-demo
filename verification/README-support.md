# Underground Support — version 1.0, 2026-10-19

Browser-only assisted Q-system assessment and support quantity/cost comparison. No data leaves the page. Build: `python verification/build-support.py`. Tests: `node verification/support-test.mjs` and `python verification/support-check.py` from repository root.

Method source: NGI, Using the Q-system, April 2025:
https://www.ngi.no/globalassets/bilder/forskning-og-radgivning/bygg-og-anlegg/q-handbook_2025_english_final.pdf
Sections 2, 3.2/Table 3-1, 4.1/Table 4-1, 4.2/Figure 4-1, 4.2.2, 1.4, 4.7.

Q and equivalent dimensions are calculated. Required bolt spacing/length and Sfr thickness MUST be read and confirmed by an engineer; initial dimensions are illustrative, NOT an automated interpretation of the NGI chart. Actual Q is used throughout; no wall Q reduction. Uniform crown and wall support. Squeezing, swelling, dynamics and other flagged challenges, Q<1 or outside the app viewing range suppress selection. Q is not a factor of safety. A checked confirmation does not substitute for structural or capacity calculations.

Geometry: semicircular crown plus straight vertical walls. Wall-height input means straight wall height, not total excavation height. Crown De uses max(span,wall height). ESR forced to 1 for category C if Q<=0.1. RQD floor=10. Parameters are entered after field classification; Jn correction must already be included.

Take-off: anchors per row=ceil(supported perimeter/spacing), rows=ceil(length/spacing)+1, including end rows. Uniform thin-layer Sfr, no floor support. Supply includes specified rebound as fraction of supplied material; mesh includes illustrative 10% overlap. Cost includes installed anchor metres, supplied Sfr and optional installed mesh only. No claim of certified support design, exact bill of quantities or full construction budget.

Validation: 16 Node assertions (Q, RQD floor, ESR override, height rule, quantities, requirements, unconfirmed/challenging HOLD, invalid data); independent Python volume/anchor/cost calculation for A and B. Demo: Q=6.6666666667, De=3.125, 1185.3981634 m². A=544 anchors, 104.5939556 m³ supplied Sfr, USD718.444889/m; B=850 anchors,139.4586075 m³,USD1397.619076/m. These verify arithmetic, not adequacy of example support. Existing economics and dump tests also pass.
