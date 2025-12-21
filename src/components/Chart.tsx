import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BloodPressureRecord } from '../lib/db';
import { format, parseISO } from 'date-fns';
import ru from 'date-fns/locale/ru';
import { designTokens } from '../lib/design-tokens';

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
      <h3 style={styles.title}>График за последние 30 дней</h3>
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
  title: {
    fontSize: designTokens.typography.fontSize.lg,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.text,
    marginBottom: designTokens.spacing.md
  }
};

