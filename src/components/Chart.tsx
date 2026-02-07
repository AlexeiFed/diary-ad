import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BloodPressureRecord, exportRecordsAsHTML } from '../lib/db';
import { format, parseISO } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { designTokens } from '../lib/design-tokens';
import { useState, useRef, useEffect } from 'react';

interface ChartProps {
  records: BloodPressureRecord[];
}

interface ChartData {
  date: string;
  morningSystolic: number | null;
  morningDiastolic: number | null;
  eveningSystolic: number | null;
  eveningDiastolic: number | null;
}

export const Chart = ({ records }: ChartProps) => {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ distance: number; centerX: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        touchStartRef.current = { distance, centerX };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartRef.current) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const centerX = (touch1.clientX + touch2.clientX) / 2;

        const scaleChange = distance / touchStartRef.current.distance;
        const newScale = Math.max(1, Math.min(5, scale * scaleChange));

        const deltaX = centerX - touchStartRef.current.centerX;
        const newTranslateX = translateX + deltaX;

        setScale(newScale);
        setTranslateX(newTranslateX);

        touchStartRef.current = { distance, centerX };
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale, translateX]);

  const handleExport = () => {
    const htmlContent = exportRecordsAsHTML(records);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `дневник-ад-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (records.length === 0) {
    return null;
  }

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return format(date, 'yyyy-MM-dd');
  });

  const chartData: ChartData[] = last30Days.map((date) => {
    const dayRecords = records.filter((r) => r.date === date);
    const morning = dayRecords.find((r) => r.time === 'morning');
    const evening = dayRecords.find((r) => r.time === 'evening');

    return {
      date: format(parseISO(date), 'd MMM', { locale: ru }),
      morningSystolic: morning?.systolic ?? null,
      morningDiastolic: morning?.diastolic ?? null,
      eveningSystolic: evening?.systolic ?? null,
      eveningDiastolic: evening?.diastolic ?? null
    };
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>График за последние 30 дней</h3>
        <button onClick={handleExport} style={styles.exportButton}>
          💾 Экспорт
        </button>
      </div>
      <div 
        ref={containerRef}
        style={{
          ...styles.chartWrapper,
          touchAction: 'none'
        }}
      >
        <div
          style={{
            transform: `scale(${scale}) translateX(${translateX / scale}px)`,
            transformOrigin: 'center center',
            transition: touchStartRef.current ? 'none' : 'transform 0.1s ease-out',
            width: '100%',
            height: '100%'
          }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={designTokens.colors.border} />
              <XAxis
                dataKey="date"
                stroke={designTokens.colors.textSecondary}
                fontSize={12}
                tick={{ fill: designTokens.colors.textSecondary }}
              />
              <YAxis
                stroke={designTokens.colors.textSecondary}
                fontSize={12}
                tick={{ fill: designTokens.colors.textSecondary }}
                domain={[50, 180]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: designTokens.colors.surfaceElevated,
                  border: `1px solid ${designTokens.colors.border}`,
                  borderRadius: designTokens.borderRadius.md
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="morningSystolic"
                stroke={designTokens.colors.primary}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Утро (верхнее)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="morningDiastolic"
                stroke={designTokens.colors.primaryDark}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Утро (нижнее)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="eveningSystolic"
                stroke={designTokens.colors.warning}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Вечер (верхнее)"
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="eveningDiastolic"
                stroke={designTokens.colors.danger}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Вечер (нижнее)"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {scale > 1 && (
        <button 
          onClick={() => { setScale(1); setTranslateX(0); }} 
          style={styles.resetButton}
        >
          🔄 Сбросить масштаб
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: designTokens.colors.surfaceElevated,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.lg,
    margin: designTokens.spacing.md,
    boxShadow: designTokens.shadows.md,
    border: `1px solid ${designTokens.colors.border}`
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md
  },
  title: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.text,
    margin: 0
  },
  exportButton: {
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.primary,
    color: '#ffffff',
    border: 'none',
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: designTokens.shadows.sm
  },
  chartWrapper: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: '300px'
  },
  resetButton: {
    marginTop: designTokens.spacing.md,
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.surfaceElevated,
    color: designTokens.colors.text,
    border: `1px solid ${designTokens.colors.border}`,
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%'
  }
};

