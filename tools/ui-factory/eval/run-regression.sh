#!/bin/bash
# Evaluador: regresión de gameplay (tools/regression) antes/después + navegación x3. Sitios instrumentados en /tmp/uf-sites (antes=e194910b, despues=candidato).
cd /home/user/La-Horda; E=docs/ui-factory/evidence/eval1; R=$E/regression; mkdir -p $R
(cd /tmp/uf-sites && nohup python3 -m http.server 8750 --bind 127.0.0.1 >/dev/null 2>&1 &)
sleep 1
for L in base cand; do P=8882; [ $L = cand ] && P=8881
  SE_BASE_URL=http://127.0.0.1:$P timeout 600 node tools/regression/t_drag_aim.js > $R/drag_aim-$L.log 2>&1; echo "drag_aim $L rc=$?" >> $R/summary.txt
done
for i in 1 2 3; do for pair in "cand:/home/user/La-Horda" "base:/tmp/uf-baseline"; do L=${pair%%:*}; D=${pair#*:}
  PHASE=nav BASE_DIR=$D OUT_DIR=$E/nav-$L-r$i SECTIONS=nav node tools/ui-factory/baseline.js > /dev/null 2>&1; done; done
echo "nav x3 done" >> $R/summary.txt
cd tools/regression
for v in antes despues; do mkdir -p ../../$R/$v
  timeout 900 node t_func.js $v ../../$R/$v > ../../$R/t_func-$v.log 2>&1; echo "t_func $v rc=$?" >> ../../$R/summary.txt
  timeout 600 node t_snapshot.js $v ../../$R/$v > ../../$R/t_snapshot-$v.log 2>&1; echo "t_snapshot $v rc=$?" >> ../../$R/summary.txt
done
python3 compare_snap.py ../../$R/antes/snapshot.json ../../$R/despues/snapshot.json > ../../$R/compare_snap.txt 2>&1; echo "compare_snap rc=$?" >> ../../$R/summary.txt
for v in antes despues; do timeout 1500 node t_det.js $v ../../$R/$v > ../../$R/t_det-$v.log 2>&1; echo "t_det $v rc=$?" >> ../../$R/summary.txt; done
python3 compare_det.py ../../$R/antes/det.json ../../$R/despues/det.json > ../../$R/compare_det.txt 2>&1; echo "compare_det rc=$?" >> ../../$R/summary.txt
echo ALLDONE >> $R/summary.txt
