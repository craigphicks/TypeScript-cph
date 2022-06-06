
BN=$1
if [ -z $1 ] 
then 
  BN=$myTestFilename
else 
  BN="_cax-${BN}"
fi
if [ -z $BN ] 
then 
  echo "must provide test filename"
  return 99
fi
L0=tests/baselines/local-${BN}.de${myDebug}.di0.naa0
L1=tests/baselines/local-${BN}.de${myDebug}.di0.naa1
T0=tmp.${BN}.de${myDebug}.di0.naa0.txt
T1=tmp.${BN}.de${myDebug}.di0.naa1.txt

[ -d $L0 ] && rm -rf $L0
[ -d $L0 ] && return 1
[ -d $L1 ] && rm -rf $L1
[ -d $L1 ] && return 2


echo myDbgOutFilename=$T1 myDisable=0 myNoAliasAction=1 gulp runtests  --test=${BN}
myDbgOutFilename=$T1 myDisable=0 myNoAliasAction=1 gulp runtests  --test=${BN} || true
cp -r tests/baselines/local  $L1 || return 4
grep "checkExpression return: \|checkSourceElement: " $T1 > $T1.cet.txt

echo myDbgOutFilename=$T0 myDisable=0 myNoAliasAction=0 gulp runtests  --test=${BN} 
myDbgOutFilename=$T0 myDisable=0 myNoAliasAction=0 gulp runtests  --test=${BN} || true
cp -r tests/baselines/local  $L0 || return 3
grep "checkExpression return: \|checkSourceElement: "  $T0 > $T0.cet.txt

echo meld $L0 $L1 
meld $L0 $L1

echo meld $T0 $T1
meld $T0 $T1

echo meld $T0.cet.txt $T1.cet.txt
meld $T0.cet.txt $T1.cet.txt

