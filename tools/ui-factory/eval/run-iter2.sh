#!/bin/bash
# Evaluador iteración 2: rendimiento (A/B + fugas), luego suites tools/ux, regresión (snapshot, drag_aim, det base-vs-base y antes-vs-despues).
cd /home/user/La-Horda; E=docs/ui-factory/evidence/eval2; R=$E/regression; mkdir -p $R $E/suites
MODE=ab REPS=3 OUT=$E/perf-ab.json node tools/ui-factory/eval/eval-perf.js > /tmp/perf2-ab.out 2>&1
MODE=leak OUT=$E/perf-leak.json node tools/ui-factory/eval/eval-perf.js > /tmp/perf2-leak.out 2>&1
echo perfdone > /tmp/iter2.perf
python3 tools/regression/build_site.py /home/user/La-Horda /tmp/uf-sites/despues > /dev/null 2>&1
cd tools/regression
mkdir -p ../../$R/antes2 ../../$R/despues ../../$R/antes
(timeout 1700 node t_det.js antes ../../$R/antes2 > ../../$R/t_det-antes2.log 2>&1; echo "t_det antes2(base repetida) rc=$?" >> ../../$R/summary.txt) &
(timeout 1700 node t_det.js despues ../../$R/despues > ../../$R/t_det-despues.log 2>&1; echo "t_det despues rc=$?" >> ../../$R/summary.txt) &
cd ../..
tools/ui-factory/eval/run-suites.sh /home/user/La-Horda cand $E/suites > /dev/null 2>&1; echo "suites done" >> $R/summary.txt
SE_BASE_URL=http://127.0.0.1:8881 timeout 600 node tools/regression/t_drag_aim.js > $R/drag_aim-cand.log 2>&1; echo "drag_aim cand rc=$?" >> $R/summary.txt
SE_BASE_URL=http://127.0.0.1:8882 timeout 600 node tools/regression/t_drag_aim.js > $R/drag_aim-base.log 2>&1; echo "drag_aim base rc=$?" >> $R/summary.txt
cd tools/regression; node t_snapshot.js despues ../../$R/despues > ../../$R/t_snapshot-despues.log 2>&1; node t_snapshot.js antes ../../$R/antes > ../../$R/t_snapshot-antes.log 2>&1
python3 compare_snap.py ../../$R/antes/snapshot.json ../../$R/despues/snapshot.json > ../../$R/compare_snap.txt 2>&1
wait
python3 compare_det.py ../../$R/antes2/det.json ../../$R/despues/det.json > ../../$R/compare_det_antes2-vs-despues.txt 2>&1
echo ITER2DONE >> ../../$R/summary.txt
