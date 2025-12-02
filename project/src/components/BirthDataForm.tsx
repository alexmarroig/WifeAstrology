import { useState } from 'react';
import { MapPin, Calendar, Clock, Globe } from 'lucide-react';

interface BirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  latitude: number;
  longitude: number;
  timezone: string;
  language: string;
}

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

const timezones = [
  { value: 'America/Sao_Paulo', label: 'Brasil - São Paulo (GMT-3)' },
  { value: 'America/Rio_Branco', label: 'Brasil - Acre (GMT-5)' },
  { value: 'America/Manaus', label: 'Brasil - Amazonas (GMT-4)' },
  { value: 'America/Noronha', label: 'Brasil - Fernando de Noronha (GMT-2)' },
  { value: 'America/New_York', label: 'EUA - Nova York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'EUA - Los Angeles (GMT-8)' },
  { value: 'Europe/London', label: 'Reino Unido - Londres (GMT+0)' },
  { value: 'Europe/Paris', label: 'França - Paris (GMT+1)' },
  { value: 'Europe/Lisbon', label: 'Portugal - Lisboa (GMT+0)' },
  { value: 'Asia/Tokyo', label: 'Japão - Tóquio (GMT+9)' },
];

const majorCities = [
  { name: 'São Paulo, Brasil', lat: -23.5505, lng: -46.6333, tz: 'America/Sao_Paulo' },
  { name: 'Rio de Janeiro, Brasil', lat: -22.9068, lng: -43.1729, tz: 'America/Sao_Paulo' },
  { name: 'Brasília, Brasil', lat: -15.7939, lng: -47.8828, tz: 'America/Sao_Paulo' },
  { name: 'Salvador, Brasil', lat: -12.9714, lng: -38.5014, tz: 'America/Sao_Paulo' },
  { name: 'Belo Horizonte, Brasil', lat: -19.9167, lng: -43.9345, tz: 'America/Sao_Paulo' },
  { name: 'Curitiba, Brasil', lat: -25.4284, lng: -49.2733, tz: 'America/Sao_Paulo' },
  { name: 'Porto Alegre, Brasil', lat: -30.0346, lng: -51.2177, tz: 'America/Sao_Paulo' },
  { name: 'Recife, Brasil', lat: -8.0476, lng: -34.8770, tz: 'America/Sao_Paulo' },
  { name: 'Nova York, EUA', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
  { name: 'Londres, Reino Unido', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  { name: 'Paris, França', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
  { name: 'Lisboa, Portugal', lat: 38.7223, lng: -9.1393, tz: 'Europe/Lisbon' },
];

export default function BirthDataForm({ onSubmit, isLoading = false }: BirthDataFormProps) {
  const [formData, setFormData] = useState<BirthData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    latitude: 0,
    longitude: 0,
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
  });

  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState(majorCities);

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, birthLocation: value });
    if (value.length > 0) {
      const filtered = majorCities.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowCitySuggestions(true);
    } else {
      setShowCitySuggestions(false);
    }
  };

  const selectCity = (city: typeof majorCities[0]) => {
    setFormData({
      ...formData,
      birthLocation: city.name,
      latitude: city.lat,
      longitude: city.lng,
      timezone: city.tz,
    });
    setShowCitySuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.latitude && !formData.longitude) {
      alert('Por favor, selecione uma cidade da lista ou insira coordenadas manualmente.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-amber-100 mb-2">
          Nome Completo
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800/50 border border-amber-900/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-slate-400"
          placeholder="Seu nome completo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-amber-100 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Data de Nascimento
          </label>
          <input
            type="date"
            required
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800/50 border border-amber-900/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-amber-100 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Hora de Nascimento
          </label>
          <input
            type="time"
            required
            value={formData.birthTime}
            onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800/50 border border-amber-900/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-amber-100 mb-2">
          <MapPin className="inline w-4 h-4 mr-1" />
          Local de Nascimento
        </label>
        <input
          type="text"
          required
          value={formData.birthLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
          onFocus={() => formData.birthLocation && setShowCitySuggestions(true)}
          className="w-full px-4 py-3 bg-slate-800/50 border border-amber-900/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-slate-400"
          placeholder="Digite a cidade..."
          autoComplete="off"
        />
        {showCitySuggestions && filteredCities.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-amber-900/30 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {filteredCities.map((city, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectCity(city)}
                className="w-full px-4 py-3 text-left hover:bg-amber-900/20 text-white border-b border-slate-700 last:border-b-0"
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-100 mb-2">
          <Globe className="inline w-4 h-4 mr-1" />
          Fuso Horário
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800/50 border border-amber-900/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-100 mb-2">
          Idioma do Relatório
        </label>
        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full px-4 py-3 bg-slate-800/50 border border-amber-900/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Calculando seu Mapa...' : 'Gerar Mapa Astral'}
      </button>
    </form>
  );
}
