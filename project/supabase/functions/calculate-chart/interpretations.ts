interface SignInterpretation {
  essence: string;
  strengths: string;
  challenges: string;
  purpose: string;
}

interface HouseInterpretation {
  theme: string;
  description: string;
}

interface AspectInterpretation {
  description: string;
  influence: string;
}

export const signInterpretations: Record<string, SignInterpretation> = {
  'Áries': {
    essence: 'Pioneiro natural, você carrega a energia da iniciativa e da coragem. Sua essência é de um guerreiro que não teme desafios.',
    strengths: 'Liderança, independência, entusiasmo e capacidade de iniciar projetos com paixão.',
    challenges: 'Impaciência, impulsividade e dificuldade em considerar perspectivas alheias.',
    purpose: 'Abrir caminhos, inspirar outros através da ação e desenvolver coragem autêntica.'
  },
  'Touro': {
    essence: 'Construtor de segurança e beleza, você busca estabilidade através da conexão com o mundo material.',
    strengths: 'Persistência, senso prático, apreciação da beleza e capacidade de criar valor duradouro.',
    challenges: 'Teimosia, resistência a mudanças e apego excessivo ao conforto.',
    purpose: 'Cultivar recursos, criar beleza tangível e ensinar o valor da paciência.'
  },
  'Gêmeos': {
    essence: 'Comunicador nato, você conecta ideias e pessoas através da palavra e do pensamento ágil.',
    strengths: 'Versatilidade, curiosidade intelectual, habilidade comunicativa e adaptabilidade.',
    challenges: 'Dispersão, superficialidade e dificuldade em comprometer-se com uma única direção.',
    purpose: 'Transmitir conhecimento, conectar diferentes perspectivas e estimular o pensamento.'
  },
  'Câncer': {
    essence: 'Guardião das emoções, você nutre e protege aqueles que ama com profunda sensibilidade.',
    strengths: 'Empatia, intuição, capacidade de nutrir e forte conexão com as raízes emocionais.',
    challenges: 'Vulnerabilidade excessiva, tendência a se fechar e apego ao passado.',
    purpose: 'Criar segurança emocional, preservar memórias e ensinar o valor do cuidado.'
  },
  'Leão': {
    essence: 'Expressão criativa e generosa, você ilumina o mundo com seu brilho e autenticidade.',
    strengths: 'Generosidade, criatividade, liderança carismática e coragem de ser autêntico.',
    challenges: 'Orgulho, necessidade de reconhecimento e dificuldade em aceitar críticas.',
    purpose: 'Inspirar através do exemplo, expressar criatividade e celebrar a vida.'
  },
  'Virgem': {
    essence: 'Refinador da realidade, você busca perfeição através do serviço e da análise detalhada.',
    strengths: 'Precisão, senso prático, habilidade analítica e dedicação ao aperfeiçoamento.',
    challenges: 'Perfeccionismo, autocrítica excessiva e dificuldade em aceitar imperfeições.',
    purpose: 'Melhorar sistemas, servir com eficiência e cultivar discernimento.'
  },
  'Libra': {
    essence: 'Diplomata natural, você busca harmonia e equilíbrio em todas as relações.',
    strengths: 'Senso de justiça, habilidade diplomática, apreciação estética e capacidade de mediar.',
    challenges: 'Indecisão, evitar conflitos necessários e dependência da aprovação alheia.',
    purpose: 'Criar harmonia, promover justiça e cultivar relacionamentos equilibrados.'
  },
  'Escorpião': {
    essence: 'Transformador profundo, você mergulha nas profundezas da experiência humana.',
    strengths: 'Intensidade, capacidade de transformação, intuição poderosa e coragem emocional.',
    challenges: 'Tendência ao controle, dificuldade em confiar e intensidade que pode assustar.',
    purpose: 'Facilitar transformações, revelar verdades ocultas e ensinar regeneração.'
  },
  'Sagitário': {
    essence: 'Explorador filosófico, você expande horizontes através da busca por significado.',
    strengths: 'Otimismo, visão expansiva, busca por verdade e capacidade de inspirar.',
    challenges: 'Excesso de confiança, falta de tato e dificuldade com detalhes práticos.',
    purpose: 'Expandir consciência, buscar sabedoria e inspirar através de ideais.'
  },
  'Capricórnio': {
    essence: 'Construtor de estruturas, você alcança objetivos através de disciplina e determinação.',
    strengths: 'Ambição saudável, responsabilidade, disciplina e capacidade de construir legados.',
    challenges: 'Rigidez, pessimismo e dificuldade em expressar vulnerabilidade.',
    purpose: 'Criar estruturas duradouras, liderar com responsabilidade e alcançar maestria.'
  },
  'Aquário': {
    essence: 'Inovador humanitário, você traz visões do futuro para beneficiar a coletividade.',
    strengths: 'Originalidade, consciência coletiva, pensamento independente e visão progressista.',
    challenges: 'Distanciamento emocional, rebeldia excessiva e dificuldade com intimidade.',
    purpose: 'Inovar sistemas, promover igualdade e libertar através do conhecimento.'
  },
  'Peixes': {
    essence: 'Místico compassivo, você dissolve fronteiras através da empatia e imaginação.',
    strengths: 'Compaixão profunda, intuição aguçada, criatividade e capacidade de transcendência.',
    challenges: 'Escapismo, limites frágeis e tendência a se perder em ilusões.',
    purpose: 'Dissolver separações, oferecer compaixão e conectar com o divino.'
  }
};

