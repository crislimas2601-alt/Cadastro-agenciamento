import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FullCadastroData } from '../types/authorization';
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  User,
  Home,
  Shield,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';

interface BackOfficeDashboardProps {
  onOpenPrint: (data: FullCadastroData) => void;
  onGoToClientForm: () => void;
}

export const BackOfficeDashboard: React.FC<BackOfficeDashboardProps> = ({
  onOpenPrint,
  onGoToClientForm,
}) => {
  const [cadastros, setCadastros] = useState<FullCadastroData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendente' | 'conferido'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Item selecionado para conferência
  const [selectedCadastro, setSelectedCadastro] = useState<FullCadastroData | null>(null);
  const [manualCodigo, setManualCodigo] = useState('');
  const [conferidoNome, setConferidoNome] = useState('Back Office Torresul');
  const [savingStatus, setSavingStatus] = useState(false);

  // Escuta em tempo real do Firestore
  useEffect(() => {
    const q = query(collection(db, 'cadastros'), orderBy('criadoEm', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: FullCadastroData[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as FullCadastroData);
        });
        setCadastros(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'cadastros');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Quando seleciona um cadastro, sincroniza o código manual
  const handleSelectCadastro = (item: FullCadastroData) => {
    setSelectedCadastro(item);
    setManualCodigo(item.codigoImovel || '');
  };

  // Salvar conferência e atualizar status no Firestore
  const handleConfirmConference = async (marcarConferido: boolean) => {
    if (!selectedCadastro || !selectedCadastro.id) return;
    setSavingStatus(true);

    try {
      const docRef = doc(db, 'cadastros', selectedCadastro.id);
      const updates: Partial<FullCadastroData> = {
        codigoImovel: manualCodigo.trim().toUpperCase(),
      };

      if (marcarConferido) {
        updates.status = 'conferido';
        updates.conferidoEm = new Date().toISOString();
        updates.conferidoPor = conferidoNome;
      }

      await updateDoc(docRef, updates);

      setSelectedCadastro((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `cadastros/${selectedCadastro.id}`);
    } finally {
      setSavingStatus(false);
    }
  };

  // Filtros
  const filteredList = cadastros.filter((c) => {
    const matchesStatus =
      filterStatus === 'todos' || (c.status || 'pendente') === filterStatus;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.nomeCompleto?.toLowerCase().includes(term) ||
      c.cpf?.toLowerCase().includes(term) ||
      c.cidadeImovel?.toLowerCase().includes(term) ||
      c.bairroImovel?.toLowerCase().includes(term) ||
      c.nomeCorretor?.toLowerCase().includes(term) ||
      c.codigoImovel?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const pendentesCount = cadastros.filter((c) => (c.status || 'pendente') === 'pendente').length;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Cabeçalho do Back Office */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 block">
            Torresul Imobiliária · Setor de Agenciamento
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Back Office · Painel de Conferência de Cadastros
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Consulte os cadastros e autorizações de venda preenchidos pelos proprietários em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Pendentes</span>
            <span className="text-lg font-black text-amber-400 font-mono">{pendentesCount}</span>
          </div>

          <button
            onClick={onGoToClientForm}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir Formulário do Cliente
          </button>
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              filterStatus === 'todos'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({cadastros.length})
          </button>

          <button
            onClick={() => setFilterStatus('pendente')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'pendente'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pendentes ({pendentesCount})
          </button>

          <button
            onClick={() => setFilterStatus('conferido')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'conferido'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Conferidos ({cadastros.length - pendentesCount})
          </button>
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proprietário, CPF, código..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Principal: Lista à Esquerda + Detalhes/Conferência à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Lista de Cadastros */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden max-h-[700px] flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
            Cadastros Recebidos ({filteredList.length})
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Carregando registros do banco de dados...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum cadastro encontrado com este filtro.
              </div>
            ) : (
              filteredList.map((item) => {
                const isSelected = selectedCadastro?.id === item.id;
                const isPendente = (item.status || 'pendente') === 'pendente';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectCadastro(item)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer block ${
                      isSelected
                        ? 'bg-slate-100 border-l-4 border-slate-900'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {item.nomeCompleto}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPendente
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isPendente ? 'Pendente' : 'Conferido'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p className="truncate">
                        {item.tipoImovel} · {item.bairroImovel || item.cidadeImovel}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Corretor: {item.nomeCorretor || 'Não informado'}</span>
                        {item.codigoImovel && (
                          <span className="font-mono font-bold text-slate-700">
                            {item.codigoImovel}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna 2 e 3: Painel de Conferência do Item Selecionado */}
        <div className="lg:col-span-2">
          {selectedCadastro ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              
              {/* Barra Superior da Conferência */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      {selectedCadastro.nomeCompleto}
                    </h2>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        (selectedCadastro.status || 'pendente') === 'pendente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {(selectedCadastro.status || 'pendente') === 'pendente'
                        ? 'Pendente para Conferência'
                        : 'Conferido no Sistema'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enviado em {selectedCadastro.criadoEm ? new Date(selectedCadastro.criadoEm).toLocaleString('pt-BR') : 'Data não registrada'}
                    {selectedCadastro.conferidoEm && ` · Conferido em ${new Date(selectedCadastro.conferidoEm).toLocaleString('pt-BR')} por ${selectedCadastro.conferidoPor}`}
                  </p>
                </div>

                <button
                  onClick={() => onOpenPrint({ ...selectedCadastro, codigoImovel: manualCodigo })}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Visualizar / Baixar PDF Oficial
                </button>
              </div>

              {/* Caixa de Ação do Back Office: Código do Imóvel & Check de Conferência */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Ação do Back Office (Conferência & Inclusão no Sistema):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">
                      Código do Imóvel (Atribuído manualmente pela imobiliária):
                    </label>
                    <input
                      type="text"
                      value={manualCodigo}
                      onChange={(e) => setManualCodigo(e.target.value.toUpperCase())}
                      placeholder="ex: AP-104"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-mono font-bold text-sm bg-white uppercase focus:border-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      disabled={savingStatus}
                      onClick={() => handleConfirmConference(true)}
                      className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      {savingStatus ? 'Salvando...' : 'Conferi e Validar'}
                    </button>

                    <button
                      type="button"
                      disabled={savingStatus}
                      onClick={() => handleConfirmConference(false)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      title="Salvar apenas o código do imóvel"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Código
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalhamento das Respostas do Proprietário */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Bloco 1: Dados do Proprietário */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-white">
                  <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1 uppercase tracking-wide text-[11px]">
                    1. Dados do Proprietário
                  </span>
                  <p><strong>Nome:</strong> {selectedCadastro.nomeCompleto}</p>
                  <p><strong>CPF:</strong> <span className="font-mono">{selectedCadastro.cpf}</span></p>
                  <p><strong>Data Nasc.:</strong> {selectedCadastro.dataNascimento ? new Date(selectedCadastro.dataNascimento).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                  <p><strong>Profissão:</strong> {selectedCadastro.profissao}</p>
                  <p><strong>Estado Civil:</strong> {selectedCadastro.estadoCivil}</p>
                  <p><strong>Telefone / WhatsApp:</strong> <span className="font-mono font-bold text-slate-900">{selectedCadastro.telefone}</span></p>
                  <p><strong>E-mail:</strong> {selectedCadastro.email}</p>
                  <p><strong>Endereço Residencial:</strong> {selectedCadastro.enderecoProprietario}, {selectedCadastro.numeroProprietario} ({selectedCadastro.bairroProprietario} - {selectedCadastro.cidadeProprietario}) · CEP: {selectedCadastro.cepOndeMora}</p>
                </div>

                {/* Bloco 2: Dados do Imóvel & Valores */}
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-white">
                  <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1 uppercase tracking-wide text-[11px]">
                    2. Dados do Imóvel & Valores
                  </span>
                  <p><strong>Tipo:</strong> {selectedCadastro.tipoImovel} · <strong>Área Privativa:</strong> {selectedCadastro.metragemPrivativa || 'Não inf.'} m²</p>
                  <p><strong>Endereço:</strong> {selectedCadastro.enderecoImovel}, {selectedCadastro.numeroImovel} ({selectedCadastro.bairroImovel} - {selectedCadastro.cidadeImovel})</p>
                  <p><strong>Valor para Anúncio:</strong> <strong className="font-mono text-slate-900 text-sm">{selectedCadastro.valorAnuncio || 'A combinar'}</strong></p>
                  <p><strong>Condomínio R$:</strong> {selectedCadastro.valorCondominio || 'N/A'}</p>
                  <p><strong>Sol da manhã ou tarde:</strong> <span className="font-semibold">{selectedCadastro.solOrientacao}</span></p>
                  <p><strong>Vaga de garagem:</strong> {selectedCadastro.numeroVaga}</p>
                  <p><strong>Móveis que ficam:</strong> {selectedCadastro.moveisFicam}</p>
                  <p><strong>Opções de Lazer:</strong> {selectedCadastro.opcoesLazerDescricao}</p>
                  <p><strong>Exclusividade:</strong> {selectedCadastro.exclusividade ? 'SIM (Exclusivo)' : 'NÃO (Sem Exclusividade)'}</p>
                </div>
              </div>

              {/* Bloco 3: Assinatura Digital do Proprietário */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">
                  Assinatura Digital Registrada:
                </span>
                {selectedCadastro.assinaturaDigitalUrl ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 inline-block">
                    <img
                      src={selectedCadastro.assinaturaDigitalUrl}
                      alt="Assinatura"
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma assinatura digital anexada.</p>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">Selecione um cadastro ao lado para conferir</p>
              <p>Você poderá verificar todas as informações, atribuir o código manual e gerar o PDF oficial.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
