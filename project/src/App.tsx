import { useState, useEffect } from 'react';
import { Sparkles, User, LogOut, History, Moon, Stars, Check, Heart, Award, Zap } from 'lucide-react';
import BirthDataForm from './components/BirthDataForm';
import ChartResults from './components/ChartResults';
import AuthModal from './components/AuthModal';
import CosmicBackground from './components/CosmicBackground';
import ProductCard from './components/ProductCard';
import Testimonial from './components/Testimonial';
import { supabase } from './lib/supabase';

interface ChartData {
  chartData: any;
  interpretation: string;
  birthData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

function App() {
  const [currentChart, setCurrentChart] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserCharts(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserCharts(session.user.id);
        } else {
          setSavedCharts([]);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserCharts = async (userId: string) => {
    const { data, error } = await supabase
      .from('birth_charts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedCharts(data);
    }
  };

  const handleAuth = async (email: string, password: string, name?: string, isSignUp?: boolean) => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (name) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('users').insert({
            id: user.id,
            email: user.email!,
            name,
          });
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentChart(null);
    setShowHistory(false);
  };

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/calculate-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          latitude: formData.latitude,
          longitude: formData.longitude,
          timezone: formData.timezone,
          language: formData.language,
        }),
      });

      const result = await response.json();

      if (result.success && result.chartData) {
        const chartData: ChartData = {
          chartData: result.chartData,
          interpretation: result.interpretation || '',
          birthData: {
            name: formData.name,
            birthDate: formData.birthDate,
            birthTime: formData.birthTime,
            birthLocation: formData.birthLocation,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
          },
        };

        setCurrentChart(chartData);

        if (user) {
          await supabase.from('birth_charts').insert({
            user_id: user.id,
            subject_name: formData.name,
            birth_date: formData.birthDate,
            birth_time: formData.birthTime,
            birth_location: formData.birthLocation,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
            language: formData.language,
            chart_data: result.chartData,
            interpretation: result.interpretation,
          });
          await loadUserCharts(user.id);
        }
      } else {
        alert('Erro ao calcular mapa: ' + (result.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao calcular mapa astral. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentChart) return;

    setIsGeneratingPDF(true);
    try {
      const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = await import('docx');
      const { saveAs } = await import('file-saver');

      const formattedDate = currentChart.birthData.birthDate.split('-').reverse().join('/');

      const cleanText = currentChart.interpretation
        .replace(/[═━]/g, '===')
        .replace(/[☉☽☿♀♂♃♄♅♆♇]/g, '')
        .replace(/[🌟🏠✧🌠]/g, '')
        .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I')
        .replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Â/g, 'A')
        .replace(/Ê/g, 'E').replace(/Ô/g, 'O').replace(/Ã/g, 'A')
        .replace(/Õ/g, 'O').replace(/Ç/g, 'C')
        .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
        .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/â/g, 'a')
        .replace(/ê/g, 'e').replace(/ô/g, 'o').replace(/ã/g, 'a')
        .replace(/õ/g, 'o').replace(/ç/g, 'c');

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: 'MAPA NATAL',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: 'Analise Astrologica Profunda',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'DADOS DE NASCIMENTO',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Nome: ', bold: true }),
                new TextRun(currentChart.birthData.name),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Data: ', bold: true }),
                new TextRun(formattedDate),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Hora: ', bold: true }),
                new TextRun(currentChart.birthData.birthTime),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Local: ', bold: true }),
                new TextRun(currentChart.birthData.birthLocation),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'POSICOES PLANETARIAS',
              heading: HeadingLevel.HEADING_2,
            }),
            ...currentChart.chartData.planets.slice(0, 10).map((planet: any) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${planet.name}: `, bold: true }),
                  new TextRun(planet.sign),
                ],
              })
            ),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'INTERPRETACAO ASTROLOGICA',
              heading: HeadingLevel.HEADING_2,
            }),
            ...cleanText.split('\n').map((line: string) =>
              new Paragraph({ text: line })
            ),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Camila Veloso - Astrologa Profissional',
              alignment: AlignmentType.CENTER,
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `mapa-natal-${currentChart.birthData.name.replace(/\s+/g, '-')}.docx`);
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const loadChart = (chart: any) => {
    setCurrentChart({
      chartData: chart.chart_data,
      interpretation: chart.interpretation,
      birthData: {
        name: chart.subject_name,
        birthDate: chart.birth_date,
        birthTime: chart.birth_time,
        birthLocation: chart.birth_location,
        latitude: chart.latitude,
        longitude: chart.longitude,
        timezone: chart.timezone,
      },
    });
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      <CosmicBackground />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10">
        <header className="border-b border-amber-900/30 bg-slate-900/70 backdrop-blur-md shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3 floating">
              <img
                src="/Gemini_Generated_Image_3olkzv3olkzv3olk.png"
                alt="Camila Veloso Astróloga"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  Camila Veloso
                </h1>
                <p className="text-sm text-amber-300/70 flex items-center gap-1">
                  <Stars className="w-3 h-3" />
                  Astróloga Profissional
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-amber-100 hover:text-amber-400 transition-colors"
                  >
                    <History className="w-5 h-5" />
                    <span className="hidden sm:inline">Histórico</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-amber-100 hover:text-amber-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 bg-amber-700/30 hover:bg-amber-700/50 text-amber-100 px-4 py-2 rounded-lg transition-colors border border-amber-900/30"
                >
                  <User className="w-5 h-5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          {showHistory && user ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-amber-100">Mapas Salvos</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-amber-400 hover:text-amber-300"
                >
                  Voltar
                </button>
              </div>

              {savedCharts.length === 0 ? (
                <div className="text-center text-amber-200/60 py-12">
                  Nenhum mapa salvo ainda
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedCharts.map((chart) => (
                    <button
                      key={chart.id}
                      onClick={() => loadChart(chart)}
                      className="bg-slate-900/50 border border-amber-900/20 rounded-lg p-6 text-left hover:border-amber-700/50 transition-colors"
                    >
                      <h3 className="text-xl font-semibold text-amber-100 mb-2">
                        {chart.subject_name}
                      </h3>
                      <p className="text-amber-200/70 text-sm">
                        {new Date(chart.birth_date).toLocaleDateString('pt-BR')} às {chart.birth_time}
                      </p>
                      <p className="text-amber-200/60 text-sm">{chart.birth_location}</p>
                      <p className="text-amber-400/50 text-xs mt-2">
                        Criado em {new Date(chart.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : currentChart ? (
            <div>
              <button
                onClick={() => setCurrentChart(null)}
                className="mb-6 text-amber-400 hover:text-amber-300 flex items-center gap-2"
              >
                ← Calcular novo mapa
              </button>
              <ChartResults
                chartData={currentChart.chartData}
                interpretation={currentChart.interpretation}
                birthData={currentChart.birthData}
                onDownloadPDF={handleDownloadPDF}
                isGeneratingPDF={isGeneratingPDF}
              />
            </div>
          ) : (
            <div className="space-y-20">
              {/* Hero Section */}
              <div className="text-center space-y-8">
                <div className="inline-block">
                  <h2 className="text-6xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-4">
                    Descubra seu caminho através das estrelas
                  </h2>
                  <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                </div>
                <p className="text-amber-100/90 text-2xl max-w-3xl mx-auto leading-relaxed">
                  Análises astrológicas personalizadas com mais de <span className="text-amber-400 font-bold">6 anos de experiência</span>
                </p>
                <div className="flex items-center justify-center gap-12 text-amber-300/80">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span className="font-semibold">Formação GAIA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-amber-500" />
                    <span className="font-semibold">Análise Humanizada</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-500" />
                    <span className="font-semibold">Entrega Rápida</span>
                  </div>
                </div>
              </div>

              {/* About Camila */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-3xl p-12 shadow-2xl border border-amber-900/40 backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="relative flex justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-2xl blur-2xl"></div>
                    <div className="relative w-full max-w-md">
                      <img
                        src="/camila-veloso.png"
                        alt="Camila Veloso - Astróloga Profissional"
                        className="w-full h-auto object-contain rounded-2xl shadow-2xl border-2 border-amber-500/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-4xl font-bold text-amber-100">Camila Veloso</h3>
                    <p className="text-xl text-amber-400">Astróloga Profissional</p>
                    <div className="space-y-4 text-amber-100/80">
                      <p>Graduada pela renomada Escola GAIA de Astrologia, com Sol em Escorpião, Ascendente em Câncer e Lua em Touro.</p>
                      <p>Dedico-me ao autoconhecimento através da astrologia desde 2019, ajudando centenas de pessoas a compreenderem seu propósito e potencial único.</p>
                      <p className="text-amber-400 font-semibold">Diferente dos sites automatizados, cada análise é feita pessoalmente por mim, com interpretações exclusivas e personalizadas para você.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div id="servicos" className="space-y-12">
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-amber-100 mb-4">Serviços</h2>
                  <p className="text-xl text-amber-300/80">Escolha a análise perfeita para você</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <ProductCard
                    name="Mapa Natal Básico"
                    price="37"
                    description="PDF automatizado com entrega instantânea"
                    features={[
                      'Posições planetárias exatas',
                      'Aspectos principais',
                      'Casas astrológicas',
                      'PDF colorido',
                      'Entrega imediata'
                    ]}
                    onSelect={() => alert('Em breve!')}
                  />

                  <ProductCard
                    name="Mapa Natal Completo"
                    price="170"
                    description="Análise personalizada por Camila Veloso"
                    features={[
                      'Interpretação exclusiva',
                      'Análise humanizada e detalhada',
                      'Material completo em Word/PDF',
                      'Áudio opcional',
                      'Entrega em 3-5 dias úteis'
                    ]}
                    isPopular
                    onSelect={() => alert('Em breve!')}
                  />

                  <ProductCard
                    name="Revolução Solar"
                    price="270"
                    description="Previsões detalhadas para seu ano pessoal"
                    features={[
                      'Análise completa do ano',
                      'Previsões mensais personalizadas',
                      'Relocação incluída',
                      'Interpretação por Camila',
                      'Áudio opcional'
                    ]}
                    onSelect={() => alert('Em breve!')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <ProductCard
                    name="Sinastria de Casal"
                    price="300"
                    description="Análise de compatibilidade"
                    features={[
                      'Compatibilidade detalhada',
                      'Pontos fortes do relacionamento',
                      'Desafios e como superá-los',
                      'Dicas personalizadas'
                    ]}
                    onSelect={() => alert('Em breve!')}
                  />

                  <ProductCard
                    name="Pacote Anual VIP"
                    price="500"
                    description="Acompanhamento completo"
                    features={[
                      'Mapa Natal Completo',
                      'Revolução Solar',
                      '3 análises de trânsitos',
                      'Prioridade no atendimento',
                      'Suporte por WhatsApp'
                    ]}
                    onSelect={() => alert('Em breve!')}
                  />
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-5xl font-bold text-amber-100 mb-4">Depoimentos</h2>
                  <p className="text-xl text-amber-300/80">O que dizem sobre o trabalho da Camila</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <Testimonial
                    name="Ana Paula"
                    rating={5}
                    text="A análise da Camila foi transformadora! Ela conseguiu captar nuances do meu mapa que nenhum site automatizado conseguiria. Recomendo muito!"
                  />
                  <Testimonial
                    name="Ricardo Santos"
                    rating={5}
                    text="Fiz minha revolução solar com a Camila e foi incrível ver como tudo que ela previu se concretizou ao longo do ano. Profissional excepcional!"
                  />
                  <Testimonial
                    name="Juliana Costa"
                    rating={5}
                    text="A sinastria que a Camila fez do meu relacionamento nos ajudou muito a compreender nossa dinâmica. O áudio complementar foi um diferencial!"
                  />
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-3xl p-12 shadow-2xl border border-amber-900/40 backdrop-blur-sm">
                <h2 className="text-4xl font-bold text-amber-100 mb-8 text-center">Perguntas Frequentes</h2>
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div>
                    <h3 className="text-xl font-semibold text-amber-300 mb-2">Qual a diferença entre o Mapa Básico e o Completo?</h3>
                    <p className="text-amber-100/70">O Mapa Básico é gerado automaticamente e entregue na hora. Já o Mapa Completo é analisado pessoalmente por mim, com interpretações exclusivas e personalizadas para você, incluindo áudio opcional.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-300 mb-2">Quanto tempo leva para receber minha análise?</h3>
                    <p className="text-amber-100/70">O Mapa Básico é instantâneo. Análises personalizadas são entregues em 3-5 dias úteis. Você receberá atualizações por email sobre o andamento.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-300 mb-2">Preciso saber meu horário exato de nascimento?</h3>
                    <p className="text-amber-100/70">Sim, o horário exato é fundamental para calcular o Ascendente e as Casas astrológicas. Você pode solicitar sua certidão de nascimento completa no cartório para confirmar.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-amber-300 mb-2">O que é a Revolução Solar?</h3>
                    <p className="text-amber-100/70">É o mapa astrológico do momento exato em que o Sol retorna à posição que ocupava no seu nascimento. Revela os temas e energias do seu próximo ano pessoal.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-amber-900/30 bg-slate-900/70 backdrop-blur-md mt-20">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Moon className="w-5 h-5 text-amber-400" />
              <p className="text-amber-200/80 font-semibold">Camila Veloso - Astróloga Profissional</p>
              <Stars className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-amber-200/50 text-sm">Formação: Escola GAIA de Astrologia</p>
            <p className="text-amber-200/50 text-sm">Instagram: @astrologacamila | www.astrologacamila.com.br</p>
            <p className="text-amber-200/40 text-xs mt-2">© 2024 Camila Veloso • Todos os direitos reservados</p>
          </div>
        </footer>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
    </div>
  );
}

export default App;