export const houseInterpretations: HouseInterpretation[] = [
  {
    theme: 'Identidade e Aparência',
    description: 'A Casa 1 representa como você se apresenta ao mundo, sua personalidade externa e aparência física. O signo no Ascendente (cúspide da Casa 1) é sua "máscara social".'
  },
  {
    theme: 'Recursos e Valores',
    description: 'A Casa 2 governa seus recursos materiais, valores pessoais e senso de autovalorização. Mostra como você gera e gerencia recursos.'
  },
  {
    theme: 'Comunicação e Mente',
    description: 'A Casa 3 rege comunicação, aprendizado, irmãos e ambiente imediato. Indica seu estilo de pensamento e expressão.'
  },
  {
    theme: 'Lar e Raízes',
    description: 'A Casa 4 representa família de origem, lar, raízes emocionais e segurança interna. É sua base psicológica.'
  },
  {
    theme: 'Criatividade e Romance',
    description: 'A Casa 5 governa expressão criativa, romances, prazer e filhos. Mostra como você brinca e se expressa autenticamente.'
  },
  {
    theme: 'Rotina e Saúde',
    description: 'A Casa 6 rege trabalho diário, saúde, hábitos e serviço. Indica como você cuida de si e serve aos outros.'
  },
  {
    theme: 'Parcerias e Relacionamentos',
    description: 'A Casa 7 representa relacionamentos comprometidos, parcerias e como você lida com o outro. É o espelho da Casa 1.'
  },
  {
    theme: 'Transformação e Intimidade',
    description: 'A Casa 8 governa transformação profunda, intimidade, recursos compartilhados e questões de poder.'
  },
  {
    theme: 'Expansão e Filosofia',
    description: 'A Casa 9 rege expansão mental, viagens longas, filosofia, educação superior e busca por significado.'
  },
  {
    theme: 'Carreira e Vocação',
    description: 'A Casa 10 representa carreira, vocação pública, ambições e contribuição para a sociedade. É seu legado.'
  },
  {
    theme: 'Amizades e Ideais',
    description: 'A Casa 11 governa amizades, grupos, causas coletivas e esperanças. Mostra sua participação na comunidade.'
  },
  {
    theme: 'Espiritualidade e Inconsciente',
    description: 'A Casa 12 rege o inconsciente, espiritualidade, isolamento e transcendência. É o reino dos sonhos e do invisível.'
  }
];

