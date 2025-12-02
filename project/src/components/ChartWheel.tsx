interface Planet {
  name: string;
  longitude: number;
  sign: string;
}

interface House {
  number: number;
  longitude: number;
  sign: string;
}

interface ChartWheelProps {
  planets: Planet[];
  houses: House[];
}

export default function ChartWheel({ planets, houses }: ChartWheelProps) {
  const size = 600;
  const center = size / 2;
  const outerRadius = 280;
  const innerRadius = 100;
  const houseRadius = 220;
  const planetRadius = 190;

  const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  const planetSymbols: Record<string, string> = {
    'Sol': '☉',
    'Lua': '☽',
    'Mercúrio': '☿',
    'Vênus': '♀',
    'Marte': '♂',
    'Júpiter': '♃',
    'Saturno': '♄',
    'Urano': '♅',
    'Netuno': '♆',
    'Plutão': '♇',
  };

  const polarToCartesian = (angle: number, radius: number) => {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    };
  };

  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(endAngle, radius);
    const end = polarToCartesian(startAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <svg width={size} height={size} className="mx-auto drop-shadow-2xl">
      <defs>
        <radialGradient id="chartGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <circle cx={center} cy={center} r={outerRadius} fill="url(#chartGradient)" stroke="#d97706" strokeWidth="3" strokeOpacity="0.5" />

      {zodiacSigns.map((sign, index) => {
        const startAngle = index * 30;
        const endAngle = (index + 1) * 30;
        const midAngle = startAngle + 15;
        const pos = polarToCartesian(midAngle, outerRadius - 20);
        const isEvenSign = index % 2 === 0;

        return (
          <g key={index}>
            <path
              d={`${describeArc(startAngle, endAngle, outerRadius)} L ${polarToCartesian(startAngle, innerRadius).x} ${polarToCartesian(startAngle, innerRadius).y} A ${innerRadius} ${innerRadius} 0 0 1 ${polarToCartesian(endAngle, innerRadius).x} ${polarToCartesian(endAngle, innerRadius).y} Z`}
              fill={isEvenSign ? 'rgba(217, 119, 6, 0.1)' : 'rgba(180, 83, 9, 0.05)'}
              stroke="#78716c"
              strokeWidth="1"
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#d97706"
              fontSize="24"
              fontWeight="bold"
            >
              {sign}
            </text>
          </g>
        );
      })}

      {houses.map((house, index) => {
        const angle = house.longitude;
        const start = polarToCartesian(angle, innerRadius);
        const end = polarToCartesian(angle, houseRadius);
        const labelPos = polarToCartesian(angle + 15, innerRadius + 30);

        return (
          <g key={index}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#a8a29e"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fbbf24"
              fontSize="14"
              fontWeight="bold"
            >
              {house.number}
            </text>
          </g>
        );
      })}

      {planets.map((planet, index) => {
        const angle = planet.longitude;
        const pos = polarToCartesian(angle, planetRadius);
        const symbol = planetSymbols[planet.name] || planet.name[0];

        return (
          <g key={index} filter="url(#glow)">
            <circle
              cx={pos.x}
              cy={pos.y}
              r="18"
              fill="#0f172a"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r="16"
              fill="url(#centerGlow)"
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fbbf24"
              fontSize="20"
              fontWeight="bold"
            >
              {symbol}
            </text>
          </g>
        );
      })}

      <circle cx={center} cy={center} r={innerRadius} fill="url(#centerGlow)" stroke="#d97706" strokeWidth="3" strokeOpacity="0.7" />

      <text
        x={center}
        y={center - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fbbf24"
        fontSize="24"
        fontWeight="bold"
        filter="url(#glow)"
      >
        ★
      </text>
      <text
        x={center}
        y={center + 15}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#d97706"
        fontSize="16"
        fontWeight="bold"
        letterSpacing="2"
      >
        NATAL
      </text>
      <text
        x={center}
        y={center + 32}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#d97706"
        fontSize="12"
        opacity="0.6"
      >
        CHART
      </text>
    </svg>
  );
}
