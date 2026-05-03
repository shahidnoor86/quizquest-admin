import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";

// ─── Generic helpers ────────────────────────────────────────────────────────

export const addDocument = (collectionName, data) =>
  addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });

export const deleteDocument = (collectionName, id) =>
  deleteDoc(doc(db, collectionName, id));

export const getDocument = (collectionName, id) =>
  getDoc(doc(db, collectionName, id));

// ─── Real-time listeners ─────────────────────────────────────────────────────

/** Subscribe to all documents in a collection (ordered by createdAt). */
export const subscribeToCollection = (collectionName, callback) => {
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
};

/** Subscribe to documents in a collection filtered by a field value. */
export const subscribeToCollectionWhere = (
  collectionName,
  field,
  value,
  callback
) => {
  const q = query(
    collection(db, collectionName),
    where(field, "==", value)
  );
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
};