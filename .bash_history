git checkout -f 61a96b1641abe24c4adc3633eb936df89eb991f2
git switch -c origin-main-nolibchange
hereby runtests-parallel 
git status
git add .
git commit -m "code change only"
hereby runtests --test="booleanConverter.ts"
hereby baseline-accept
git status
git commit -m "new tests case booleanConverter.ts, baseline-accepted" 
git log
git commit -m "new tests case booleanConverter.ts, baseline-accepted" 
git commit -f -m "new tests case booleanConverter.ts, baseline-accepted" 
git commit -m "new tests case booleanConverter.ts, baseline-accepted" 
