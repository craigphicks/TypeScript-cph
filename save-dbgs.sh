#!/bin/bash
echo "save-dbgs.sh: $1"
id="$1"
tmpdir="tmp.dbgs/${id}"
rm -rf ${tmpdir}
mkdir -p ${tmpdir}
mv *.afn.txt ${tmpdir} || true
mv *.0.flow ${tmpdir} || true
mv *.gff.txt ${tmpdir} || true
mv tmp.de1.di0.dfc1.txt ${tmpdir} || true

