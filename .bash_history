sudo rm -rf .tmp.cph.d/ .devcontainer-original/ .bash_history 
git status
git stash branch origin-main-booleanArrayFilter
git branch 
hereby && hereby runtests-parallel
git add .
git status
hereby runtests --tests="unionOfArr"
git status
git commit -m "modified for local use, unionOfArraysFilterCall is test that REALLY failing, the other failures just reflect the the change in reporting Array type."
hereby
npm i hereby
hereby
grep -R  . LogginHost
grep -R  LoggingHost . 
hereby
git status
git add .
git commit -m "backup; compiled"
hereby
tsc
tsc --version
which tsc
npm install -g typescript@5.2.2
tsc --version
which tsc
git branch 
git status
myLogLevel=4 myAssertLevel=1 nouseRcev2=0 hereby runtests --tests="_uoafc"
myLogLevel=4 myAssertLevel=1 nouseRcev2=0 hereby runtests --tests="_uoafc" -i
myLogLevel=4 myAssertLevel=1 nouseRcev2=0 hereby runtests --tests="_uoafc"
myLogLevel=4 myAssertLevel=1 nouseRcev2=1 hereby runtests --tests="_uoafc"
hereby baseline-accept
myLogLevel=4 myAssertLevel=1 nouseRcev2=0 hereby runtests --tests="_uoafc"
tsc --version
myLogLevel=4 myAssertLevel=1 nouseRcev2=1 hereby runtests --tests="_uoafc"
hereby baseline-accept
myLogLevel=4 myAssertLevel=1 nouseRcev2=0 hereby runtests --tests="_uoafc"
myLogLevel=0 myAssertLevel=1 nouseRcev2=0 hereby runtests --tests="_uoafc"
myLogLevel=0 myAssertLevel=0 nouseRcev2=0 hereby runtests --tests="_uoafc"
myLogLevel=0 myAssertLevel=0 nouseRcev2=1 hereby runtests --tests="_uoafc"
myLogLevel=0 myAssertLevel=0 nouseRcev2=1 hereby runtests --tests="unionOfArraysFilter"
hereby baseline-accept
ls -al tests/baselines/reference/unionOfArraysFilterCall.symbols
ls -al tests/baselines/reference/unionOfArraysFilterCall.*
ls -al tests/baselines/reference/*.symbols
ls -al tests/baselines/reference/*.symbols | grep union
ls -al tests/baselines/local/
ls -al tests/baselines/reference/*.types | grep union
whoami
groups
id
ls -afl tests/baselines/*
ls -afl tests/baselines/
ls -afl tests
sudo chown -r node:node tests/baselines/
sudo chown -R node:node tests/baselines/
ls -afl tests/baselines/
ls -afl tests/baselines/local
hereby baseline-accept
myLogLevel=0 myAssertLevel=0 nouseRcev2=0 hereby runtests --tests="unionOfArraysFilter"
hereby baseline-accept
myLogLevel=0 myAssertLevel=0 nouseRcev2=0 hereby runtests --tests="unionOfArraysFilter"
git status
git add .
git commit -m "backup; reasonable test results for _uoafc, unionOfArrayFiltersCalls, unionOfArrayFilter-002"
git statis
git status
myLogLevel=0 myAssertLevel=0 nouseRcev2=1 hereby runtests --tests="_uoafc|unionOfArraysFilter"
myLogLevel=0 myAssertLevel=0 nouseRcev2=1 hereby runtests --tests="(_uoafc|unionOfArraysFilter)"
hereby baseline-accept
myLogLevel=0 myAssertLevel=0 nouseRcev2=1 hereby runtests --tests="_uoafc"
myLogLevel=0 myAssertLevel=0 nouseRcev2=1 hereby runtests --tests="(_uoafc|unionOfArraysFilter)"
myLogLevel=0 myAssertLevel=0 nouseRcev2=0 hereby runtests --tests="(_uoafc|unionOfArraysFilter)"
hereby baseline-accept
myLogLevel=0 myAssertLevel=0 nouseRcev2=0 hereby runtests --tests="unionOfArraysFilter"
myLogLevel=0 myAssertLevel=0 nouseRcev2=0 hereby runtests --tests="_uoafc"
