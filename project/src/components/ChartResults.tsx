import { Download, Star, Moon, Sun } from 'lucide-react';
import ChartWheel from './ChartWheel';

interface ChartResultsProps {
  chartData: any;
  interpretation: string;
  birthData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
  };
  onDownloadPDF: () => void;
  isGeneratingPDF?: boolean;
}

export default function ChartResults({
  chartData,
  interpretation,
  birthData,
  onDownloadPDF,
  isGeneratingPDF = false,
}: ChartResultsProps) {
  const { planets, houses, aspects } = chartData;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 shadow-2xl border border-amber-900/30">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-100 mb-2">
            Mapa Astral de {birthData.name}
          </h2>
          <p className="text-amber-200/70">
            {birthData.birthDate.split('-').reverse().join('/')} às {birthData.birthTime}
          </p>
          <p className="text-amber-200/70">{birthData.birthLocation}</p>
        </div>

        <ChartWheel planets={planets} houses={houses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 rounded-lg p-6 border border-amber-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-semibold text-amber-100">Planetas</h3>
          </div>
          <div className="space-y-2">
            {planets.slice(0, 10).map((planet: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-amber-200">{planet.name}</span>
                <span className="text-amber-400/70">{planet.sign}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6 border border-amber-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-semibold text-amber-100">Casas</h3>
          </div>
          <div className="space-y-2">
            {houses.slice(0, 12).map((house: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-amber-200">Casa {house.number}</span>
                <span className="text-amber-400/70">{house.sign ? house.sign.split(' ')[0] : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6 border border-amber-900/20">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-semibold text-amber-100">Aspectos</h3>
          </div>
          <div className="space-y-2">
            {aspects.slice(0, 10).map((aspect: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="text-amber-200">
                  {aspect.planet1} {aspect.aspect} {aspect.planet2}
                </div>
                <div className="text-amber-400/50 text-xs">Orbe: {aspect.orb}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 shadow-2xl border border-amber-900/30">
        <h3 className="text-2xl font-bold text-amber-100 mb-6 text-center">
          Interpretação Astrológica
        </h3>
        <div className="prose prose-invert prose-amber max-w-none">
          <div className="text-amber-100/90 whitespace-pre-wrap leading-relaxed">
            {interpretation}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar Relatório em PDF'}
        </button>
      </div>
    </div>
  );
}
