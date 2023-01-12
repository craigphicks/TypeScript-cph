#!/bin/bash
myDebug=0 myDisableInfer=${1:-0} gulp runtests  -t='_cax-(and|if|array|bi|block|cem|exclamation|rp|lt|typeof-00(0|1|2|30))'
