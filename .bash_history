hereby tsc && hereby build-src --built && hereby runtests-parallel
npx dprint check src/compiler/checker.ts
npx dprint fmt src/compiler/checker.ts
hereby lint
git status
