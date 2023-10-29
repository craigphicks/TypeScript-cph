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
git checkout -f 6029a01f5f727a4326b7cdda8a9d4327d2c66a5b
git switch -c origin-main-booleanArrayFilter-mydebug
hreeby
hereby
git switch -c origin-main-booleanArrayFilter-nextV2
