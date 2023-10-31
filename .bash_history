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
git add .
git commit -m "new tests case booleanConverter.ts, baseline-accepted" 
git log
hereby runtests-parallel
grep -R src/lib Boolean
grep -R Boolean src/lib 
hereby runtests --test="booleanConverter.ts"
hereby
hereby runtests --test="booleanConverter.ts"
find . -name "es5.d.ts"
herby
hereby
hereby --help
hereby --tasks
find . -name "es5.d.ts"
diff ./built/local/compiler/transformers/es5.d.ts src/lib/es5.d.ts 
hereby runtests --test="booleanConverter.ts"
find tests -name "*booleanConverter*"
git status
find tests -name "*booleanConverter*"
find tests -name "*booleanConverter*" -exec rm {} \;
find tests -name "*booleanConverter*"
git status
hereby runtests --test="arrayFilterBooleanOverload.ts"
git status
git add .
git status
git restore --staged .
git status
git add tests 
hereby runtests --test="arrayFilterBooleanOverload.ts"
git add tests 
git status
hereby baseline-accept
git status
git add tests
git status
git commit -m "new test file arrayFilterBooleanOverload.ts"
git status
git add .
git commit -m "modifications to src/lib/es5.d.ts needed to make test case arrayFilterBooleanOverload.ts work as expected"
hereby runtests-parallel
hereby baseline-accept
git status
