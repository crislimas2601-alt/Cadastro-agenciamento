import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { FullCadastroData, LISTA_CARACTERISTICAS } from './types/authorization';
import { maskCpf, maskPhone, maskCep, maskCurrency, cleanDigits } from './utils/masks';
import { fetchAddressByCep } from './utils/viaCep';
import { parseFreeTextToCadastro } from './utils/textParser';
import { TorresulPrintDocument } from './components/TorresulPrintDocument';
import { BackOfficeDashboard } from './components/BackOfficeDashboard';
import { DigitalSignaturePad } from './components/DigitalSignaturePad';
import {
  CheckCircle,
  Printer,
  ArrowLeft,
  RotateCcw,
  Send,
  Loader2,
  SlidersHorizontal,
  ClipboardPaste,
  Building,
  Home,
  User,
  Shield,
  FileCheck,
  Check,
  Sparkles,
  LayoutDashboard,
  FileSpreadsheet,
} from 'lucide-react';

const INITIAL_DATA: FullCadastroData = {
  codigoImovel: '',
  nomeCorretor: '',
  isPessoaJuridica: false,
  razaoSocial: '',
  cnpj: '',
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  profissao: '',
  estadoCivil: 'Casado(a)',
  email: '',
  telefone: '',
  telefoneSecundario: '',
  cepOndeMora: '',
  enderecoProprietario: '',
  numeroProprietario: '',
  bairroProprietario: '',
  cidadeProprietario: 'Blumenau',

  enderecoImovelMesmo: false,
  tipoImovel: 'Apartamento',
  metragemPrivativa: '',
  enderecoImovel: '',
  numeroImovel: '',
  bairroImovel: '',
  cidadeImovel: 'Blumenau',
  loteamentoCondominio: '',
  numeroIncorporacao: '',
  numeroMatricula: '',

  solOrientacao: 'Sol da manhã',
  numeroVaga: '',
  moveisFicam: '',
  opcoesLazerDescricao: '',

  imovelLocado: false,
  imovelAverbado: false,
  valorCondominio: '',
  exclusividade: true,
  aceitaFgts: true,
  terrenoEscriturado: true,
  aceitaFinanciamento: true,
  imovelQuitado: true,
  mobiliaStatus: 'Semi Mobiliado',
  condicaoImovel: 'Imóvel Usado',

  dormitoriosQtd: '2',
  suitesQtd: '1',
  caracteristicas: [
    'Dormitórios',
    'Suítes',
    'Banheiro social',
    'Sala e cozinha integradas',
    'Sacada com churrasqueira',
    'Churrasqueira',
    'Garagem Coberta',
    'Portão eletrônico',
    'Piso cerâmico',
    'Preparação para split',
  ],

  valorAnuncio: '',
  margemNegociacao: '',
  valorAvaliacaoBanco: '',
  condicaoPagamento: 'Aceita financiamento bancário',
  permutaImovel: false,
  permutaTerreno: false,
  permutaCarro: false,
  saldoDevedor: '',
  breveDescricao: '',
  observacoes: '',

  comissaoPercentual: 6,
  assinaturaDigitalUrl: '',
  assinadoEm: '',
  status: 'pendente',
};

const LAZER_CHIPS = ['Piscina', 'Salão de Festas', 'Academia', 'Churrasqueira', 'Playground', 'Quadra esportiva', 'Portaria 24h'];
const MOVEIS_CHIPS = ['Armários planejados na cozinha', 'Móveis sob medida nos quartos', 'Ar-condicionado instalado', 'Porteira fechada', 'Imóvel sem mobília'];
const VAGAS_CHIPS = ['1 vaga coberta', '2 vagas cobertas', '1 vaga descoberta', 'Vaga privativa', 'Vaga rotativa'];