export const aspectInterpretations: Record<string, AspectInterpretation> = {
  'Conjunção': {
    description: 'União intensa de energias que se fundem.',
    influence: 'As qualidades dos planetas trabalham juntas, intensificando-se mutuamente. Pode ser harmônica ou desafiadora dependendo dos planetas envolvidos.'
  },
  'Oposição': {
    description: 'Tensão criativa entre polaridades opostas.',
    influence: 'Força você a encontrar equilíbrio entre duas áreas da vida. Pode gerar consciência através do conflito, mas também integração.'
  },
  'Trígono': {
    description: 'Fluxo natural e harmônico de energia.',
    influence: 'Facilita a expressão natural de talentos. As energias fluem facilmente, trazendo sorte e oportunidades.'
  },
  'Quadratura': {
    description: 'Tensão dinâmica que impulsiona ação.',
    influence: 'Cria fricção interna que motiva crescimento. Embora desafiadora, é fonte de desenvolvimento e conquistas.'
  },
  'Sextil': {
    description: 'Oportunidade harmônica que requer ação.',
    influence: 'Oferece oportunidades que precisam ser aproveitadas ativamente. Facilita cooperação entre áreas diferentes da vida.'
  }
};

export function getPlanetInHouseInterpretation(planet: string, house: number): string {
  const interpretations: Record<string, Record<number, string>> = {
    'Sol': {
      1: 'Identidade forte e presença marcante. Você brilha através da autenticidade.',
      2: 'Autoestima ligada aos recursos. Busca construir valor próprio.',
      3: 'Comunicação é central. Você brilha através das palavras.',
      4: 'Lar e família são fundamentais para seu senso de identidade.',
      5: 'Expressão criativa é vital. Romance e criatividade iluminam sua vida.',
      6: 'Trabalho e serviço são fonte de vitalidade.',
      7: 'Relacionamentos definem você. Você brilha através das parcerias.',
      8: 'Transformação profunda. Poder pessoal vem da regeneração.',
      9: 'Busca por significado. Você brilha através da sabedoria.',
      10: 'Carreira é central. Vocação pública define sua identidade.',
      11: 'Amizades e ideais coletivos. Você brilha em grupos.',
      12: 'Espiritualidade profunda. Iluminação vem do interior.'
    },
    'Lua': {
      1: 'Emoções à flor da pele. Sensibilidade é sua marca.',
      2: 'Segurança emocional vem de recursos materiais.',
      3: 'Necessidade de comunicar sentimentos constantemente.',
      4: 'Forte ligação com lar e família. Raízes emocionais profundas.',
      5: 'Emoções expressas criativamente. Nutrição através da alegria.',
      6: 'Cuidado expresso no dia a dia. Rotina emocional.',
      7: 'Necessidade emocional de parceria. Nutre através de relacionamentos.',
      8: 'Emoções intensas e transformadoras. Profundidade emocional.',
      9: 'Segurança vem da expansão. Emoções filosóficas.',
      10: 'Carreira nutre emocionalmente. Imagem pública sensível.',
      11: 'Amizades são família escolhida. Nutrição coletiva.',
      12: 'Emoções profundas e inconscientes. Sensibilidade espiritual.'
    },
    'Mercúrio': {
      1: 'Comunicação define identidade. Mente rápida e expressiva.',
      2: 'Pensa sobre recursos. Comunica valores.',
      3: 'Comunicação natural e constante. Mente versátil.',
      4: 'Pensa sobre família. Comunicação no lar.',
      5: 'Expressão criativa através da palavra. Jogo mental.',
      6: 'Trabalho intelectual. Análise do cotidiano.',
      7: 'Comunicação em relacionamentos. Diálogo é essencial.',
      8: 'Mente investigativa. Comunica transformação.',
      9: 'Busca intelectual por significado. Filosofia comunicada.',
      10: 'Carreira comunicativa. Reputação intelectual.',
      11: 'Ideias compartilhadas em grupo. Mente coletiva.',
      12: 'Pensamentos profundos. Comunicação com o invisível.'
    }
  };

  return interpretations[planet]?.[house] || `${planet} na Casa ${house} traz energia única para esta área da vida.`;
}
