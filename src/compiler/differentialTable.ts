namespace ts {

export class DifferentialTable<T extends object, K extends number | string | object = number>{
    private parent: DifferentialTable<T,K> | undefined;
    private map: ESMap<K, T>;
    private ctor: () => T;
    private copy: (t: Readonly<T>) => T;
    private readonlyMode = false;
    constructor(
        parent: DifferentialTable<T,K> | undefined,
        ctor: () => T,
        copy: (t: Readonly<T>) => T,
    ) {
        this.parent = parent;
        this.map = new Map<K, T>();
        this.ctor = ctor ?? (()=>({} as T));
        this.copy = copy ?? ((t: Readonly<T>) => ({ ...t }));
    }
    private has(key: K): boolean {
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
    // public set(key: K, value: T): void {
    //     this.map.set(key, value);
    // }
    public getReadonlyTableAndBranch(): { readonlyTable: Readonly<DifferentialTable<T,K>>, branchTable: DifferentialTable<T,K> } {
        this.readonlyMode = true;
        return {
            readonlyTable: this,
            branchTable: new DifferentialTable(this, this.ctor, this.copy),
        };
    }
}



}