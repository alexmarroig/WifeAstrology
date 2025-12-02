import { Check } from 'lucide-react';

interface ProductCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
}

export default function ProductCard({ name, price, description, features, isPopular, onSelect }: ProductCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
      isPopular ? 'ring-4 ring-amber-500' : ''
    }`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 text-sm font-bold rounded-bl-2xl">
          MAIS POPULAR
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900">R$ {price}</span>
        </div>
        <p className="text-gray-600 mb-6">{description}</p>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onSelect}
          className={`w-full py-4 rounded-xl font-semibold transition-all ${
            isPopular
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Solicitar Agora
        </button>
      </div>
    </div>
  );
}
