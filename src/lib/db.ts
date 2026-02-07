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

export const exportRecordsAsHTML = (records: BloodPressureRecord[]): string => {
  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);
  
  const timeLabels: Record<string, string> = {
    morning: 'Утро',
    evening: 'Вечер'
  };
  
  const rows = sortedRecords.map(record => {
    const dateObj = new Date(record.date);
    const formattedDate = dateObj.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    return `
      <tr>
        <td>${formattedDate}</td>
        <td>${timeLabels[record.time]}</td>
        <td>${record.systolic}</td>
        <td>${record.diastolic}</td>
        <td>${record.pulse || '-'}</td>
        <td>${record.notes || '-'}</td>
      </tr>
    `;
  }).join('');
  
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Экспорт данных - Дневник АД</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: #f5f5f5;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }
    .info {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #4a90e2;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f8f9fa;
    }
    tr:last-child td {
      border-bottom: none;
    }
    @media print {
      body {
        background: white;
      }
      table {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <h1>📊 Дневник артериального давления</h1>
  <div class="info">
    <p>Экспортировано: ${new Date().toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
    <p>Всего записей: ${records.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Дата</th>
        <th>Время суток</th>
        <th>Систолическое (верхнее)</th>
        <th>Диастолическое (нижнее)</th>
        <th>Пульс</th>
        <th>Примечания</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>
  `;
};


