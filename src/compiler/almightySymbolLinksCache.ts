// import {
//     AlmightySymbol,
//     AlmightySymbolLinks,
//     objectAllocator,
//     Symbol,
//     Debug,
//     castHereafter,
//     SymbolFlags,
//     __String
// } from "./_namespaces/ts";

// import {
//     PlainObjectProto,
//     //UnsettablePlainObjectProto,
//     createProxyGetAndSetFunctions
// } from "./plainObjectGetSetProto";
// import {
//     almightySymbolLinksKeys
// } from "./almightSymbolLinksKeys";

// // cphdebug start
// import { IDebug } from "./mydebug";
// // cphdebug end


// /**
//  * Caching works by cache-on-write, by symbol and by property.
//  * SymbolLinksCacheControl keeps track of the caching levels
//  * and of the SymbolLinks that have been written to during any level,
//  * excepting the base level 0.
//  */
// class SymbolLinksCacheControl<T extends /*AlmightySymbolLinksIFConstructor*/ | AlmightySymbol> {
//     private _cachedByLevel: Set<T>[] = [];
//     /**
//      * returns the exprectedDepth number to passed to endLevel(expectedDepth)
//      */
//     beginNewLevel(): number {
//         if (this.getLevel()!==0) Debug.assert(false, "beginNewLevel() deeper than one not yet implemented");
//         return this._cachedByLevel.push(new Set<T>);
//     }
//     endLevel(expectedDepth: number): void {
//         Debug.assert(expectedDepth>0);
//         Debug.assertEqual(expectedDepth, this._cachedByLevel.length);
//         this._cachedByLevel?.forEach((value) => { (value as any).flushCache(); });
//         this._cachedByLevel.pop();
//     }
//     notifySymbolLinksBeingCached(t: T): void {
//         Debug.assert(this._cachedByLevel.length>0);
//         this._cachedByLevel[this._cachedByLevel.length-1].add(t);
//     }
//     isActive(): boolean {
//         return this._cachedByLevel.length>0;
//     }
//     getLevel(): number {
//         return this._cachedByLevel.length;
//     }
// };


// /**
//  * Dev note: For the time being leave checkers symbolLinks:[] and getSymbolLinks to handle the non-transient symbols as before.
//  * See if the problem can be solved with transient symbols alone.
//  */

// // class AlmightySymbolLinksIFConstructor {
// //     readonly symbol: Symbol;
// //     cache?: Map<string, any> | undefined;
// //     readonly proxied: AlmightySymbolLinks;
// //     // 'proxy' is declared but its value is never read.ts(6133)
// //     // (property) SymbolLinks.proxy: any
// //     constructor(symbol: Symbol, initial: AlmightySymbolLinks = { _symbolLinksBrand: true }) {
// //         this.symbol = symbol;
// //         this.proxied = initial;
// //     }
// //     flushCache() {
// //         if (this.cache) {
// //             this.cache = undefined;
// //         }
// //     }
// // }

// // type AlmightySymbolLinksProto = PlainObjectProto<AlmightySymbolLinks, "get_", "set_">;
// // export type AlmightySymbolLinksIF = {readonly [k in keyof AlmightySymbolLinks]?:unknown} & AlmightySymbolLinksProto

// // /**
// //  * This function is just resetting AlmightySymbolLinksImpl.prototype, with a different symbolLinksCacheControl, for each file,
// //  * which is ok because they run consecutively.
// //  * @param symbolLinksCacheControl
// //  * @returns
// //  */
// // export function createAlmightySymbolLinksIFConstructor(symbolLinksCacheControl: SymbolLinksCacheControl<AlmightySymbolLinksIFConstructor>): AlmightySymbolLinksIFConstructor["constructor"] {
// //     createProxyGetAndSetFunctions(
// //         AlmightySymbolLinksIFConstructor.prototype,
// //         almightySymbolLinksKeys,
// //         (key)=>`get_${key}`,
// //         function (key:string) {
// //             castHereafter<AlmightySymbolLinksIFConstructor>(this);
// //             castHereafter<keyof AlmightySymbolLinks>(key);
// //             if (symbolLinksCacheControl.isActive()){
// //                 if (IDebug.loggingHost) IDebug.loggingHost.ilog(`SymbolLinks[${this.symbol.escapedName}].get: ${key}`,2);
// //                 if (!this.cache || !this.cache.has(key)) {
// //                     return this.proxied[key];
// //                 }
// //                 return this.cache.get(key);
// //             }
// //             else {
// //                 return this.proxied[key];
// //             }
// //         },
// //         (key)=>`set_${key}`,
// //         function (key:string, value:any) {
// //             castHereafter<AlmightySymbolLinksIFConstructor>(this);
// //             castHereafter<keyof AlmightySymbolLinks>(key);
// //             if (symbolLinksCacheControl.isActive()){
// //                 if (IDebug.loggingHost) {
// //                     let unchangedString = "";
// //                     if (value===this.proxied[key]) unchangedString = " ; (unchanged)";
// //                     IDebug.loggingHost.ilog(`SymbolLinks[${this.symbol.escapedName}].set: ${key as string} = ${value} ${unchangedString}`,2);
// //                 }
// //                 if (!this.cache) {
// //                     symbolLinksCacheControl.notifySymbolLinksBeingCached(this);
// //                     this.cache = new Map<string, any>();
// //                 }
// //                 this.cache.set(key, value);
// //             }
// //             else {
// //                 this.proxied[key] = value;
// //             }
// //         }
// //     );
// //     AlmightySymbolLinksIFConstructor satisfies AlmightySymbolLinksIFConstructor["constructor"];
// //     return AlmightySymbolLinksIFConstructor;
// // }