export default function App() {
  const [data, setData] = useState<FullCadastroData>(INITIAL_DATA);
  const [currentView, setCurrentView] = useState<'form' | 'success' | 'print' | 'backoffice'>('form');
  const [activePrintData, setActivePrintData] = useState<FullCadastroData | null>(null);

  const [loadingCepProp, setLoadingCepProp] = useState(false);
  const [submittingToFirebase, setSubmittingToFirebase] = useState(false);
  const [showAutoImport, setShowAutoImport] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [showConfigLink, setShowConfigLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lê parâmetros da URL caso o corretor envie o link personalizado para o cliente
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCorretor = params.get('corretor');
      const urlBackoffice = params.get('backoffice');
      if (urlCorretor) {
        setData((prev) => ({
          ...prev,
          nomeCorretor: urlCorretor,
        }));
      }
      if (urlBackoffice === 'true') {
        setCurrentView('backoffice');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Busca automática do CEP do proprietário
  const handleCepPropBlur = async () => {
    const clean = cleanDigits(data.cepOndeMora);
    if (clean.length === 8) {
      setLoadingCepProp(true);
      const res = await fetchAddressByCep(clean);
      setLoadingCepProp(false);
      if (res) {
        setData((prev) => ({
          ...prev,
          enderecoProprietario: res.logradouro || prev.enderecoProprietario,
          bairroProprietario: res.bairro || prev.bairroProprietario,
          cidadeProprietario: res.localidade || prev.cidadeProprietario,
        }));
      }
    }
  };

  // Botão atalho: O imóvel a vender fica no mesmo endereço de onde moro
  const handleToggleSameAddress = (checked: boolean) => {
    setData((prev) => ({
      ...prev,
      enderecoImovelMesmo: checked,
      enderecoImovel: checked ? prev.enderecoProprietario : prev.enderecoImovel,
      numeroImovel: checked ? prev.numeroProprietario : prev.numeroImovel,
      bairroImovel: checked ? prev.bairroProprietario : prev.bairroImovel,
      cidadeImovel: checked ? prev.cidadeProprietario : prev.cidadeImovel,
    }));
  };

  // Toggle de características
  const toggleCaracteristica = (item: string) => {
    setData((prev) => {
      const exists = prev.caracteristicas.includes(item);
      return {
        ...prev,
        caracteristicas: exists
          ? prev.caracteristicas.filter((i) => i !== item)
          : [...prev.caracteristicas, item],
      };
    });
  };

  // Adicionar sugestões rápidas
  const appendChip = (field: 'opcoesLazerDescricao' | 'moveisFicam' | 'numeroVaga', text: string) => {
    setData((prev) => {
      const current = prev[field].trim();
      if (!current) return { ...prev, [field]: text };
      if (current.includes(text)) return prev;
      return { ...prev, [field]: `${current}, ${text}` };
    });
  };

  // Importar texto do WhatsApp
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;
    const parsed = parseFreeTextToCadastro(pastedText);
    setData((prev) => ({
      ...prev,
      nomeCorretor: parsed.nomeCorretor || prev.nomeCorretor,
      nomeCompleto: parsed.nomeCompleto || prev.nomeCompleto,
      cpf: parsed.cpf || prev.cpf,
      dataNascimento: parsed.dataNascimento || prev.dataNascimento,
      profissao: parsed.profissao || prev.profissao,
      estadoCivil: parsed.estadoCivil || prev.estadoCivil,
      enderecoProprietario: parsed.enderecoCompleto || prev.enderecoProprietario,
      cepOndeMora: parsed.cep || prev.cepOndeMora,
      solOrientacao: parsed.solOrientacao || prev.solOrientacao,
      email: parsed.email || prev.email,
      opcoesLazerDescricao: parsed.opcoesLazer || prev.opcoesLazerDescricao,
      telefone: parsed.telefone || prev.telefone,
      moveisFicam: parsed.moveisFicam || prev.moveisFicam,
      numeroVaga: parsed.numeroVaga || prev.numeroVaga,
    }));
    setShowAutoImport(false);
    setPastedText('');
  };

  // Link do Corretor para enviar ao proprietário
  const currentBaseUrl = window.location.origin + window.location.pathname;
  const shareLink = `${currentBaseUrl}?corretor=${encodeURIComponent(data.nomeCorretor || 'Torresul')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ENVIO DO FORMULÁRIO PARA O BANCO DE DADOS (FIREBASE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nomeCompleto.trim()) {
      alert('Por favor, informe o nome completo do proprietário.');
      return;
    }
    if (!data.cpf.trim()) {
      alert('Por favor, informe o CPF do proprietário.');
      return;
    }
    if (!data.assinaturaDigitalUrl) {
      alert('Por favor, faça a assinatura digital no quadro no final do formulário.');
      return;
    }

    setSubmittingToFirebase(true);

    try {
      const nowIso = new Date().toISOString();
      const payload: FullCadastroData = {
        ...data,
        assinadoEm: nowIso,
        criadoEm: nowIso,
        status: 'pendente', // Entra como pendente para o Back Office conferir!
      };

      // Salva no Firestore
      const docRef = await addDoc(collection(db, 'cadastros'), payload);
      
      const savedData = { ...payload, id: docRef.id };
      setData(savedData);
      setActivePrintData(savedData);
      setCurrentView('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'cadastros');
      alert('Ocorreu um erro ao enviar para o banco de dados. Por favor tente novamente.');
    } finally {
      setSubmittingToFirebase(false);
    }
  };

  // =========================================================================
  // VIEW: IMPRESSÃO DA AUTORIZAÇÃO OFICIAL TORRESUL (PDF)
  // =========================================================================
  if (currentView === 'print' && activePrintData) {
    return (
      <TorresulPrintDocument
        data={activePrintData}
        onBack={() => setCurrentView('backoffice')}
        onUpdateCodigo={(cod) => {
          setActivePrintData((prev) => (prev ? { ...prev, codigoImovel: cod } : null));
        }}
      />
    );
  }

  // =========================================================================
  // VIEW: PAINEL DO BACK OFFICE (IMOBILIÁRIA CONFERE E BAIXA O PDF)
  // =========================================================================
  if (currentView === 'backoffice') {
    return (
      <div className="min-h-screen bg-slate-100 font-sans">
        {/* Barra de alternância rápida no topo */}
        <header className="no-print bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Torresul Imobiliária</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">Ambiente de Back Office</span>
          </div>

          <button
            onClick={() => setCurrentView('form')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ir para Formulário do Cliente
          </button>
        </header>

        <BackOfficeDashboard
          onOpenPrint={(item) => {
            setActivePrintData(item);
            setCurrentView('print');
          }}
          onGoToClientForm={() => setCurrentView('form')}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW: TELA DE SUCESSO DO CLIENTE (SEM WHATSAPP, APENAS PDF)
  // =========================================================================
  if (currentView === 'success') {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 font-sans text-slate-800">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Cadastro Enviado com Sucesso
              </span>
              <h1 className="text-2xl font-black text-slate-900 pt-2">
                Obrigado, {data.nomeCompleto.split(' ')[0]}!
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                Suas informações e a autorização de venda foram recebidas pelo nosso setor de agenciamento da <strong>Torresul Imobiliária</strong> para conferência e cadastro no sistema.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1 text-slate-700">
              <p><strong>Proprietário:</strong> {data.nomeCompleto} · CPF: {data.cpf}</p>
              <p><strong>Imóvel:</strong> {data.tipoImovel} em {data.bairroImovel || data.cidadeImovel}</p>
              <p><strong>Status:</strong> <span className="text-amber-700 font-semibold">Pendente para conferência no Back Office</span></p>
              <p><strong>Assinatura Digital:</strong> Registrada eletronicamente</p>
            </div>

            {/* Apenas o botão de visualizar / salvar PDF, exatamente como solicitado! */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setActivePrintData(data);
                  setCurrentView('print');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs mx-auto"
              >
                <Printer className="w-4 h-4" />
                Visualizar / Salvar Autorização em PDF
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => setCurrentView('form')}
                className="hover:text-slate-700 cursor-pointer"
              >
                ← Voltar ao formulário
              </button>

              <button
                onClick={() => setCurrentView('backoffice')}
                className="hover:text-slate-700 font-medium cursor-pointer"
              >
                Acessar Back Office
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: FORMULÁRIO DO CLIENTE (INFORMAÇÕES PARA CADASTRO)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* BARRA SUPERIOR DE CONEXÃO & BACK OFFICE */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Torresul Imobiliária · Agenciamento</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAutoImport(true)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              Colar do WhatsApp
            </button>

            <button
              type="button"
              onClick={() => setShowConfigLink(!showConfigLink)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Link do Corretor
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('backoffice')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors ml-1"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Painel Back Office
            </button>
          </div>
        </div>

        {/* Painel expansível de link do corretor */}
        {showConfigLink && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
            <div>
              <label className="text-slate-600 block mb-1">Nome do Corretor para constar no link:</label>
              <input
                type="text"
                value={data.nomeCorretor}
                onChange={(e) => setData({ ...data, nomeCorretor: e.target.value })}
                placeholder="ex: Cris Lima"
                className="w-full sm:w-2/3 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                {copiedLink ? 'Link Copiado!' : 'Copiar Link para o Cliente'}
              </button>
            </div>
          </div>
        )}

        {/* Modal de importação rápida de texto */}
        {showAutoImport && (
          <div className="bg-white rounded-xl border-2 border-slate-800 p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ClipboardPaste className="w-4 h-4 text-emerald-600" />
                Preenchimento Automático via Texto do WhatsApp
              </span>
              <button
                type="button"
                onClick={() => setShowAutoImport(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Cole a mensagem enviada pelo cliente. O sistema detecta CPF, CEP, telefone, sol, vaga e preenche as perguntas automaticamente!
            </p>
            <textarea
              rows={4}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Cole a mensagem do WhatsApp aqui..."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:border-slate-800 focus:outline-none"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAutoImport(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessPastedText}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
              >
                Preencher Campos
              </button>
            </div>
          </div>
        )}

        {/* CARD PRINCIPAL DE CABEÇALHO (Informações para Cadastro) */}
        <div className="bg-white rounded-xl border border-slate-200 border-t-8 border-t-red-600 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Torresul Imobiliária · Blumenau/SC
            </span>
            {data.nomeCorretor && (
              <span className="text-xs font-semibold text-slate-700">
                Corretor: {data.nomeCorretor}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Informações para Cadastro
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Preencha os dados abaixo para o agenciamento e autorização de venda do seu imóvel.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-red-600 font-medium">
            * Indica uma pergunta obrigatória
          </div>
        </div>

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ================= SEÇÃO 1: DADOS DO PROPRIETÁRIO ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700" />
              1. Dados do Proprietário
            </h2>

            {/* Nome do Corretor */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Nome do Corretor?
              </label>
              <input
                type="text"
                value={data.nomeCorretor}
                onChange={(e) => setData({ ...data, nomeCorretor: e.target.value })}
                placeholder="Sua resposta"
                className="w-full sm:w-2/3 border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
              />
            </div>

            {/* Tipo de Pessoa */}
            <div className="flex items-center gap-4 text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="tipoPessoa"
                  checked={!data.isPessoaJuridica}
                  onChange={() => setData({ ...data, isPessoaJuridica: false })}
                  className="text-slate-800"
                />
                <span>Pessoa Física (CPF)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="tipoPessoa"
                  checked={data.isPessoaJuridica}
                  onChange={() => setData({ ...data, isPessoaJuridica: true })}
                  className="text-slate-800"
                />
                <span>Pessoa Jurídica (Razão Social & CNPJ)</span>
              </label>
            </div>

            {/* Campos se for Pessoa Jurídica */}
            {data.isPessoaJuridica && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Razão Social*
                  </label>
                  <input
                    type="text"
                    value={data.razaoSocial}
                    onChange={(e) => setData({ ...data, razaoSocial: e.target.value })}
                    placeholder="Nome da empresa"
                    className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    CNPJ*
                  </label>
                  <input
                    type="text"
                    value={data.cnpj}
                    onChange={(e) => setData({ ...data, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                    className="w-full border-b border-slate-300 pb-1 text-sm font-mono focus:border-slate-800 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* Seu nome completo */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Seu nome completo (Proprietário) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.nomeCompleto}
                onChange={(e) => setData({ ...data, nomeCompleto: e.target.value })}
                placeholder="Sua resposta"
                className="w-full sm:w-2/3 border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
              />
            </div>

            {/* CPF e Data de Nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.cpf}
                  onChange={(e) => setData({ ...data, cpf: maskCpf(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full border-b border-slate-300 pb-1 text-sm font-mono focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Data de nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={data.dataNascimento}
                  onChange={(e) => setData({ ...data, dataNascimento: e.target.value })}
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Profissão e Estado Civil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Profissão? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.profissao}
                  onChange={(e) => setData({ ...data, profissao: e.target.value })}
                  placeholder="ex: Engenheiro, Comerciante"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Estado Civil? <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.estadoCivil}
                  onChange={(e) => setData({ ...data, estadoCivil: e.target.value })}
                  className="w-full border-b border-slate-300 pb-1 text-sm bg-transparent focus:border-slate-800 focus:outline-none"
                >
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </div>
            </div>

            {/* Telefone e E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Telefone / Celular? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={data.telefone}
                  onChange={(e) => setData({ ...data, telefone: maskPhone(e.target.value) })}
                  placeholder="(47) 00000-0000"
                  maxLength={15}
                  className="w-full border-b border-slate-300 pb-1 text-sm font-mono focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  E-mail ? <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="seuemail@exemplo.com"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* CEP e Endereço Residencial */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    CEP de onde mora? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={data.cepOndeMora}
                      onChange={(e) => setData({ ...data, cepOndeMora: maskCep(e.target.value) })}
                      onBlur={handleCepPropBlur}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full border-b border-slate-300 pb-1 text-sm font-mono focus:border-slate-800 focus:outline-none"
                    />
                    {loadingCepProp && (
                      <span className="absolute right-1 bottom-1 text-[10px] text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> buscando...
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Endereço completo (Rua/Avenida onde mora)*
                  </label>
                  <input
                    type="text"
                    required
                    value={data.enderecoProprietario}
                    onChange={(e) => setData({ ...data, enderecoProprietario: e.target.value })}
                    placeholder="Rua / Avenida"
                    className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500">Número*</label>
                  <input
                    type="text"
                    required
                    value={data.numeroProprietario}
                    onChange={(e) => setData({ ...data, numeroProprietario: e.target.value })}
                    placeholder="ex: 120, Apto 302"
                    className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Bairro*</label>
                  <input
                    type="text"
                    required
                    value={data.bairroProprietario}
                    onChange={(e) => setData({ ...data, bairroProprietario: e.target.value })}
                    placeholder="Bairro"
                    className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Cidade*</label>
                  <input
                    type="text"
                    required
                    value={data.cidadeProprietario}
                    onChange={(e) => setData({ ...data, cidadeProprietario: e.target.value })}
                    placeholder="Blumenau"
                    className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SEÇÃO 2: DADOS DO IMÓVEL ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-slate-700" />
                2. Dados do Imóvel para Venda
              </h2>

              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={data.enderecoImovelMesmo}
                  onChange={(e) => handleToggleSameAddress(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900"
                />
                Mesmo endereço onde moro
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tipo do imóvel*
                </label>
                <select
                  value={data.tipoImovel}
                  onChange={(e) => setData({ ...data, tipoImovel: e.target.value })}
                  className="w-full border-b border-slate-300 pb-1 text-sm bg-transparent focus:border-slate-800 focus:outline-none"
                >
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Sobrado">Sobrado</option>
                  <option value="Cobertura">Cobertura</option>
                  <option value="Terreno">Terreno / Lote</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Metragem privativa (m²)
                </label>
                <input
                  type="text"
                  value={data.metragemPrivativa}
                  onChange={(e) => setData({ ...data, metragemPrivativa: e.target.value })}
                  placeholder="ex: 78 m²"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Loteamento / Condomínio
                </label>
                <input
                  type="text"
                  value={data.loteamentoCondominio}
                  onChange={(e) => setData({ ...data, loteamentoCondominio: e.target.value })}
                  placeholder="Nome do condomínio"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Endereço do Imóvel */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Endereço do imóvel (Rua/Avenida)*
                </label>
                <input
                  type="text"
                  required
                  value={data.enderecoImovel}
                  onChange={(e) => setData({ ...data, enderecoImovel: e.target.value })}
                  placeholder="Rua / Avenida"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Número e Apto*</label>
                <input
                  type="text"
                  required
                  value={data.numeroImovel}
                  onChange={(e) => setData({ ...data, numeroImovel: e.target.value })}
                  placeholder="ex: 450, Apto 502"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Bairro*</label>
                <input
                  type="text"
                  required
                  value={data.bairroImovel}
                  onChange={(e) => setData({ ...data, bairroImovel: e.target.value })}
                  placeholder="ex: Itoupava Central"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Matrícula */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Nº da Matrícula do Imóvel* (se souber)
                </label>
                <input
                  type="text"
                  value={data.numeroMatricula}
                  onChange={(e) => setData({ ...data, numeroMatricula: e.target.value })}
                  placeholder="ex: 45.890 - 2º Ofício RI"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Nº da Incorporação (se na planta)
                </label>
                <input
                  type="text"
                  value={data.numeroIncorporacao}
                  onChange={(e) => setData({ ...data, numeroIncorporacao: e.target.value })}
                  placeholder="R.3-..."
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Sol da manhã ou da tarde */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Sol da manha ou da tarde? <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {['Sol da manhã', 'Sol da tarde', 'Ambos / Indiferente'].map((sol) => (
                  <label key={sol} className="flex items-center gap-1.5 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <input
                      type="radio"
                      name="solOrientacao"
                      value={sol}
                      checked={data.solOrientacao === sol}
                      onChange={(e) => setData({ ...data, solOrientacao: e.target.value })}
                      className="text-slate-800"
                    />
                    <span>{sol}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Número da vaga de estacionamento */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Numero da vaga de estacionamento? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.numeroVaga}
                onChange={(e) => setData({ ...data, numeroVaga: e.target.value })}
                placeholder="ex: Vaga nº 42 (coberta e privativa)"
                className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {VAGAS_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setData({ ...data, numeroVaga: chip })}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Móveis que ficam no imóvel */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Moveis que ficam no imóvel? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={data.moveisFicam}
                onChange={(e) => setData({ ...data, moveisFicam: e.target.value })}
                placeholder="Descreva o que permanece (móveis planejados, ar-condicionado, etc.)"
                className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none resize-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {MOVEIS_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendChip('moveisFicam', chip)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Opções de Lazer */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Opções de Lazer? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={data.opcoesLazerDescricao}
                onChange={(e) => setData({ ...data, opcoesLazerDescricao: e.target.value })}
                placeholder="ex: Piscina, Salão de Festas, Academia, Playground..."
                className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none resize-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {LAZER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendChip('opcoesLazerDescricao', chip)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= SEÇÃO 3: SITUAÇÃO & CARACTERÍSTICAS ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" />
              3. Situação e Itens do Imóvel (Check-list)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.imovelLocado}
                  onChange={(e) => setData({ ...data, imovelLocado: e.target.checked })}
                  className="rounded text-slate-800"
                />
                <span>Imóvel Locado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.imovelAverbado}
                  onChange={(e) => setData({ ...data, imovelAverbado: e.target.checked })}
                  className="rounded text-slate-800"
                />
                <span>Imóvel Averbado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.aceitaFinanciamento}
                  onChange={(e) => setData({ ...data, aceitaFinanciamento: e.target.checked })}
                  className="rounded text-slate-800"
                />
                <span>Aceita Financiamento</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.aceitaFgts}
                  onChange={(e) => setData({ ...data, aceitaFgts: e.target.checked })}
                  className="rounded text-slate-800"
                />
                <span>Aceita FGTS</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.imovelQuitado}
                  onChange={(e) => setData({ ...data, imovelQuitado: e.target.checked })}
                  className="rounded text-slate-800"
                />
                <span>Imóvel Quitado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.terrenoEscriturado}
                  onChange={(e) => setData({ ...data, terrenoEscriturado: e.target.checked })}
                  className="rounded text-slate-800"
                />
                <span>Terreno/Lote Escriturado</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Condomínio R$:</label>
                <input
                  type="text"
                  value={data.valorCondominio}
                  onChange={(e) => setData({ ...data, valorCondominio: maskCurrency(e.target.value) })}
                  placeholder="R$ 0,00"
                  className="w-full border-b border-slate-300 pb-1 font-mono focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Mobília:</label>
                <select
                  value={data.mobiliaStatus}
                  onChange={(e) => setData({ ...data, mobiliaStatus: e.target.value as any })}
                  className="w-full border-b border-slate-300 pb-1 bg-transparent focus:border-slate-800 focus:outline-none"
                >
                  <option value="Semi Mobiliado">Semi Mobiliado</option>
                  <option value="Mobiliado">Mobiliado</option>
                  <option value="Sem Mobília">Sem Mobília</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Estado do Imóvel:</label>
                <select
                  value={data.condicaoImovel}
                  onChange={(e) => setData({ ...data, condicaoImovel: e.target.value as any })}
                  className="w-full border-b border-slate-300 pb-1 bg-transparent focus:border-slate-800 focus:outline-none"
                >
                  <option value="Imóvel Usado">Imóvel Usado</option>
                  <option value="Imóvel Novo">Imóvel Novo</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Selecione as características que o imóvel possui:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {LISTA_CARACTERISTICAS.map((item) => {
                  const checked = data.caracteristicas.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleCaracteristica(item)}
                      className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                        checked
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                        checked ? 'border-white bg-slate-800' : 'border-slate-300'
                      }`}>
                        {checked ? '✓' : ''}
                      </span>
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= SEÇÃO 4: NEGOCIAÇÃO E VALORES ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-700" />
              4. Negociação e Valores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Valor do imóvel para anúncio*
                </label>
                <input
                  type="text"
                  required
                  value={data.valorAnuncio}
                  onChange={(e) => setData({ ...data, valorAnuncio: maskCurrency(e.target.value) })}
                  placeholder="R$ 0,00"
                  className="w-full border-b border-slate-300 pb-1 text-sm font-mono font-bold focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Margem de Negociação (se houver)
                </label>
                <input
                  type="text"
                  value={data.margemNegociacao}
                  onChange={(e) => setData({ ...data, margemNegociacao: e.target.value })}
                  placeholder="ex: até 5% ou estuda proposta"
                  className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Aceita Permuta como parte do pagamento?
              </label>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.permutaImovel}
                    onChange={(e) => setData({ ...data, permutaImovel: e.target.checked })}
                    className="rounded text-slate-800"
                  />
                  <span>Imóvel</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.permutaTerreno}
                    onChange={(e) => setData({ ...data, permutaTerreno: e.target.checked })}
                    className="rounded text-slate-800"
                  />
                  <span>Terreno</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.permutaCarro}
                    onChange={(e) => setData({ ...data, permutaCarro: e.target.checked })}
                    className="rounded text-slate-800"
                  />
                  <span>Carro</span>
                </label>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="block text-xs font-semibold text-slate-700">
                Breve descrição do imóvel (pontos fortes, referências e particularidades):
              </label>
              <textarea
                rows={2}
                value={data.breveDescricao}
                onChange={(e) => setData({ ...data, breveDescricao: e.target.value })}
                placeholder="ex: Próximo à Cooper, rua asfaltada e tranquila, excelente ventilação e vizinhança familiar."
                className="w-full border-b border-slate-300 pb-1 text-sm focus:border-slate-800 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* ================= SEÇÃO 5: CONDIÇÕES & ASSINATURA DIGITAL ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-slate-700" />
              5. Autorização Torresul & Assinatura Digital
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Regime de Exclusividade:
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exclusividade"
                      checked={data.exclusividade}
                      onChange={() => setData({ ...data, exclusividade: true })}
                      className="text-slate-800"
                    />
                    <span>Com Exclusividade</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exclusividade"
                      checked={!data.exclusividade}
                      onChange={() => setData({ ...data, exclusividade: false })}
                      className="text-slate-800"
                    />
                    <span>Sem Exclusividade</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Honorários de Corretagem:
                </label>
                <span className="font-bold text-slate-900">
                  {data.comissaoPercentual}% sobre o valor da venda (Padrão CRECI)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              Autorizo a <strong>TORRESUL IMOBILIÁRIA LTDA ME (CRECI 4218J - Blumenau/SC)</strong> a promover a venda de minha propriedade sob as condições estipuladas nas cláusulas gerais de agenciamento, autorizando a divulgação em mídias, fotos e placas.
            </p>

            <DigitalSignaturePad
              initialSignature={data.assinaturaDigitalUrl}
              onSave={(dataUrl) => setData({ ...data, assinaturaDigitalUrl: dataUrl })}
              onClear={() => setData({ ...data, assinaturaDigitalUrl: '' })}
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-between pt-2 pb-12">
            <button
              type="submit"
              disabled={submittingToFirebase}
              className={`px-6 py-2.5 text-white font-medium text-sm rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer ${
                submittingToFirebase
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {submittingToFirebase ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando no Banco de Dados...
                </>
              ) : (
                'Enviar Cadastro para Autorização'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja limpar todos os campos?')) {
                  setData(INITIAL_DATA);
                }
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Limpar formulário
            </button>
          </div>
        </form>

        <div className="text-center text-[11px] text-slate-400 pb-8">
          Formulário seguro conectado em tempo real com o banco de dados da Torresul Imobiliária.
        </div>
      </div>
    </div>
  );
}
