import type { SleepSummary } from '../oura/oura.service';

type El = { type: string; props: Record<string, unknown> };
type ElType = string | ((props: Record<string, unknown>) => El);

export function h(
  type: ElType,
  props: Record<string, unknown> | null,
  ...children: unknown[]
): El {
  const merged = {
    ...(props ?? {}),
    children: children.flat().filter((c) => c !== null && c !== undefined),
  };
  if (typeof type === 'function') {
    return type(merged);
  }
  return { type, props: merged };
}

const BG = '#0B0F14';
const FG = '#E8EEF2';
const MUTED = '#6B7785';
const ACCENT = '#7BD88F';
const BAR_BG = '#1A2230';

const WIDTH = 1500;
const HEIGHT = 500;
const MAX_BAR = 220;
const AVATAR_GUTTER = 260;

export function buildBanner(summary: SleepSummary): El {
  const tier = scoreTier(summary.latest.score);
  const formattedDate = formatDate(summary.latest.day);
  const history = summary.history.slice(-7);

  return (
    <div
      style={{
        display: 'flex',
        width: WIDTH,
        height: HEIGHT,
        background: BG,
        color: FG,
        fontFamily: 'Inter',
        padding: '56px 80px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 56,
          left: 80,
        }}
      >
        <OuraLogo height={52} />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: AVATAR_GUTTER,
          flex: 1,
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: MUTED,
          }}
        >
          Last night's sleep
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 4 }}>
          <div style={{ display: 'flex', fontSize: 240, fontWeight: 700, lineHeight: 1 }}>
            {String(summary.latest.score)}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 44,
              color: ACCENT,
              marginLeft: 24,
            }}
          >
            {tier}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: MUTED, marginTop: 8 }}>
          {formattedDate}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          width: 520,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: MUTED,
            marginBottom: 16,
          }}
        >
          Last 7 days
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: MAX_BAR + 60,
          }}
        >
          {history.map((d) => renderBar(d))}
        </div>
      </div>
    </div>
  ) as unknown as El;
}

const OURA_PATH =
  'M141.632 61.8476H425.009V0H141.632V61.8476ZM1436.49 393.164H1238.28V187.616H1436.48C1507.1 187.616 1554.56 228.923 1554.56 290.393C1554.56 351.864 1507.1 393.164 1436.48 393.164M1502.14 441.241C1570.13 421.626 1614.06 362.414 1614.06 290.393C1614.06 196.91 1542.7 134.099 1436.48 134.099H1178.8V686.59H1238.28V447.516H1439.87L1568.24 686.585H1632.6L1498.78 442.207L1502.14 441.241ZM869.905 697C1015.79 697 1117.68 593.342 1117.68 444.917V134.101H1056.54V440.749C1056.54 555.212 979.792 635.157 869.905 635.157C778.827 635.157 680.799 574.321 680.799 440.749V134.101H619.67V444.919C619.67 593.342 722.569 696.998 869.91 696.998M1937.44 206.178L2066.38 491.463H1807.67L1937.44 206.178ZM1908.76 134.105L1659.05 686.592H1722.91L1784.66 544.973H2089.37L2151.15 686.592H2215L1965.3 134.099L1908.76 134.105ZM283.378 123.693C127.123 123.693 0 252.284 0 410.342C0 568.407 127.123 696.998 283.378 696.998C439.638 696.998 566.762 568.407 566.762 410.342C566.762 252.284 439.638 123.693 283.378 123.693M283.378 635.152C160.833 635.152 61.1328 534.301 61.1328 410.342C61.1328 286.385 160.835 185.538 283.38 185.538C405.927 185.538 505.631 286.385 505.631 410.342C505.631 534.301 405.927 635.152 283.38 635.152';

function OuraLogo({ height }: { height: number }): El {
  const width = Math.round((height / 697) * 2215);
  return (
    <svg width={width} height={height} viewBox="0 0 2215 697">
      <path d={OURA_PATH} fill={FG} />
    </svg>
  ) as unknown as El;
}

function renderBar(d: { day: string; score: number }): El {
  const fill = Math.max(10, Math.round((d.score / 100) * MAX_BAR));
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 56,
      }}
    >
      <div style={{ display: 'flex', fontSize: 18, color: FG, marginBottom: 6 }}>
        {String(d.score)}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: 32,
          height: MAX_BAR,
          background: BAR_BG,
          borderRadius: 5,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 32,
            height: fill,
            background: ACCENT,
            borderRadius: 5,
          }}
        />
      </div>
      <div style={{ display: 'flex', fontSize: 15, color: MUTED, marginTop: 8 }}>
        {shortDay(d.day)}
      </div>
    </div>
  ) as unknown as El;
}

function scoreTier(score: number): string {
  if (score >= 85) return 'Optimal';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Pay attention';
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function shortDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export const BANNER_DIMS = { width: WIDTH, height: HEIGHT };
