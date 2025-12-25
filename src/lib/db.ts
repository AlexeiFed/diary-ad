export interface BloodPressureRecord {
  id: string;
  date: string;
  time: 'morning' | 'evening';
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
  timestamp: number;
}

const DB_NAME = 'diary-ad-db';
const STORE_NAME = 'records';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        objectStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

export const addRecord = async (record: Omit<BloodPressureRecord, 'id' | 'timestamp'>): Promise<void> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  const fullRecord: BloodPressureRecord = {
    ...record,
    id: `${record.date}-${record.time}-${Date.now()}`,
    timestamp: Date.now()
  };

  return new Promise((resolve, reject) => {
    const request = store.add(fullRecord);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllRecords = async (): Promise<BloodPressureRecord[]> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('timestamp');

  return new Promise((resolve, reject) => {
    const request = index.openCursor(null, 'prev');
    const records: BloodPressureRecord[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        resolve(records);
      }
    };

    request.onerror = () => reject(request.error);
  });
};

export const getRecordsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<BloodPressureRecord[]> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('date');

  return new Promise((resolve, reject) => {
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.openCursor(range);
    const records: BloodPressureRecord[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        resolve(records.sort((a, b) => b.timestamp - a.timestamp));
      }
    };

    request.onerror = () => reject(request.error);
  });
};

export const deleteRecord = async (id: string): Promise<void> => {
  const database = await initDB();
  const transaction = database.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};


