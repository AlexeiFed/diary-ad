import { useState, useEffect } from 'react';
import { BloodPressureForm } from './components/BloodPressureForm';
import { RecordsList } from './components/RecordsList';
import { Chart } from './components/Chart';
import { getAllRecords, deleteRecord, BloodPressureRecord, initDB } from './lib/db';
import { designTokens } from './lib/design-tokens';

function App() {
  const [records, setRecords] = useState<BloodPressureRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'chart'>('form');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadRecords = async () => {
      try {
        await initDB();
        const allRecords = await getAllRecords();
        setRecords(allRecords);
      } catch (error) {
        console.error('Ошибка при загрузке записей:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  const handleRecordAdded = async () => {
    const allRecords = await getAllRecords();
    setRecords(allRecords);
    setActiveTab('history');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecord(id);
      const allRecords = await getAllRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  // Filter records based on selected date
  const filteredRecords = selectedDate
    ? records.filter(record => record.date === selectedDate)
    : records;

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>📊 Дневник АД</h1>
        <p style={styles.subtitle}>Отслеживание артериального давления</p>
      </header>

      <nav style={styles.nav}>
        <button
          onClick={() => setActiveTab('form')}
          style={{
            ...styles.navButton,
            ...(activeTab === 'form' ? styles.navButtonActive : {})
          }}
        >
          ➕ Добавить
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            ...styles.navButton,
            ...(activeTab === 'history' ? styles.navButtonActive : {})
          }}
        >
          📋 История
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          style={{
            ...styles.navButton,
            ...(activeTab === 'chart' ? styles.navButtonActive : {})
          }}
        >
          📈 График
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === 'form' && <BloodPressureForm onSuccess={handleRecordAdded} />}
        {activeTab === 'history' && (
          <>
            <div style={styles.filterContainer}>
              <div style={styles.filterRow}>
                <label style={styles.filterLabel}>Фильтр по дате:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={styles.dateInput}
                />
                <button
                  onClick={() => setSelectedDate('')}
                  style={styles.clearButton}
                >
                  Показать все
                </button>
              </div>
              <div style={styles.sortRow}>
                <label style={styles.filterLabel}>Сортировка:</label>
                <button
                  onClick={() => setSortOrder('desc')}
                  style={{
                    ...styles.sortButton,
                    ...(sortOrder === 'desc' ? styles.sortButtonActive : {})
                  }}
                >
                  ↓ По убыванию
                </button>
                <button
                  onClick={() => setSortOrder('asc')}
                  style={{
                    ...styles.sortButton,
                    ...(sortOrder === 'asc' ? styles.sortButtonActive : {})
                  }}
                >
                  ↑ По возрастанию
                </button>
              </div>
            </div>
            <RecordsList records={filteredRecords} onDelete={handleDelete} sortOrder={sortOrder} />
          </>
        )}
        {activeTab === 'chart' && <Chart records={records} />}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: designTokens.colors.background,
    paddingBottom: designTokens.spacing.xxl
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: designTokens.colors.background
  },
  loadingText: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.textSecondary
  },
  header: {
    textAlign: 'center',
    padding: `${designTokens.spacing.xl} ${designTokens.spacing.md}`,
    backgroundColor: designTokens.colors.surfaceElevated,
    boxShadow: designTokens.shadows.sm,
    borderBottom: `1px solid ${designTokens.colors.border}`
  },
  title: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.text,
    marginBottom: designTokens.spacing.xs
  },
  subtitle: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.textSecondary
  },
  nav: {
    display: 'flex',
    gap: designTokens.spacing.sm,
    padding: designTokens.spacing.md,
    backgroundColor: designTokens.colors.surface,
    borderBottom: `1px solid ${designTokens.colors.border}`
  },
  navButton: {
    flex: 1,
    padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.surfaceElevated,
    color: designTokens.colors.text,
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    border: `1px solid ${designTokens.colors.border}`
  },
  navButtonActive: {
    backgroundColor: designTokens.colors.primary,
    color: '#ffffff',
    borderColor: designTokens.colors.primary
  },
  main: {
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%'
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: designTokens.spacing.sm,
    padding: `${designTokens.spacing.md} ${designTokens.spacing.md}`,
    backgroundColor: designTokens.colors.surface,
    borderBottom: `1px solid ${designTokens.colors.border}`
  },
  filterRow: {
    display: 'flex',
    gap: designTokens.spacing.md,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  sortRow: {
    display: 'flex',
    gap: designTokens.spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  filterLabel: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.text,
    whiteSpace: 'nowrap'
  },
  dateInput: {
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    borderRadius: designTokens.borderRadius.md,
    border: `1px solid ${designTokens.colors.border}`,
    fontSize: designTokens.typography.fontSize.sm,
    fontFamily: designTokens.typography.fontFamily,
    color: designTokens.colors.text,
    backgroundColor: designTokens.colors.surfaceElevated,
    cursor: 'pointer'
  },
  clearButton: {
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.surfaceElevated,
    color: designTokens.colors.textSecondary,
    border: `1px solid ${designTokens.colors.border}`,
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  sortButton: {
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.surfaceElevated,
    color: designTokens.colors.textSecondary,
    border: `1px solid ${designTokens.colors.border}`,
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  sortButtonActive: {
    backgroundColor: designTokens.colors.primary,
    color: '#ffffff',
    borderColor: designTokens.colors.primary
  }
};

export default App;


