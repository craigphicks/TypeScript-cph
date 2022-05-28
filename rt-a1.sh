L0=tests/baselines/local-a1.de1.di0
L1=tests/baselines/local-a1.de1.di1
T0=tmp.a1.de1.di0.txt
T1=tmp.a1.de1.di1.txt

[ -d $L0 ] && rm -rf $L0
[ -d $L0 ] && exit 1
[ -d $L1 ] && rm -rf $L1
[ -d $L1 ] && exit 2

myDebug=1 myDisable=0 gulp runtests  --test=_cax-a1 | tee $T0 || true
mv tests/baselines/local  $L0 || exit 3
grep "checkExpression return: " $T0 > $T0.cet.txt

myDebug=1 myDisable=1 gulp runtests  --test=_cax-a1 | tee $T1 || true
mv tests/baselines/local  $L1 || exit 4
grep "checkExpression return: " $T1 > $T1.cet.txt

echo meld $L0 $L1 
meld $L0 $L1

echo meld $T0 $T1
meld $T0 $T1

echo meld $T0.cet.txt $T1.cet.txt
meld $T0.cet.txt $T1.cet.txt

