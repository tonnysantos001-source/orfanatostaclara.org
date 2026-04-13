"use client";

interface ScoreMeterProps {
  score: number;
  maxScore?: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 750) return "#10B981"; // emerald
  if (score >= 600) return "#3B82F6"; // blue
  if (score >= 400) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

function getScoreGradientId(score: number): string {
  if (score >= 750) return "grad-approved";
  if (score >= 600) return "grad-limit";
  if (score >= 400) return "grad-manual";
  return "grad-rejected";
}

export function ScoreMeter({
  score,
  maxScore = 1000,
  size = 200,
}: ScoreMeterProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  // Only fill 75% of the circle (270 degrees) for a gauge look
  const gaugeRatio = 0.75;
  const gaugeCfr = circumference * gaugeRatio;
  const fillRatio = Math.min(score / maxScore, 1);
  const strokeDash = fillRatio * gaugeCfr;
  const strokeGap = circumference - strokeDash;

  const color = getScoreColor(score);
  const gradId = getScoreGradientId(score);

  // Rotate so gauge starts at bottom-left and ends at bottom-right
  const rotation = 135;

  return (
    <div className="score-meter-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={12}
          strokeDasharray={`${gaugeCfr} ${circumference - gaugeCfr}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={12}
          strokeDasharray={`${strokeDash} ${strokeGap}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          className="score-fill"
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={size * 0.2}
          fontWeight="bold"
          fontFamily="inherit"
        >
          {score}
        </text>
        <text
          x={size / 2}
          y={size / 2 + size * 0.14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={size * 0.075}
          fontFamily="inherit"
        >
          de {maxScore}
        </text>
      </svg>
    </div>
  );
}
