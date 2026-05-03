import { useEffect, useState } from "react";
import {
  subscribeToCollection,
  subscribeToCollectionWhere,
} from "../firebase/firestore";

/**
 * Subscribe to an entire collection.
 * Returns { data, loading }
 */
export function useCollection(collectionName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCollection(collectionName, (docs) => {
      setData(docs);
      setLoading(false);
    });
    return unsub;
  }, [collectionName]);

  return { data, loading };
}

/**
 * Subscribe to a filtered collection.
 * Returns { data, loading }
 */
export function useCollectionWhere(collectionName, field, value) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!value) return;
    const unsub = subscribeToCollectionWhere(
      collectionName,
      field,
      value,
      (docs) => {
        setData(docs);
        setLoading(false);
      }
    );
    return unsub;
  }, [collectionName, field, value]);

  return { data, loading };
}