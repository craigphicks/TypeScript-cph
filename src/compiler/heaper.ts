
namespace ts {
// Multiply by 2 is faster that (or same as) shifting according to
// https://thefullsnack.com/en/bitwise-javascript-fast.html

export function defineOneIndexingHeaper<T>(dummy: T, lessThan: (i: T, o: T) => boolean, greaterThan: (i: T, o: T) => boolean) {

    // 1-based indexing
    function heapParentIndex(n: number): number {
        return n >> 1;
    } // (1->0,) 2->1, 3->1, 4->2, 5->2
    function heapLeftChildIndex(n: number): number {
        return n * 2;
    } // (0->0,) 1->2, 2->4
    function heapRightChildIndex(n: number): number {
        return n * 2 + 1;
    } // (0->1,) 1->3, 2->5


    function heapSwap(h: T[], i: number, j: number): void {
        [h[i], h[j]] = [h[j], h[i]];
    }
    function heapCompareLT(h: T[], index: number, other: number) {
        return lessThan(h[index],h[other]);
    }
    function heapCompareGT(h: T[], index: number, other: number) {
        return greaterThan(h[index],h[other]);
    }

    function heapCreate(t?: T): T[] {
        return [t ?? (undefined as any as T)]; // dummy element at zero index
    }
    // function heapAt(h: T[], index: number): T {
    //     return h[index + 1];
    // }
    function heapSize(h: T[]): number {
        return h.length - 1;
    }
    function heapInsert(h: T[], s: T): void {
        const index = h.push(s) - 1;
        heapMoveUp(h, index);
    }
    function heapIsEmpty(h: T[]): boolean {
        return h.length === 1;
    }
    // must never be called when heap is empty - call isEmpty first if in doubt
    function heapRemove(h: T[]): T {
        if (heapSize(h) === 0) Debug.fail(`heapRemove called on empty heap`);
        if (heapSize(h) === 1) {
            return h.pop()!;
        }
        else {
            const ret = h[1];
            h[1] = h.pop()!;
            heapMoveDown(h, 1);
            return ret;
        }
    }
    function heapPeek(h: T[]): T {
        if (heapSize(h) === 0) Debug.fail(`heapPeek called on empty heap`);
        return h[1];
    }

    function heapMoveUp(h: T[], index: number): void {
        while (index !== 1) {
            const parentIndex = heapParentIndex(index);
            if (heapCompareLT(h, index, parentIndex)) {
                heapSwap(h, index, parentIndex);
                index = parentIndex;
            }
            else break;
        }
    }

    function heapMoveDown(h: T[], index: number, forceSize?: number): void {
        const max = forceSize??heapSize(h);
        while (true) {
            const lidx = heapLeftChildIndex(index);
            const ridx = heapRightChildIndex(index);
            if (lidx > max) break;
            if (
                heapCompareGT(h, index, lidx) &&
                (ridx > max || !heapCompareGT(h, lidx, ridx))
            ) {
                heapSwap(h, index, lidx);
                index = lidx;
                continue;
            }
            if (ridx > max) break;
            if (heapCompareGT(h, index, ridx)) {
                heapSwap(h, index, ridx);
                index = ridx;
                continue;
            }
            break;
        }
    }

    function heapifyInPlace(h: T[], size: number) {
        for (let i = 2; i <= size; i++) {
            heapMoveUp(h, i);
        }
    }

    /**
     * Indexing starts from 1
     * So if passed a 0 indexed array z, it will touch elements
     * z[1] through z[size], ignoring z[0]
     * */
    function heapSortInPlace(h: T[], size: number) {
        if (size === 1) return;
        heapifyInPlace(h, size);
        for (let i = 1; i < size; i++) {
            const tmpsz = size - i + 1;
            heapSwap(h, 1, tmpsz);
            heapMoveDown(h, 1, tmpsz - 1);
        }
    }

    return {
      heapSortInPlace,
      createEmptyHeap(){ return heapCreate(dummy); },
      heapInsert,
      heapRemove,
      heapSize,
      heapIsEmpty,
      heapPeek
    };

}

}
