#!/bin/bash
//myDebug=0 myDisableInfer=${1:-0} gulp runtests  -t='_caxnc-(and|if|array|bi|block|cem|exclamation|rp|lt|typeof|parens|fn|enum|let|eqneq|typeUndefined|typeUnknown)'
myMaxLinesOut=300000 myDebug=0 myDebugLevel=1 myDisableInfer=0 gulp runtests -t="_caxnc-(and|if|array|bi|block|cem|enum|eqneq|exclamation|ez|fn|typeof)"
