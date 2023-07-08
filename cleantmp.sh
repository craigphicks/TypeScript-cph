#!/bin/bash
rm tmp-.de1.di0.dfc1.txt.tmp || true
mv tmp.de1.di0.dfc1.txt tmp-.de1.di0.dfc1.txt || true
rm tmp.* isolate-* .failed-tests || true
mv tmp-.de1.di0.dfc1.txt tmp.de1.di0.dfc1.txt || true
