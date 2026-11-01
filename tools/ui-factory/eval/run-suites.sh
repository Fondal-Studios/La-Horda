#!/bin/bash
# Evaluador (Módulo D): corre las suites existentes contra una raíz (candidato o baseline). Uso: run-suites.sh <root> <label> <outdir>
ROOT=$1; LABEL=$2; OUT=$3; mkdir -p $OUT
cd $ROOT
for f in test-touch-targets test-accessibility-prefs test-first-minute-taps test-text-overflow test-hub-legibility test-ability-inspector test-tactical-panel test-skill-glyphs; do
  s=$(date +%s)
  timeout 600 node tools/ux/$f.js > $OUT/$LABEL-$f.log 2>&1; rc=$?
  echo "$LABEL $f rc=$rc $(( $(date +%s)-s ))s" | tee -a $OUT/$LABEL-summary.txt
done
