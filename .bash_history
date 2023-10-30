git checkout -f origin-main-booleanArrayFilter-libonly
git branch -m  origin-main-booleanArrayFilter
git status
hereby runtests-parallel 
git status
git baseline-accept
hereby baseline-accept
git status
git add tests src
git status
git commit -m "modified getSignaturesOfType(...), fourslash errors increased by 1 to 15; other errors due to changed es5.d.ts fixed; however one extra in controlFlowArrayErrors.errors.txt vanished"
git log
git commit --ammend
git status
git log
find tests/cases/ -name "*bestChoice*"
find tests/cases/ -name "*arraySplice*"
find tests/cases/ -name "*arraySlice*"
find tests/cases/ -name "*controlFlowArrayErrors*"
find tests/cases/ -name "*unionOfArrays*"
