import { Star } from 'lucide-react';

interface TestimonialProps {
  name: string;
  text: string;
  rating: number;
}

export default function Testimonial({ name, text, rating }: TestimonialProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">"{text}"</p>
      <p className="text-gray-900 font-semibold">{name}</p>
    </div>
  );
}
