import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Movement, Workout, WorkoutEntry, Template, UserSettings } from '@/types';

// ── Helpers ──────────────────────────────────────────────

function userCol(userId: string, col: string) {
  return collection(db, 'users', userId, col);
}

function userDoc(userId: string, col: string, docId: string) {
  return doc(db, 'users', userId, col, docId);
}

// ── Movements ────────────────────────────────────────────

export async function getMovements(userId: string): Promise<Movement[]> {
  const snap = await getDocs(userCol(userId, 'movements'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Movement));
}

export async function addMovement(userId: string, movement: Omit<Movement, 'id'>): Promise<string> {
  const ref = doc(userCol(userId, 'movements'));
  await setDoc(ref, movement);
  return ref.id;
}

export async function updateMovement(userId: string, id: string, data: Partial<Movement>): Promise<void> {
  await updateDoc(userDoc(userId, 'movements', id), data);
}

export async function deleteMovement(userId: string, id: string): Promise<void> {
  await deleteDoc(userDoc(userId, 'movements', id));
}

// ── Workouts ─────────────────────────────────────────────

export async function getWorkouts(userId: string): Promise<Workout[]> {
  const snap = await getDocs(
    query(userCol(userId, 'workouts'), orderBy('createdAt', 'desc'))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Workout))
    .filter((w) => w.entries && w.entries.length > 0);
}

