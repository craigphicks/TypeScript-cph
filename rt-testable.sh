#!/bin/bash
myDebug=0 myDisableInfer=${1:-0} gulp runtests  -t='_cax-(ez000|and|if|array|bi|block|cem|exclamation|rp|lt|typeof-00(0|1|2|3))|parens'
