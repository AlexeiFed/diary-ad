import { BloodPressureRecord } from '../lib/db';
import { format, parseISO } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { designTokens } from '../lib/design-tokens';

interface RecordsListProps {
  records: BloodPressureRecord[];
  onDelete: (id: string) => void;
}

export const RecordsList = ({ records, onDelete }: RecordsListProps) => {
  const getPressureStatus = (systolic: number, diastolic: number): { color: string; label: string } => {
    if (systolic >= 140 || diastolic >= 90) {
      return { color: designTokens.colors.danger, label: 'Повышенное' };
    }
    if (systolic < 90 || diastolic < 60) {
      return { color: designTokens.colors.warning, label: 'Пониженное' };
    }
    return { color: designTokens.colors.success, label: 'Нормальное' };
  };

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
      {records.map((record) => {
        const status = getPressureStatus(record.systolic, record.diastolic);
        const date = parseISO(record.date);
        
        return (
          <div key={record.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.date}>
                  {format(date, 'd MMMM yyyy', { locale: ru })}
                </div>
                <div style={styles.time}>
                  {record.time === 'morning' ? '🌅 Утро' : '🌆 Вечер'}
                </div>
              </div>
              <button
                onClick={() => onDelete(record.id)}
                style={styles.deleteButton}
                aria-label="Удалить запись"
              >
                ×
              </button>
            </div>
            
            <div style={styles.pressure}>
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
              <div style={styles.additional}>
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
    border: `1px solid ${designTokens.colors.border}`
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: designTokens.spacing.md
  },
  date: {
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.text,
    marginBottom: designTokens.spacing.xs
  },
  time: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.textSecondary
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    color: designTokens.colors.textLight,
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0,
    width: '32px',
    height: '32px',
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
  pressure: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm
  },
  pressureValue: {
    display: 'flex',
    alignItems: 'baseline',
    gap: designTokens.spacing.xs
  },
  pressureNumber: {
    fontSize: designTokens.typography.fontSize['3xl'],
    fontWeight: designTokens.typography.fontWeight.bold,
    color: designTokens.colors.text
  },
  pressureSlash: {
    fontSize: designTokens.typography.fontSize['2xl'],
    color: designTokens.colors.textSecondary,
    margin: `0 ${designTokens.spacing.xs}`
  },
  pressureUnit: {
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.textSecondary,
    marginLeft: designTokens.spacing.xs
  },
  status: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
    borderRadius: designTokens.borderRadius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  additional: {
    marginTop: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
    borderTop: `1px solid ${designTokens.colors.border}`
  },
  pulse: {
    display: 'flex',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm
  },
  pulseLabel: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.textSecondary
  },
  pulseValue: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.text
  },
  notes: {
    fontSize: designTokens.typography.fontSize.sm,
    color: designTokens.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 1.5
  }
};

