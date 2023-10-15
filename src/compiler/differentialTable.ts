namespace ts {

export type OverrideCtorCopy<T extends object> = {ctor: () => T, copy: (t: Readonly<T>) => T};

export class DifferentialTable<T extends object, K extends object = T>{
    private parent: DifferentialTable<T,K> | undefined;
    private map: ESMap<K, T>;
    private ctor: () => T;
    private copy: (t: Readonly<T>) => T;
    private readonlyMode = false;
    constructor(
        parent?: DifferentialTable<T,K> | undefined,
        ctor?: () => T,
        copy?: (t: Readonly<T>) => T,
    ) {
        this.parent = parent;
        this.map = new Map<K, T>();
        this.ctor = ctor ?? (()=>({} as T));
        this.copy = copy ?? ((t: Readonly<T>) => ({ ...t }));
    }
    /**
     * Elementwise functions
     */

    public has(key: K): boolean {
        if (this.map.has(key)) return true;
        if (this.parent) return this.parent.has(key);
        return false;
    }
    public getWritableAlways(key: K): T {
        Debug.assert(!this.readonlyMode);
        if (this.map.has(key)) return this.map.get(key)!; // ours are alays writable, unlike parents
        if (this.parent && this.parent.has(key)) {
            const r: T = this.copy(this.parent.getReadonly(key)!);
            this.map.set(key, r); // it may written-to later so it must be cached here
            return r;
        }
        const r = this.ctor();
        this.map.set(key,r);
        return r;
    }
    // public getWritable(key: K): T | undefined {
    //     if (this.map.has(key)) return this.map.get(key)!;
    //     if (this.parent && this.parent.has(key)) return this.parent.get(key);
    //     return undefined;
    // }
    public getReadonly(key: K): Readonly<T> | undefined {
        if (this.map.has(key)) return this.map.get(key)!;
        if (this.parent && this.parent.has(key)) return this.parent.getReadonly(key);
        return undefined;
    }
    public set(key: K, value: T): void {
        Debug.assert(!this.readonlyMode, "Cannot write to readonly table");
        this.map.set(key, value);
    }
    public getReadonlyMapOfCurrentBranch(): Readonly<ESMap<K, Readonly<T>>> {
        return this.map;
    }
    // public set(key: K, value: T): void {
    //     this.map.set(key, value);
    // }

    /**
     * Whole table functions
     */

    public getReadonlyTableAndBranchTable(overrideCtorCopy?: OverrideCtorCopy<T>): { readonlyTable: Readonly<DifferentialTable<T,K>>, originalReadonlyMode: boolean, branchTable: DifferentialTable<T,K> } {
        const r1 = this.getReadonlyTable();
        const r2 = this.setTableToReadonlyAndGetBranchTable(overrideCtorCopy);
        return {
            ...r1,
            ...r2,
        };
    }
    public getReadonlyTable(): { readonlyTable: Readonly<DifferentialTable<T,K>>, originalReadonlyMode: boolean } {
        const originalReadonlyMode = this.readonlyMode;
        this.readonlyMode = true;
        return {
            originalReadonlyMode,
            readonlyTable: this,
        };
    }

    public setTableToReadonlyAndGetBranchTable(overrideCtorCopy?: OverrideCtorCopy<T>): { branchTable: DifferentialTable<T,K> }{
        this.readonlyMode = true;
        return {
            branchTable: new DifferentialTable(this, overrideCtorCopy?overrideCtorCopy.ctor:this.ctor, overrideCtorCopy?overrideCtorCopy.copy:this.copy),
        };
    }
    public setTableReadonlyMode(readonlyMode: boolean): void {
        this.readonlyMode = readonlyMode;
    }
    public getTableReadonlyMode(): boolean {
        return this.readonlyMode;
    }

    // public getOwnTableAsReadonlyArray(): Readonly<T>[] {
    //     const arr: Readonly<T>[] = [];
    //     this.map.forEach((v) => arr.push(v));
    //     return arr;
    // }
}



}