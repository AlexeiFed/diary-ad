import { BloodPressureRecord } from '../lib/db';
import { format, parseISO } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { designTokens } from '../lib/design-tokens';

interface RecordsListProps {
  records: BloodPressureRecord[];
  onDelete: (id: string) => void;
  sortOrder?: 'asc' | 'desc';
}

interface RecordsByDay {
  [date: string]: {
    morning?: BloodPressureRecord;
    evening?: BloodPressureRecord;
  };
}

const RecordCard = ({ record, onDelete }: { record: BloodPressureRecord; onDelete: (id: string) => void }) => {
  const getPressureStatus = (systolic: number, diastolic: number): { color: string; label: string } => {
    if (systolic >= 140 || diastolic >= 90) {
      return { color: designTokens.colors.danger, label: 'Повышенное' };
    }
    if (systolic < 90 || diastolic < 60) {
      return { color: designTokens.colors.warning, label: 'Пониженное' };
    }
    return { color: designTokens.colors.success, label: 'Нормальное' };
  };

  const status = getPressureStatus(record.systolic, record.diastolic);

  return (
    <div style={styles.recordCard}>
      <div style={styles.recordCardHeader}>
        <div style={styles.timeLabel}>
          {record.time === 'morning' ? '🌅 Утро' : '🌆 Вечер'}
        </div>
        <button
          onClick={() => onDelete(record.id)}
          style={styles.deleteButton}
          aria-label="Удалить запись"
        >
          ×
        </button>
      </div>

      <div style={styles.recordPressure}>
        <div style={styles.pressureValue}>
          <span style={styles.pressureNumber}>{record.systolic}</span>
          <span style={styles.pressureSlash}>/</span>
          <span style={styles.pressureNumber}>{record.diastolic}</span>
          <span style={styles.pressureUnit}> мм рт.ст.</span>
        </div>
        <div style={{ ...styles.status, color: status.color }}>
          {status.label}
        </div>
      </div>

      {(record.pulse || record.notes) && (
        <div style={styles.recordAdditional}>
          {record.pulse && (
            <div style={styles.pulse}>
              <span style={styles.pulseLabel}>Пульс:</span>
              <span style={styles.pulseValue}>{record.pulse} уд/мин</span>
            </div>
          )}
          {record.notes && (
            <div style={styles.notes}>{record.notes}</div>
          )}
        </div>
      )}
    </div>
  );
};

export const RecordsList = ({ records, onDelete, sortOrder = 'desc' }: RecordsListProps) => {
  // Group records by date
  const recordsByDay: RecordsByDay = records.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][record.time] = record;
    return acc;
  }, {} as RecordsByDay);

  // Sort dates based on sortOrder
  const sortedDates = Object.keys(recordsByDay).sort((a, b) => {
    const timeA = new Date(a).getTime();
    const timeB = new Date(b).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  if (records.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>Записей пока нет</p>
        <p style={styles.emptySubtext}>Добавьте первую запись выше</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {sortedDates.map((date) => {
        const dayRecords = recordsByDay[date];
        const parsedDate = parseISO(date);

        return (
          <div key={date} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.date}>
                {format(parsedDate, 'd MMMM yyyy', { locale: ru })}
              </div>
            </div>

            <div style={styles.dayColumns}>
              <div style={styles.column}>
                {dayRecords.morning ? (
                  <RecordCard record={dayRecords.morning} onDelete={onDelete} />
                ) : (
                  <div style={styles.emptyColumn}>
                    <span style={styles.emptyColumnText}>🌅 Утро</span>
                    <span style={styles.emptyColumnSubtext}>нет данных</span>
                  </div>
                )}
              </div>

              <div style={styles.column}>
                {dayRecords.evening ? (
                  <RecordCard record={dayRecords.evening} onDelete={onDelete} />
                ) : (
                  <div style={styles.emptyColumn}>
                    <span style={styles.emptyColumnText}>🌆 Вечер</span>
                    <span style={styles.emptyColumnSubtext}>нет данных</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: designTokens.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: designTokens.spacing.md
  },
  empty: {
    padding: designTokens.spacing.xxl,
    textAlign: 'center',
    color: designTokens.colors.textSecondary
  },
  emptyText: {
    fontSize: designTokens.typography.fontSize.lg,
    marginBottom: designTokens.spacing.sm
  },
  emptySubtext: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.textLight
  },
  card: {
    backgroundColor: designTokens.colors.surfaceElevated,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    boxShadow: designTokens.shadows.md,
    border: `1px solid ${designTokens.colors.border}`,
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box'
  },
  cardHeader: {
    marginBottom: designTokens.spacing.lg
  },
  date: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.text
  },
  dayColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: designTokens.spacing.md,
    width: '100%'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'auto',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box'
  },
  recordCard: {
    backgroundColor: designTokens.colors.surface,
    borderRadius: designTokens.borderRadius.md,
    padding: designTokens.spacing.md,
    border: `1px solid ${designTokens.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box'
  },
  recordCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md
  },
  timeLabel: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.textSecondary
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: designTokens.colors.textLight,
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0,
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: designTokens.borderRadius.sm,
    transition: 'all 0.2s ease'
  },
  deleteButtonHover: {
    backgroundColor: designTokens.colors.danger + '20',
    color: designTokens.colors.danger
  },
  recordPressure: {
    display: 'flex',
    flexDirection: 'column',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.md
  },
  pressureValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: designTokens.spacing.xs
  },
  pressureNumber: {
    fontSize: designTokens.typography.fontSize['2xl'],
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.text
  },
  pressureSlash: {
    fontSize: designTokens.typography.fontSize.lg,
    color: designTokens.colors.textSecondary,
    margin: `0 ${designTokens.spacing.xs}`
  },
  pressureUnit: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.textSecondary,
    marginLeft: designTokens.spacing.xs
  },
  status: {
    fontSize: designTokens.typography.fontSize.xs,
    fontWeight: designTokens.typography.fontWeight.medium,
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.sm}`,
    borderRadius: designTokens.borderRadius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    display: 'inline-block',
    width: 'fit-content'
  },
  recordAdditional: {
    paddingTop: designTokens.spacing.md,
    borderTop: `1px solid ${designTokens.colors.border}`,
    overflow: 'hidden'
  },
  pulse: {
    display: 'flex',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
    fontSize: designTokens.typography.fontSize.xs
  },
  pulseLabel: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.textSecondary
  },
  pulseValue: {
    fontSize: designTokens.typography.fontSize.xs,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.text
  },
  notes: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 1.5
  },
  emptyColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: designTokens.colors.surface,
    borderRadius: designTokens.borderRadius.md,
    border: `2px dashed ${designTokens.colors.border}`,
    padding: designTokens.spacing.lg,
    textAlign: 'center',
    flex: 1
  },
  emptyColumnText: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.textSecondary,
    marginBottom: designTokens.spacing.xs
  },
  emptyColumnSubtext: {
    fontSize: designTokens.typography.fontSize.xs,
    color: designTokens.colors.textLight
  }
};


