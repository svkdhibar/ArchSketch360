import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ArchObject, CloudProjectRecord } from './types';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Infrastructure per Firebase Skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Startup connection test
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears to be offline. Auto-sync will retry when connected.');
    }
  }
}

// Clean helper: Firestore rejects undefined values, so strip them cleanly
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export type { CloudProjectRecord };

// Google Auth Actions
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Sign-in with Google failed', err);
    throw err;
  }
}

export async function signOutFromGoogle(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out failed', err);
    throw err;
  }
}

export const signOutUser = signOutFromGoogle;

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Cloud Project Persistence Functions
export async function saveProjectToCloud(
  userId: string,
  project: {
    id: string;
    title: string;
    objects: ArchObject[];
    objectCount?: number;
    createdAt?: string;
  }
): Promise<CloudProjectRecord> {
  const docPath = `users/${userId}/projects/${project.id}`;
  const now = new Date().toISOString();

  // If already exists, preserve original createdAt
  let originalCreatedAt = project.createdAt || now;
  try {
    const existingDoc = await getDoc(doc(db, 'users', userId, 'projects', project.id));
    if (existingDoc.exists()) {
      const data = existingDoc.data();
      if (data?.createdAt) {
        originalCreatedAt = data.createdAt;
      }
    }
  } catch {
    // If not found or initial write, fallback to originalCreatedAt
  }

  const payload: CloudProjectRecord = {
    id: project.id,
    userId,
    title: (project.title || 'Untitled_FloorPlan').trim().slice(0, 120),
    objectCount: project.objects.length,
    objects: sanitizeForFirestore(project.objects),
    createdAt: originalCreatedAt,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'users', userId, 'projects', project.id), payload);
    return payload;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deleteProjectFromCloud(userId: string, projectId: string): Promise<void> {
  const docPath = `users/${userId}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeToUserProjects(
  userId: string,
  onData: (projects: CloudProjectRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const collectionPath = `users/${userId}/projects`;
  const q = query(collection(db, 'users', userId, 'projects'));

  return onSnapshot(
    q,
    (snapshot) => {
      const projects: CloudProjectRecord[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as CloudProjectRecord;
        projects.push(item);
      });
      // Sort newest updated first
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(projects);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
      if (onError) onError(error);
    }
  );
}
