import { useState } from 'react';
import { format } from 'date-fns';
import { designTokens } from '../lib/design-tokens';
import { addRecord } from '../lib/db';

interface BloodPressureFormProps {
  onSuccess: () => void;
}

export const BloodPressureForm = ({ onSuccess }: BloodPressureFormProps) => {
  const [time, setTime] = useState<'morning' | 'evening'>(
    new Date().getHours() < 12 ? 'morning' : 'evening'
  );
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!systolic || !diastolic) {
      return;
    }

    setIsSubmitting(true);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await addRecord({
        date: today,
        time,
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: pulse ? parseInt(pulse) : undefined,
        notes: notes || undefined
      });

      setSystolic('');
      setDiastolic('');
      setPulse('');
      setNotes('');
      onSuccess();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.timeSelector}>
        <button
          type="button"
          onClick={() => setTime('morning')}
          style={{
            ...styles.timeButton,
            ...(time === 'morning' ? styles.timeButtonActive : {})
          }}
        >
          🌅 Утро
        </button>
        <button
          type="button"
          onClick={() => setTime('evening')}
          style={{
            ...styles.timeButton,
            ...(time === 'evening' ? styles.timeButtonActive : {})
          }}
        >
          🌆 Вечер
        </button>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Систолическое (верхнее)</label>
        <input
          type="number"
          value={systolic}
          onChange={(e) => setSystolic(e.target.value)}
          placeholder="120"
          min="50"
          max="250"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Диастолическое (нижнее)</label>
        <input
          type="number"
          value={diastolic}
          onChange={(e) => setDiastolic(e.target.value)}
          placeholder="80"
          min="30"
          max="150"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Пульс (опционально)</label>
        <input
          type="number"
          value={pulse}
          onChange={(e) => setPulse(e.target.value)}
          placeholder="70"
          min="30"
          max="200"
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Заметки (опционально)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Самочувствие, лекарства и т.д."
          rows={3}
          style={styles.textarea}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !systolic || !diastolic}
        style={{
          ...styles.submitButton,
          ...(isSubmitting || !systolic || !diastolic ? styles.submitButtonDisabled : {})
        }}
      >
        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: designTokens.spacing.lg,
    padding: designTokens.spacing.xl,
    backgroundColor: designTokens.colors.surfaceElevated,
    borderRadius: designTokens.borderRadius.lg,
    boxShadow: designTokens.shadows.elevated,
    margin: designTokens.spacing.md
  },
  timeSelector: {
    display: 'flex',
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.sm
  },
  timeButton: {
    flex: 1,
    padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.surface,
    color: designTokens.colors.text,
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    border: `1px solid ${designTokens.colors.border}`
  },
  timeButtonActive: {
    backgroundColor: designTokens.colors.primary,
    color: '#ffffff',
    borderColor: designTokens.colors.primary
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: designTokens.spacing.sm
  },
  label: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.textSecondary
  },
  input: {
    padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
    borderRadius: designTokens.borderRadius.md,
    border: `1px solid ${designTokens.colors.border}`,
    fontSize: designTokens.typography.fontSize.lg,
    backgroundColor: designTokens.colors.background,
    color: designTokens.colors.text,
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  textarea: {
    padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
    borderRadius: designTokens.borderRadius.md,
    border: `1px solid ${designTokens.colors.border}`,
    fontSize: designTokens.typography.fontSize.base,
    backgroundColor: designTokens.colors.background,
    color: designTokens.colors.text,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease'
  },
  submitButton: {
    padding: `${designTokens.spacing.lg} ${designTokens.spacing.xl}`,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.primary,
    color: '#ffffff',
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold,
    transition: 'background-color 0.2s ease',
    marginTop: designTokens.spacing.md
  },
  submitButtonDisabled: {
    backgroundColor: designTokens.colors.textLight,
    cursor: 'not-allowed',
    opacity: 0.6
  }
};