// type AlmightySymbolOwnLinksProto = PlainObjectProto<AlmightySymbolLinks, "linkget_", "linkset_">;
// type AlmightySymbolOwnLinks = AlmightySymbolOwnLinksProto & {readonly [k in keyof AlmightySymbolLinks]?:unknown};

// var AlmightySymbol = objectAllocator.getSymbolConstructor();

// // Adding the Partial of Partial<AlmightySymbolLinks> in multiple places is a laborious workaround to
// // to prevent an error about _symbolLinksBrand not being present in AlmightySymbolLinks.
// // Unfortunately, if _symbolLinksBrand is made optional, it doesn't fulfill its intended purpose.
// function AlmightySymbolLinks(this: AlmightySymbolLinks, initial?: Partial<AlmightySymbolLinks>): AlmightySymbolLinks{
//     if (initial){
//         for (const k in initial) this[k as keyof AlmightySymbolLinks] = initial[k as keyof AlmightySymbolLinks];
//     }
//     return this;
// }

// export interface AlmightySymbolWithOwnLinks extends Symbol, AlmightySymbolOwnLinks {};
// type AlmightySymbolWithOwnLinksConstructor = {
//     new(flags: SymbolFlags, name: __String, initialSymbolLinks?: Partial<AlmightySymbolLinks>): AlmightySymbolWithOwnLinks;
//     readonly prototype: AlmightySymbolWithOwnLinks;
// };

// export class AlmightySymbolObjectAndCacheControl {
//     private ownSymbolLinksCacheControl = new SymbolLinksCacheControl<AlmightySymbol>
//     private ownSymbolLinksMap = new WeakMap<AlmightySymbol, AlmightySymbolLinks>();
//     private almightySymbolWithOwnLinksConstructor: AlmightySymbolWithOwnLinksConstructor;
//     private almightySymbolLinksWithOwnLinksPrototype: AlmightySymbolWithOwnLinksConstructor["prototype"];
//     constructor() {
//         const that = this;
//         class AlmightySymbolLinksWithCache {
//             readonly symbol: Symbol;
//             cache?: Map<string, any> | undefined;
//             readonly proxied: Partial<AlmightySymbolLinks>;
//             constructor(symbol: Symbol , initial: Partial<AlmightySymbolLinks> = { /*_symbolLinksBrand: true*/ }) {
//                 this.symbol = symbol;
//                 this.proxied = initial;
//             }
//             flushCache() {
//                 if (this.cache) {
//                     this.cache = undefined;
//                 }
//             }
//         }
//         class AlmightySymbolWithOwnLinks extends AlmightySymbol {
//             almightySymbolLinksWithCache: AlmightySymbolLinksWithCache;
//             constructor(flags: SymbolFlags, name: __String, initialSymbolLinks?: AlmightySymbolLinks) {
//                 super(flags, name);
//                 this.almightySymbolLinksWithCache = new AlmightySymbolLinksWithCache(this, initialSymbolLinks);
//                 that.ownSymbolLinksMap.set(this, this.almightySymbolLinksWithCache as unknown as AlmightySymbolLinks);
//             }
//         }
//         this.almightySymbolWithOwnLinksConstructor = AlmightySymbolWithOwnLinks as unknown as AlmightySymbolWithOwnLinksConstructor;
//         createProxyGetAndSetFunctions(
//             AlmightySymbolWithOwnLinks.prototype,
//             almightySymbolLinksKeys,
//             (key)=>`linkget_${key}`,
//             function (key:string) {
//                 castHereafter<AlmightySymbolWithOwnLinks>(this);
//                 castHereafter<keyof AlmightySymbolLinks>(key);
//                 const cache = this.almightySymbolLinksWithCache.cache;
//                 const proxied = this.almightySymbolLinksWithCache.proxied;
//                 if (that.ownSymbolLinksCacheControl.isActive()){
//                     if (IDebug.loggingHost) IDebug.loggingHost.ilog(`SymbolLinks[${this.escapedName}].get: ${key}`,2);
//                     if (!cache || !cache.has(key)) {
//                         return proxied[key];
//                     }
//                     return cache.get(key);
//                 }
//                 else {
//                     return proxied[key];
//                 }
//             },
//             (key)=>`linkset_${key}`,
//             function (key:string, value:any) {
//                 castHereafter<AlmightySymbolWithOwnLinks>(this);
//                 castHereafter<keyof AlmightySymbolLinks>(key);
//                 if (that.ownSymbolLinksCacheControl.isActive()){
//                     if (IDebug.loggingHost) {
//                         let unchangedString = "";
//                         if (value===this.almightySymbolLinksWithCache.proxied[key]) unchangedString = " ; (unchanged)";
//                         IDebug.loggingHost.ilog(`SymbolLinks[${this.escapedName}].set: ${key as string} = ${value} ${unchangedString}`,2);
//                     }
//                     if (!this.almightySymbolLinksWithCache.cache) {
//                         that.ownSymbolLinksCacheControl.notifySymbolLinksBeingCached(this);
//                         this.almightySymbolLinksWithCache.cache = new Map<string, any>();
//                     }
//                     this.almightySymbolLinksWithCache.cache.set(key, value);
//                 }
//                 else {
//                     this.almightySymbolLinksWithCache.proxied[key] = value;
//                 }
//             }
//         );
//         this.almightySymbolLinksWithOwnLinksPrototype = AlmightySymbolWithOwnLinks.prototype as unknown as AlmightySymbolWithOwnLinksConstructor["prototype"];;
//     }

//     static getAlmightySymbolWithOwnLinksConstructor(): AlmightySymbolWithOwnLinksConstructor{
//         return (new AlmightySymbolObjectAndCacheControl).almightySymbolWithOwnLinksConstructor;
//     }
// }

