// Multiply by 2 is faster that (or same as) shifting according to
// https://thefullsnack.com/en/bitwise-javascript-fast.html



  // 1-based indexing
  export function heapParentIndex(n: number): number {
    return n >> 1;
  } // (1->0,) 2->1, 3->1, 4->2, 5->2
  export function heapLeftChildIndex(n: number): number {
    return n * 2;
  } // (0->0,) 1->2, 2->4
  export function heapRightChildIndex(n: number): number {
    return n * 2 + 1;
  } // (0->1,) 1->3, 2->5


  export function heapSwap<T, Heap extends T[]>(h: Heap, i: number, j: number): void {
    [h[i], h[j]] = [h[j], h[i]];
  }
  export function heapCompareLT<T, Heap extends T[]>(h: Heap, index: number, other: number, lessThan: (i: T, o: T) => boolean) {
    return lessThan(h[index],h[other]);
  }
  export function heapCompareGT<T, Heap extends T[]>(h: Heap, index: number, other: number, greaterThan: (i: T, o: T) => boolean) {
    return greaterThan(h[index],h[other]);
  }

  export function heapCreate<T>(t?: T): T[] {
    return [t ?? (undefined as any as T)]; // dummy element at zero index
  }
  export function heapAt<T>(h: T[], index: number): T {
    return h[index + 1];
  }
  export function heapSize<T>(h: T[]): number {
    return h.length - 1;
  }
  export function heapInsert<T>(h: T[], s: T, lessThan: (i: T, o: T) => boolean): void {
    const index = h.push(s) - 1;
    heapMoveUp(h, index, lessThan);
  }
  export function heapIsEmpty<T>(h: T[]): boolean {
    return h.length === 1;
  }
  // must never be called when heap is empty - call isEmpty first if in doubt
  export function heapRemove<T>(h: T[], greaterThan: (i: T, o: T) => boolean): T {
    if (heapSize(h) === 0) throw new Error(`heapRemove called on empty heap`);
    if (heapSize(h) === 1) {
      return h.pop()!;
    }
    else {
      const ret = h[1];
      h[1] = h.pop()!;
      heapMoveDown(h, 1, greaterThan);
      return ret;
    }
  }

  export function heapMoveUp<T>(h: T[], index: number, lessThan: (i: T, o: T) => boolean): void {
    while (index !== 1) {
      const parentIndex = heapParentIndex(index);
      if (heapCompareLT(h, index, parentIndex, lessThan)) {
        heapSwap(h, index, parentIndex);
        index = parentIndex;
      }
      else break;
    }
  }

  export function heapMoveDown<T>(h: T[], index: number, greaterThan: (i: T, o: T) => boolean, forceSize?: number): void {
    const max = forceSize??heapSize(h);
    while (true) {
      const lidx = heapLeftChildIndex(index);
      const ridx = heapRightChildIndex(index);
      if (lidx > max) break;
      if (
        heapCompareGT(h, index, lidx, greaterThan) &&
        (ridx > max || !heapCompareGT(h, lidx, ridx, greaterThan))
      ) {
        heapSwap(h, index, lidx);
        index = lidx;
        continue;
      }
      if (ridx > max) break;
      if (heapCompareGT(h, index, ridx, greaterThan)) {
        heapSwap(h, index, ridx);
        index = ridx;
        continue;
      }
      break;
    }
  }

  export function heapifyInPlace<T>(h: T[], size: number, lessThan: (i: T, o: T) => boolean) {
    for (let i = 2; i <= size; i++) {
      heapMoveUp(h, i, lessThan);
    }
  }

  /**
   * Indexing starts from 1
   * So if passed a 0 indexed array z, it will touch elements
   * z[1] through z[length], ignoring z[0]
   * */
  export function heapSortInPlace<T>(h: T[], size: number, lessThan: (i: T, o: T) => boolean, greaterThan: (i: T, o: T) => boolean) {
    if (size === 1) return;
    heapifyInPlace(h, size, lessThan);
    for (let i = 1; i < size; i++) {
      const tmpsz = size - i + 1;
      heapSwap(h, 1, tmpsz);
      heapMoveDown(h, 1, greaterThan, tmpsz - 1);
    }
  }

