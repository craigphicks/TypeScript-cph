
BN=$1
L0=tests/baselines/local-${BN}.de1.di0.nc0
L1=tests/baselines/local-${BN}.de1.di0.nc1
T0=tmp.${BN}.de1.di0.nc0.txt
T1=tmp.${BN}.de1.di0.nc1.txt

[ -d $L0 ] && rm -rf $L0
[ -d $L0 ] && return 1
[ -d $L1 ] && rm -rf $L1
[ -d $L1 ] && return 2


echo "myDebug=1 myDisable=0 myNoCache=1 gulp runtests  --test=_cax-${BN} "
myDebug=1 myDisable=0 myNoCache=1 gulp runtests  --test=_cax-${BN} > $T1 || true
cp -r tests/baselines/local  $L1 || return 4
grep "checkExpression return: \|checkSourceElement: \|get.cache \|set.cache" $T1 > $T1.cet.txt

echo "myDebug=1 myDisable=0 myNoCache=0 gulp runtests  --test=_cax-${BN} "
myDebug=1 myDisable=0 myNoCache=0 gulp runtests  --test=_cax-${BN} > $T0 || true
cp -r tests/baselines/local  $L0 || return 3
grep "checkExpression return: \|checkSourceElement: \|get.cache \|set.cache"  $T0 > $T0.cet.txt

echo meld $L0 $L1 
meld $L0 $L1

echo meld $T0 $T1
meld $T0 $T1

echo meld $T0.cet.txt $T1.cet.txt
meld $T0.cet.txt $T1.cet.txt

