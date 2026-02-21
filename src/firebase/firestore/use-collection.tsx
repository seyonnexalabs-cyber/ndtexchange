'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* 
  This is a simplified interface for accessing internal properties of a Firestore query.
  These properties are not part of the public API and may change, but are useful for debugging.
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    },
    limit?: number | null,
    filters: any[],
    orderBy: any[],
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 * 
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Directly use memoizedTargetRefOrQuery as it's assumed to be the final query
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const internalQuery = (memoizedTargetRefOrQuery as unknown as InternalQuery)._query;
        const path: string = internalQuery.path.canonicalString();

        const queryConstraints: any = {};
        if (internalQuery.limit != null) {
          queryConstraints.limit = internalQuery.limit;
        }

        if (internalQuery.filters && internalQuery.filters.length > 0) {
            // This is a simplified representation of the filters for debugging purposes.
            // It accesses internal properties that may change in future SDK versions.
            queryConstraints.where = internalQuery.filters.map((f: any) => {
                try {
                    const fieldPath = f.field.canonicalString();
                    // Firestore stores different value types in different keys (e.g., stringValue, integerValue)
                    // We'll try to find any value that exists.
                    const value = f.value.stringValue ?? f.value.integerValue ?? f.value.doubleValue ?? f.value.booleanValue ?? f.value.arrayValue?.values?.map((v:any) => v.stringValue) ?? 'COMPLEX_VALUE';
                    return [fieldPath, f.op, value];
                } catch {
                    return ["<parsing_error>", f.op, "<parsing_error>"];
                }
            });
        }
        
        if (internalQuery.orderBy && internalQuery.orderBy.length > 0) {
            queryConstraints.orderBy = internalQuery.orderBy.map((o: any) => ({
                field: o.field.canonicalString(),
                direction: o.dir,
            }));
        }

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
          query: Object.keys(queryConstraints).length > 0 ? queryConstraints : undefined,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]); // Re-run if the target query/reference changes.
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }
  return { data, isLoading, error };
}
