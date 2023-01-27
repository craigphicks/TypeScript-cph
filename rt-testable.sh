#!/bin/bash
myDebug=0 myDisableInfer=${1:-0} gulp runtests  -t='_cax-(ez|and|if|array|bi|block|cem|exclamation|rp|lt|typeof|parens|fn|enum|let|eqneq|typeUndefined|typeUnknown)'
