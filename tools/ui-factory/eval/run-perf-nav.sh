#!/bin/bash
# Evaluador: navegación (baseline.js SECTIONS=nav,load) y rendimiento A/B + fugas, en serie para no competir por CPU.
cd /home/user/La-Horda; E=docs/ui-factory/evidence/eval1
for pair in "cand:/home/user/La-Horda" "base:/tmp/uf-baseline"; do L=${pair%%:*}; D=${pair#*:}
  PHASE=eval-$L BASE_DIR=$D OUT_DIR=$E/nav-$L SECTIONS=nav node tools/ui-factory/baseline.js > /tmp/nav-$L.out 2>&1
done
MODE=ab REPS=3 OUT=$E/perf-ab.json node tools/ui-factory/eval/eval-perf.js > /tmp/perf-ab.out 2>&1
MODE=leak OUT=$E/perf-leak.json node tools/ui-factory/eval/eval-perf.js > /tmp/perf-leak.out 2>&1
echo ALLDONE > /tmp/perfnav.done
