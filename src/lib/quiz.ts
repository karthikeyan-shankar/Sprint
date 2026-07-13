import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./firebase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type QuizMode = "classic" | "buzzer";
export type RoomStatus = "lobby" | "active" | "question" | "reveal" | "finished";

export interface QuizRoom {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  mode: QuizMode;
  roomCode: string;
  status: RoomStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionStartedAt?: Timestamp;
  buzzerLockedBy?: string | null;
  createdAt?: Timestamp;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
  order: number;
}

export interface QuizPlayer {
  id: string;
  uid: string;
  name: string;
  score: number;
  streak: number;
  joinedAt?: Timestamp;
}

export interface QuizAnswer {
  id: string;
  uid: string;
  questionIndex: number;
  selectedIndex: number;
  correct: boolean;
  timeMs: number;
  answeredAt?: Timestamp;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateRoomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = {};
  for (const k of Object.keys(obj)) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

const ROOMS = "quizRooms";
const questionsCol = (roomId: string) => `${ROOMS}/${roomId}/questions`;
const playersCol = (roomId: string) => `${ROOMS}/${roomId}/players`;
const answersCol = (roomId: string) => `${ROOMS}/${roomId}/answers`;

/* ------------------------------------------------------------------ */
/*  Room CRUD                                                          */
/* ------------------------------------------------------------------ */

export async function createRoom(
  hostId: string,
  hostName: string,
  title: string,
  mode: QuizMode,
  questions: Omit<QuizQuestion, "id">[],
): Promise<{ roomId: string; roomCode: string }> {
  const db = getDb();
  const roomCode = generateRoomCode();

  const roomRef = await addDoc(collection(db, ROOMS), stripUndefined({
    hostId,
    hostName,
    title,
    mode,
    roomCode,
    status: "lobby" as RoomStatus,
    currentQuestionIndex: -1,
    totalQuestions: questions.length,
    createdAt: serverTimestamp(),
  }));

  // Add questions as sub-collection
  for (let i = 0; i < questions.length; i++) {
    await setDoc(doc(db, questionsCol(roomRef.id), String(i)), {
      text: questions[i].text,
      options: questions[i].options,
      correctIndex: questions[i].correctIndex,
      timeLimitSec: questions[i].timeLimitSec,
      order: i,
    });
  }

  return { roomId: roomRef.id, roomCode };
}

export async function getRoom(roomId: string): Promise<QuizRoom | null> {
  const snap = await getDoc(doc(getDb(), ROOMS, roomId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<QuizRoom, "id">) };
}

export async function getRoomByCode(code: string): Promise<QuizRoom | null> {
  const q = query(collection(getDb(), ROOMS), where("roomCode", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<QuizRoom, "id">) };
}

export async function updateRoom(roomId: string, patch: Partial<QuizRoom>) {
  await updateDoc(doc(getDb(), ROOMS, roomId), stripUndefined(patch));
}

export async function deleteRoom(roomId: string) {
  await deleteDoc(doc(getDb(), ROOMS, roomId));
}

/* ------------------------------------------------------------------ */
/*  Questions                                                          */
/* ------------------------------------------------------------------ */

export async function getQuestions(roomId: string): Promise<QuizQuestion[]> {
  const snap = await getDocs(collection(getDb(), questionsCol(roomId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<QuizQuestion, "id">) }))
    .sort((a, b) => a.order - b.order);
}

export async function getQuestion(roomId: string, index: number): Promise<QuizQuestion | null> {
  const snap = await getDoc(doc(getDb(), questionsCol(roomId), String(index)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<QuizQuestion, "id">) };
}

/* ------------------------------------------------------------------ */
/*  Players                                                            */
/* ------------------------------------------------------------------ */

export async function joinRoom(roomId: string, uid: string, name: string): Promise<void> {
  const db = getDb();
  await setDoc(doc(db, playersCol(roomId), uid), {
    uid,
    name,
    score: 0,
    streak: 0,
    joinedAt: serverTimestamp(),
  });
}

export async function getPlayers(roomId: string): Promise<QuizPlayer[]> {
  const snap = await getDocs(collection(getDb(), playersCol(roomId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<QuizPlayer, "id">) }))
    .sort((a, b) => b.score - a.score);
}

export async function updatePlayerScore(roomId: string, uid: string, score: number, streak: number) {
  await updateDoc(doc(getDb(), playersCol(roomId), uid), { score, streak });
}

/* ------------------------------------------------------------------ */
/*  Answers                                                            */
/* ------------------------------------------------------------------ */

export async function submitAnswer(
  roomId: string,
  uid: string,
  questionIndex: number,
  selectedIndex: number,
  correct: boolean,
  timeMs: number,
): Promise<void> {
  const db = getDb();
  const answerId = `${uid}_${questionIndex}`;
  await setDoc(doc(db, answersCol(roomId), answerId), {
    uid,
    questionIndex,
    selectedIndex,
    correct,
    timeMs,
    answeredAt: serverTimestamp(),
  });
}

export async function getAnswersForQuestion(roomId: string, questionIndex: number): Promise<QuizAnswer[]> {
  const q = query(
    collection(getDb(), answersCol(roomId)),
    where("questionIndex", "==", questionIndex),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuizAnswer, "id">) }));
}

export async function hasAnswered(roomId: string, uid: string, questionIndex: number): Promise<boolean> {
  const snap = await getDoc(doc(getDb(), answersCol(roomId), `${uid}_${questionIndex}`));
  return snap.exists();
}

/* ------------------------------------------------------------------ */
/*  Real-time listeners                                                */
/* ------------------------------------------------------------------ */

export function onRoomChange(roomId: string, cb: (room: QuizRoom | null) => void): Unsubscribe {
  return onSnapshot(doc(getDb(), ROOMS, roomId), (snap) => {
    if (!snap.exists()) return cb(null);
    cb({ id: snap.id, ...(snap.data() as Omit<QuizRoom, "id">) });
  });
}

export function onPlayersChange(roomId: string, cb: (players: QuizPlayer[]) => void): Unsubscribe {
  return onSnapshot(collection(getDb(), playersCol(roomId)), (snap) => {
    const players = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<QuizPlayer, "id">) }))
      .sort((a, b) => b.score - a.score);
    cb(players);
  });
}

export function onAnswersChange(
  roomId: string,
  questionIndex: number,
  cb: (answers: QuizAnswer[]) => void,
): Unsubscribe {
  const q = query(
    collection(getDb(), answersCol(roomId)),
    where("questionIndex", "==", questionIndex),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuizAnswer, "id">) })));
  });
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

/** Classic mode: faster answers = more points. Max 1000, min 200 */
export function calcScore(timeMs: number, timeLimitSec: number, streak: number): number {
  const maxTime = timeLimitSec * 1000;
  const fraction = Math.max(0, 1 - timeMs / maxTime);
  const base = Math.round(200 + 800 * fraction);
  const streakBonus = Math.min(streak, 5) * 50;
  return base + streakBonus;
}
