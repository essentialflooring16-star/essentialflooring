#!/bin/sh
# Verifica panourile cabinetului cu TypeScript, folosind tsconfig-ul proiectului.
#
# De ce separat de build: `astro build` foloseste esbuild, care sterge tipurile
# fara sa le verifice. O componenta care apeleaza t() acolo unde hook-ul nu
# exista trece build-ul fara o vorba si crapa abia in browserul clientului. Asa
# a scapat cabinetul stricat de doua ori in sesiunea in care a fost tradus.
cd "$(dirname "$0")/.." || exit 1
out=$(npx tsc --noEmit -p tsconfig.json 2>&1 | grep "src/components/admin/")
if [ -n "$out" ]; then
  echo "$out"
  echo
  echo "GASITE erori in panourile cabinetului"
  exit 1
fi
echo "panourile cabinetului: fara erori de tip"
