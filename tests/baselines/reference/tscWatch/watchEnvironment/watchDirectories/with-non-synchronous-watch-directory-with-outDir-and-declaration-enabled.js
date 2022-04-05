Input::
//// [/a/lib/lib.d.ts]
/// <reference no-default-lib="true"/>
interface Boolean {}
interface Function {}
interface CallableFunction {}
interface NewableFunction {}
interface IArguments {}
interface Number { toExponential: any; }
interface Object {}
interface RegExp {}
interface String { charAt: any; }
interface Array<T> { length: number; [n: number]: T; }

//// [/user/username/projects/myproject/src/file1.ts]
import { x } from "file2";

//// [/user/username/projects/myproject/node_modules/file2/index.d.ts]
export const x = 10;

//// [/user/username/projects/myproject/tsconfig.json]
{"compilerOptions":{"outDir":"dist","declaration":true}}


fileExists:: {} 

directoryExists:: {} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

/a/lib/tsc.js --w -p /user/username/projects/myproject/tsconfig.json
Output::
>> Screen clear
[[90m12:00:29 AM[0m] Starting compilation in watch mode...

[[90m12:00:37 AM[0m] Found 0 errors. Watching for file changes.



Program root files: ["/user/username/projects/myproject/src/file1.ts"]
Program options: {"outDir":"/user/username/projects/myproject/dist","declaration":true,"watch":true,"project":"/user/username/projects/myproject/tsconfig.json","configFilePath":"/user/username/projects/myproject/tsconfig.json"}
Program structureReused: Not
Program files::
/a/lib/lib.d.ts
/user/username/projects/myproject/node_modules/file2/index.d.ts
/user/username/projects/myproject/src/file1.ts

Semantic diagnostics in builder refreshed for::
/a/lib/lib.d.ts
/user/username/projects/myproject/node_modules/file2/index.d.ts
/user/username/projects/myproject/src/file1.ts

Shape signatures in builder refreshed for::
/a/lib/lib.d.ts (used version)
/user/username/projects/myproject/node_modules/file2/index.d.ts (used version)
/user/username/projects/myproject/src/file1.ts (computed .d.ts during emit)

WatchedFiles::
/user/username/projects/myproject/tsconfig.json:
  {"fileName":"/user/username/projects/myproject/tsconfig.json","pollingInterval":250}
/user/username/projects/myproject/src/file1.ts:
  {"fileName":"/user/username/projects/myproject/src/file1.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/index.d.ts:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/index.d.ts","pollingInterval":250}
/a/lib/lib.d.ts:
  {"fileName":"/a/lib/lib.d.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/package.json:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/package.json","pollingInterval":250}

FsWatches::
/user/username/projects/myproject/src:
  {"directoryName":"/user/username/projects/myproject/src","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules:
  {"directoryName":"/user/username/projects/myproject/node_modules","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/file2:
  {"directoryName":"/user/username/projects/myproject/node_modules/file2","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/@types:
  {"directoryName":"/user/username/projects/myproject/node_modules/@types","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject:
  {"directoryName":"/user/username/projects/myproject","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/dist:
  {"directoryName":"/user/username/projects/myproject/dist","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}

FsWatchesRecursive::

exitCode:: ExitStatus.undefined

//// [/user/username/projects/myproject/dist/file1.js]
"use strict";
exports.__esModule = true;


//// [/user/username/projects/myproject/dist/file1.d.ts]
export {};



fileExists:: {
 "/user/username/projects/myproject/tsconfig.json": 1,
 "/user/username/projects/myproject/node_modules/file2/package.json": 1,
 "/user/username/projects/myproject/node_modules/file2.ts": 1,
 "/user/username/projects/myproject/node_modules/file2.tsx": 1,
 "/user/username/projects/myproject/node_modules/file2.d.ts": 1,
 "/user/username/projects/myproject/node_modules/file2/index.ts": 1,
 "/user/username/projects/myproject/node_modules/file2/index.tsx": 1,
 "/user/username/projects/myproject/node_modules/file2/index.d.ts": 2
} 

directoryExists:: {
 "/user/username/projects/myproject/tsconfig.json": 1,
 "/user/username/projects/myproject/src/node_modules": 1,
 "/user/username/projects/myproject/node_modules": 3,
 "/user/username/projects/myproject/node_modules/file2": 4,
 "/user/username/projects/myproject/node_modules/@types": 2,
 "/user/username/projects/node_modules/@types": 1,
 "/user/username/node_modules/@types": 1,
 "/user/node_modules/@types": 1,
 "/node_modules/@types": 1,
 "/user/username/projects/myproject/src": 1,
 "/user/username/projects/myproject/dist": 2,
 "/user/username/projects/myproject": 2
} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Change:: No change

Input::

fileExists:: {} 

directoryExists:: {} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Output::

WatchedFiles::
/user/username/projects/myproject/tsconfig.json:
  {"fileName":"/user/username/projects/myproject/tsconfig.json","pollingInterval":250}
/user/username/projects/myproject/src/file1.ts:
  {"fileName":"/user/username/projects/myproject/src/file1.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/index.d.ts:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/index.d.ts","pollingInterval":250}
/a/lib/lib.d.ts:
  {"fileName":"/a/lib/lib.d.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/package.json:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/package.json","pollingInterval":250}

FsWatches::
/user/username/projects/myproject/src:
  {"directoryName":"/user/username/projects/myproject/src","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules:
  {"directoryName":"/user/username/projects/myproject/node_modules","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/file2:
  {"directoryName":"/user/username/projects/myproject/node_modules/file2","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/@types:
  {"directoryName":"/user/username/projects/myproject/node_modules/@types","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject:
  {"directoryName":"/user/username/projects/myproject","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/dist:
  {"directoryName":"/user/username/projects/myproject/dist","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}

FsWatchesRecursive::

exitCode:: ExitStatus.undefined


fileExists:: {} 

directoryExists:: {} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Change:: Add new file, should schedule and run timeout to update directory watcher

Input::
//// [/user/username/projects/myproject/src/file3.ts]
export const y = 10;


fileExists:: {} 

directoryExists:: {
 "/user/username/projects/myproject/src": 1
} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Output::

WatchedFiles::
/user/username/projects/myproject/tsconfig.json:
  {"fileName":"/user/username/projects/myproject/tsconfig.json","pollingInterval":250}
/user/username/projects/myproject/src/file1.ts:
  {"fileName":"/user/username/projects/myproject/src/file1.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/index.d.ts:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/index.d.ts","pollingInterval":250}
/a/lib/lib.d.ts:
  {"fileName":"/a/lib/lib.d.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/package.json:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/package.json","pollingInterval":250}

FsWatches::
/user/username/projects/myproject/src:
  {"directoryName":"/user/username/projects/myproject/src","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules:
  {"directoryName":"/user/username/projects/myproject/node_modules","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/file2:
  {"directoryName":"/user/username/projects/myproject/node_modules/file2","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/@types:
  {"directoryName":"/user/username/projects/myproject/node_modules/@types","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject:
  {"directoryName":"/user/username/projects/myproject","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/dist:
  {"directoryName":"/user/username/projects/myproject/dist","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}

FsWatchesRecursive::

exitCode:: ExitStatus.undefined


fileExists:: {} 

directoryExists:: {
 "/user/username/projects/myproject/src": 1
} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Change:: Actual program update to include new file

Input::

fileExists:: {} 

directoryExists:: {} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Output::
>> Screen clear
[[90m12:00:40 AM[0m] File change detected. Starting incremental compilation...

[[90m12:00:45 AM[0m] Found 0 errors. Watching for file changes.



Program root files: ["/user/username/projects/myproject/src/file1.ts","/user/username/projects/myproject/src/file3.ts"]
Program options: {"outDir":"/user/username/projects/myproject/dist","declaration":true,"watch":true,"project":"/user/username/projects/myproject/tsconfig.json","configFilePath":"/user/username/projects/myproject/tsconfig.json"}
Program structureReused: Not
Program files::
/a/lib/lib.d.ts
/user/username/projects/myproject/node_modules/file2/index.d.ts
/user/username/projects/myproject/src/file1.ts
/user/username/projects/myproject/src/file3.ts

Semantic diagnostics in builder refreshed for::
/user/username/projects/myproject/src/file3.ts

Shape signatures in builder refreshed for::
/user/username/projects/myproject/src/file3.ts (computed .d.ts)

WatchedFiles::
/user/username/projects/myproject/tsconfig.json:
  {"fileName":"/user/username/projects/myproject/tsconfig.json","pollingInterval":250}
/user/username/projects/myproject/src/file1.ts:
  {"fileName":"/user/username/projects/myproject/src/file1.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/index.d.ts:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/index.d.ts","pollingInterval":250}
/a/lib/lib.d.ts:
  {"fileName":"/a/lib/lib.d.ts","pollingInterval":250}
/user/username/projects/myproject/src/file3.ts:
  {"fileName":"/user/username/projects/myproject/src/file3.ts","pollingInterval":250}

FsWatches::
/user/username/projects/myproject/src:
  {"directoryName":"/user/username/projects/myproject/src","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules:
  {"directoryName":"/user/username/projects/myproject/node_modules","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/file2:
  {"directoryName":"/user/username/projects/myproject/node_modules/file2","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/@types:
  {"directoryName":"/user/username/projects/myproject/node_modules/@types","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject:
  {"directoryName":"/user/username/projects/myproject","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/dist:
  {"directoryName":"/user/username/projects/myproject/dist","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}

FsWatchesRecursive::

exitCode:: ExitStatus.undefined

//// [/user/username/projects/myproject/dist/file3.js]
"use strict";
exports.__esModule = true;
exports.y = void 0;
exports.y = 10;


//// [/user/username/projects/myproject/dist/file3.d.ts]
export declare const y = 10;



fileExists:: {} 

directoryExists:: {
 "/user/username/projects/myproject/node_modules/@types": 1,
 "/user/username/projects/node_modules/@types": 1,
 "/user/username/node_modules/@types": 1,
 "/user/node_modules/@types": 1,
 "/node_modules/@types": 1,
 "/user/username/projects/myproject/dist": 2
} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Change:: After program emit with new file, should schedule and run timeout to update directory watcher

Input::

fileExists:: {} 

directoryExists:: {} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Output::

WatchedFiles::
/user/username/projects/myproject/tsconfig.json:
  {"fileName":"/user/username/projects/myproject/tsconfig.json","pollingInterval":250}
/user/username/projects/myproject/src/file1.ts:
  {"fileName":"/user/username/projects/myproject/src/file1.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/index.d.ts:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/index.d.ts","pollingInterval":250}
/a/lib/lib.d.ts:
  {"fileName":"/a/lib/lib.d.ts","pollingInterval":250}
/user/username/projects/myproject/src/file3.ts:
  {"fileName":"/user/username/projects/myproject/src/file3.ts","pollingInterval":250}

FsWatches::
/user/username/projects/myproject/src:
  {"directoryName":"/user/username/projects/myproject/src","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules:
  {"directoryName":"/user/username/projects/myproject/node_modules","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/file2:
  {"directoryName":"/user/username/projects/myproject/node_modules/file2","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/@types:
  {"directoryName":"/user/username/projects/myproject/node_modules/@types","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject:
  {"directoryName":"/user/username/projects/myproject","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/dist:
  {"directoryName":"/user/username/projects/myproject/dist","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}

FsWatchesRecursive::

exitCode:: ExitStatus.undefined


fileExists:: {
 "/user/username/projects/myproject/dist/file3.js": 1,
 "/user/username/projects/myproject/dist/file3.d.ts": 1
} 

directoryExists:: {
 "/user/username/projects/myproject/dist": 1,
 "/user/username/projects/myproject/dist/file3.js": 1,
 "/user/username/projects/myproject/dist/file3.d.ts": 1
} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Change:: No change

Input::

fileExists:: {} 

directoryExists:: {} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 

Output::

WatchedFiles::
/user/username/projects/myproject/tsconfig.json:
  {"fileName":"/user/username/projects/myproject/tsconfig.json","pollingInterval":250}
/user/username/projects/myproject/src/file1.ts:
  {"fileName":"/user/username/projects/myproject/src/file1.ts","pollingInterval":250}
/user/username/projects/myproject/node_modules/file2/index.d.ts:
  {"fileName":"/user/username/projects/myproject/node_modules/file2/index.d.ts","pollingInterval":250}
/a/lib/lib.d.ts:
  {"fileName":"/a/lib/lib.d.ts","pollingInterval":250}
/user/username/projects/myproject/src/file3.ts:
  {"fileName":"/user/username/projects/myproject/src/file3.ts","pollingInterval":250}

FsWatches::
/user/username/projects/myproject/src:
  {"directoryName":"/user/username/projects/myproject/src","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules:
  {"directoryName":"/user/username/projects/myproject/node_modules","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/file2:
  {"directoryName":"/user/username/projects/myproject/node_modules/file2","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/node_modules/@types:
  {"directoryName":"/user/username/projects/myproject/node_modules/@types","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject:
  {"directoryName":"/user/username/projects/myproject","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}
/user/username/projects/myproject/dist:
  {"directoryName":"/user/username/projects/myproject/dist","fallbackPollingInterval":500,"fallbackOptions":{"watchFile":"PriorityPollingInterval"}}

FsWatchesRecursive::

exitCode:: ExitStatus.undefined


fileExists:: {} 

directoryExists:: {} 

getModifiedTimes:: {} 

setModifiedTimes:: {} 
