#!/bin/bash
#myDebug=0 myDisableInfer=${1:-0} gulp runtests  -t='_caxnc-(and|if|array|bi|block|cem|exclamation|rp|lt|typeof|parens|fn|enum|let|eqneq|typeUndefined|typeUnknown)'
#myMaxLinesOut=300000 myDebug=0 myDebugLevel=1 myDisableInfer=0 gulp runtests -t="_caxnc-(and|if|array|bi|block|cem|enum|exclamation|ez|fn|if|let|literal|lt|parens|rhsAssign|rp|typeof|typeUn|eqneq|eqneqLRN|whileLoop)"
#myMaxLinesOut=300000 myDebug=0 myDebugLevel=1 myDisableInfer=0 gulp runtests -t="_caxnc-(and|if|array|bi|block|cem|enum|exclamation|ez|fn|if|let|literal|lt|parens|prop-|propAssign|rhsAssign|rp|typeof|typeUn)"
#myMaxLinesOut=300000 myDebug=0 myDebugLevel=1 myDisableInfer=0 gulp runtests -t="_caxnc-(arrayLiteralExpression|prop|propNarrow|propAssign|unionObj|ez)-"

myMaxLinesOut=300000 myDebug=0 myDebugLevel=1 myDisableInfer=0 gulp runtests -t="_caxnc-(_caxnc-(ez000(3|4))|fn-00(04|05|08|23|24|30|31))"