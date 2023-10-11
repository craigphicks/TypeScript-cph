namespace ts {

export const classProxyRecordRWSymbol = Symbol("classProxyRecordRW");
export function createTableClassProxyRecordRW(keys: string[], typeName: string): any {
    class ClassProxyRecordRW {
        // @ts-expect-error 6133
        private _obj: {[key: string]: any};
        // @ts-expect-error 6133
        private _wasRead: {[key: string]: any} = {};
        // @ts-expect-error 6133
        private _wasWrit: {[key: string]: any} = {};
        // @ts-expect-error 6133
        private _readonlyMode: boolean;
        // @ts-expect-error 6133
        private _typeName: string;

        constructor(obj: {[key: string]: any}, readonlyMode = false) {
            this._obj = obj;
            this._readonlyMode = readonlyMode;
            this._typeName = typeName;
        }
    }
    Object.defineProperty(ClassProxyRecordRW.prototype, classProxyRecordRWSymbol, {
        enumerable: true,
        value: true,
    });
    for (const key of keys) {
        Object.defineProperty(ClassProxyRecordRW.prototype, key, {
            enumerable: true,
            get() {
                this._wasRead[key] = true;
                return this._obj[key];
            },
            set(value: any) {
                if (this._readonlyMode) {
                    throw new Error(`Cannot set ${key} in readonly mode`);
                }
                this._wasWrit[key] = true;
                this._obj[key] = value;
            }
        });
    }

    return ClassProxyRecordRW;
}
}