export async function getTodayWorkout(userId: string): Promise<Workout | null> {
  const today = new Date().toISOString().slice(0, 10);
  const snap = await getDocs(
    query(userCol(userId, 'workouts'), where('date', '==', today))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Workout;
}

export async function createWorkout(userId: string, workout: Omit<Workout, 'id'>): Promise<string> {
  const ref = doc(userCol(userId, 'workouts'));
  await setDoc(ref, workout);
  return ref.id;
}

export async function addEntriesToWorkout(
  userId: string,
  workoutId: string,
  newEntries: WorkoutEntry[]
): Promise<void> {
  const ref = userDoc(userId, 'workouts', workoutId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as Omit<Workout, 'id'>;
  const entries = [...(data.entries || []), ...newEntries];
  await updateDoc(ref, { entries });
}

export async function addEntryToWorkout(
  userId: string,
  workoutId: string,
  entry: WorkoutEntry
): Promise<void> {
  await addEntriesToWorkout(userId, workoutId, [entry]);
}

export async function updateWorkoutEntries(
  userId: string,
  workoutId: string,
  entries: WorkoutEntry[]
): Promise<void> {
  if (entries.length === 0) {
    await deleteDoc(userDoc(userId, 'workouts', workoutId));
    return;
  }
  await updateDoc(userDoc(userId, 'workouts', workoutId), { entries });
}

export async function completeWorkout(userId: string, workoutId: string): Promise<void> {
  await updateDoc(userDoc(userId, 'workouts', workoutId), { completed: true });
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<void> {
  await deleteDoc(userDoc(userId, 'workouts', workoutId));
}

// ── Templates ────────────────────────────────────────────

export async function getTemplates(userId: string): Promise<Template[]> {
  const snap = await getDocs(
    query(userCol(userId, 'templates'), orderBy('order', 'asc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Template));
}

export async function addTemplate(userId: string, template: Omit<Template, 'id'>): Promise<string> {
  const ref = doc(userCol(userId, 'templates'));
  await setDoc(ref, template);
  return ref.id;
}

export async function updateTemplate(userId: string, id: string, data: Partial<Template>): Promise<void> {
  await updateDoc(userDoc(userId, 'templates', id), data);
}

export async function deleteTemplate(userId: string, id: string): Promise<void> {
  await deleteDoc(userDoc(userId, 'templates', id));
}

export async function reorderTemplates(userId: string, templates: Template[]): Promise<void> {
  const batch = writeBatch(db);
  templates.forEach((t, i) => {
    batch.update(userDoc(userId, 'templates', t.id), { order: i });
  });
  await batch.commit();
}

// ── Settings ─────────────────────────────────────────────

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const ref = doc(db, 'users', userId, 'settings', 'current');
  const snap = await getDoc(ref);
  if (!snap.exists()) return { unit: 'kg', theme: 'system' };
  return snap.data() as UserSettings;
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  const ref = doc(db, 'users', userId, 'settings', 'current');
  await setDoc(ref, settings, { merge: true });
}

// ── Seeding ──────────────────────────────────────────────

export async function seedMovements(userId: string): Promise<void> {
  const existing = await getMovements(userId);
  if (existing.length > 0) return;

  const defaults: Record<string, string[]> = {
    Legs: ['Squat', 'Front Squat', 'Hack Squat', 'Leg Press', 'Romanian Deadlift', 'Walking Lunge', 'Bulgarian Split Squat', 'Leg Extension', 'Leg Curl', 'Hip Thrust', 'Calf Raise', 'Goblet Squat'],
    Back: ['Deadlift', 'Barbell Row', 'Dumbbell Row', 'Seated Cable Row', 'T-Bar Row', 'Pull-Up', 'Chin-Up', 'Lat Pulldown', 'Face Pull', 'Shrug'],
    Chest: ['Bench Press', 'Incline Bench Press', 'Dumbbell Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Dumbbell Fly', 'Chest Dip', 'Push-Up', 'Machine Chest Press'],
    Shoulders: ['Overhead Press', 'Dumbbell Shoulder Press', 'Arnold Press', 'Lateral Raise', 'Front Raise', 'Reverse Fly', 'Upright Row'],
    Arms: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Cable Curl', 'Tricep Pushdown', 'Overhead Tricep Extension', 'Skull Crusher', 'Close-Grip Bench Press', 'Tricep Dip'],
    Core: ['Plank', 'Hanging Leg Raise', 'Cable Crunch', 'Ab Wheel Rollout', 'Dead Bug', 'Russian Twist', 'Decline Sit-Up'],
    Cardio: ['Running', 'Rowing Machine', 'Stationary Bike', 'Jump Rope', 'Stair Climber'],
  };

  const batch = writeBatch(db);
  for (const [category, names] of Object.entries(defaults)) {
    for (const name of names) {
      const ref = doc(userCol(userId, 'movements'));
      batch.set(ref, { name, category, isCustom: false });
    }
  }
  await batch.commit();
}

export async function seedTemplates(userId: string): Promise<void> {
  const existing = await getTemplates(userId);
  if (existing.length > 0) return;

  const templates: Omit<Template, 'id'>[] = [
    {
      name: 'Push Day',
      entries: [
        { movementName: 'Bench Press', reps: 8, weight: 60, unit: 'kg' },
        { movementName: 'Overhead Press', reps: 8, weight: 40, unit: 'kg' },
        { movementName: 'Incline Dumbbell Press', reps: 10, weight: 22, unit: 'kg' },
        { movementName: 'Lateral Raise', reps: 12, weight: 10, unit: 'kg' },
        { movementName: 'Tricep Pushdown', reps: 12, weight: 25, unit: 'kg' },
      ],
      createdAt: Date.now(),
      order: 0,
    },
    {
      name: 'Pull Day',
      entries: [
        { movementName: 'Deadlift', reps: 5, weight: 100, unit: 'kg' },
        { movementName: 'Barbell Row', reps: 8, weight: 60, unit: 'kg' },
        { movementName: 'Lat Pulldown', reps: 10, weight: 50, unit: 'kg' },
        { movementName: 'Face Pull', reps: 15, weight: 15, unit: 'kg' },
        { movementName: 'Barbell Curl', reps: 10, weight: 25, unit: 'kg' },
      ],
      createdAt: Date.now(),
      order: 1,
    },
    {
      name: 'Leg Day',
      entries: [
        { movementName: 'Squat', reps: 8, weight: 80, unit: 'kg' },
        { movementName: 'Romanian Deadlift', reps: 10, weight: 60, unit: 'kg' },
        { movementName: 'Leg Press', reps: 12, weight: 120, unit: 'kg' },
        { movementName: 'Leg Curl', reps: 12, weight: 35, unit: 'kg' },
        { movementName: 'Calf Raise', reps: 15, weight: 40, unit: 'kg' },
      ],
      createdAt: Date.now(),
      order: 2,
    },
  ];

  const batch = writeBatch(db);
  for (const t of templates) {
    const ref = doc(userCol(userId, 'templates'));
    batch.set(ref, t);
  }
  await batch.commit();
}
