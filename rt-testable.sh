#echo $0
#echo ${1:-0}
# myDisableInfer default is 0.  Set to 1 by adding arg "1". 
myDebug=0 myDisableInfer=${1:-0} gulp runtests  --test='_cax-(and|if|array|bi|block|cem|exclamation|rp|typeof-0001)'