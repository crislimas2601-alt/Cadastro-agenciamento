import { CadastroSubmission } from '../types/checklist';

const DB_NAME = 'FastAgenciaImob_DB';
const DB_VERSION = 1;
const STORE_NAME = 'cadastros_agenciamento';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSubmission(submission: CadastroSubmission): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(submission);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSubmissions(): Promise<CadastroSubmission[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const list = (req.result || []) as CadastroSubmission[];
      // Ordena por data decrescente (mais recente primeiro)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getSubmissionById(id: string): Promise<CadastroSubmission | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSubmission(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateSubmissionStatus(
  id: string,
  status: CadastroSubmission['statusProcesso'],
  obs?: string
): Promise<void> {
  const item = await getSubmissionById(id);
  if (!item) return;
  item.statusProcesso = status;
  if (obs !== undefined) item.observacoesBackoffice = obs;
  await saveSubmission(item);
}

// Inicializa dados de exemplo para o treinamento de agenciamento caso o banco esteja vazio
export async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    const current = await getAllSubmissions();
    if (current.length > 0) return;

    const samplePF: CadastroSubmission = {
      id: 'CAD-PF-8921',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      sellerType: 'PF',
      nomeCorretor: 'Cris Lima',
      nomeCompleto: 'Eduardo Martins dos Santos',
      cpfOuCnpj: '084.721.909-32',
      dataNascimentoOuFundacao: '1984-05-18',
      profissao: 'Engenheiro Mecânico',
      estadoCivil: 'Casado(a)',
      enderecoCompleto: 'Rua Benjamin Constant, nº 1420, Apto 502, Bairro Escola Agrícola - Blumenau/SC',
      cep: '89037-501',
      solOrientacao: 'Sol da manhã',
      email: 'eduardo.martins@gmail.com',
      opcoesLazer: 'Piscina, Salão de Festas, Playground, Portaria 24h',
      telefone: '(47) 98841-3210',
      moveisFicam: 'Ficam todos os móveis planejados da cozinha, armários dos 3 quartos e 2 splits instalados.',
      numeroVaga: 'Vaga nº 24 (G1, coberta e privativa)',
      contaCaixaFinanciamento: 'Agência 0412, Conta Corrente 0012458-9',
      telefoneEngenhariaCaixa: '(47) 99123-4567 (Eng. Rodrigo)',
      temProcurador: false,
      numeroMatriculaIndividualizada: 'Matrícula nº 45.892 (1º Ofício de Imóveis de Blumenau)',
      documents: {
        pf_rg_cnh: {
          id: 'doc-1',
          key: 'pf_rg_cnh',
          label: 'Cópia da Carteira de Identidade ou CNH',
          category: 'vendedor',
          name: 'cnh_eduardo_martins.pdf',
          size: 420000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
        pf_cpf: {
          id: 'doc-2',
          key: 'pf_cpf',
          label: 'Cópia do CPF',
          category: 'vendedor',
          status: 'nao_se_aplica',
          notes: 'Consta no RG/CNH',
        },
        pf_estado_civil: {
          id: 'doc-3',
          key: 'pf_estado_civil',
          label: 'Certidão de Estado Civil (Casamento)',
          category: 'vendedor',
          name: 'certidao_casamento_registrada.pdf',
          size: 610000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
        pf_comprovante_residencia: {
          id: 'doc-4',
          key: 'pf_comprovante_residencia',
          label: 'Comprovante de Residência do último mês',
          category: 'vendedor',
          name: 'fatura_energia_cee_setembro.pdf',
          size: 290000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
        pf_matricula: {
          id: 'doc-5',
          key: 'pf_matricula',
          label: 'Certidão de Inteiro Teor da Matrícula',
          category: 'imovel',
          status: 'solicitar_despachante',
          notes: 'Informado nº da matrícula 45.892 para o despachante solicitar',
        },
        pf_onus_reais: {
          id: 'doc-6',
          key: 'pf_onus_reais',
          label: 'Certidão Negativa de Ônus Reais',
          category: 'imovel',
          status: 'solicitar_despachante',
          notes: 'Solicitar via despachante',
        },
        pf_acoes_reais: {
          id: 'doc-7',
          key: 'pf_acoes_reais',
          label: 'Certidão Negativa de Ações Reais ou Reipersecutórias',
          category: 'imovel',
          status: 'solicitar_despachante',
          notes: 'Solicitar via despachante',
        },
      },
      statusProcesso: 'em_analise',
    };

    const samplePJ: CadastroSubmission = {
      id: 'CAD-PJ-4510',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      sellerType: 'PJ',
      nomeCorretor: 'Cris Lima',
      nomeCompleto: 'Vanguard Construtora e Incorporadora Ltda',
      cpfOuCnpj: '18.942.311/0001-45',
      dataNascimentoOuFundacao: '2016-03-10',
      profissao: 'Construção Civil & Incorporação',
      estadoCivil: 'Sociedade Limitada',
      enderecoCompleto: 'Rua Dr. Pedro Zimmermann, nº 3200, Itoupava Central - Blumenau/SC',
      cep: '89068-000',
      solOrientacao: 'Sol da manhã',
      email: 'contato@vanguardincorporadora.com.br',
      opcoesLazer: 'Piscina aquecida, Academia equipada, Espaço Gourmet, Brinquedoteca, Portaria 24h',
      telefone: '(47) 3322-9090',
      moveisFicam: 'Imóvel novo nunca habitado. Ficam acabamentos em gesso, piso porcelanato e preparação para split.',
      numeroVaga: '2 vagas privativas cobertas no subsolo',
      contaCaixaFinanciamento: 'Agência 1550, Conta Jurídica 0003412-5',
      telefoneEngenhariaCaixa: '(47) 99876-1122 (Eng. Marcos - Construtora)',
      numeroFuncionariosObra: '14 funcionários (10 contratados diretos CLT e 4 terceirizados de elétrica)',
      ehApartamentoObra: true,
      documents: {
        pj_contrato_social: {
          id: 'pj-doc-1',
          key: 'pj_contrato_social',
          label: 'Cópia do Contrato Social e Alterações',
          category: 'vendedor',
          name: 'contrato_social_consolidado.pdf',
          size: 1450000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
        pj_jucesc: {
          id: 'pj-doc-2',
          key: 'pj_jucesc',
          label: 'Certidão Simplificada JUCESC (últimos 90 dias)',
          category: 'vendedor',
          name: 'certidao_simplificada_jucesc.pdf',
          size: 380000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
        pj_alvara_construcao: {
          id: 'pj-doc-3',
          key: 'pj_alvara_construcao',
          label: 'Alvará de Construção',
          category: 'imovel',
          name: 'alvara_construcao_prefeitura.pdf',
          size: 510000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
        pj_habite_se: {
          id: 'pj-doc-4',
          key: 'pj_habite_se',
          label: 'Alvará de Habite-se',
          category: 'imovel',
          name: 'alvara_habite_se_definitivo.pdf',
          size: 470000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
        pj_arts: {
          id: 'pj-doc-5',
          key: 'pj_arts',
          label: 'ARTs de Projetos e Execução da Obra',
          category: 'imovel',
          name: 'arts_projetos_crea_sc.pdf',
          size: 890000,
          type: 'application/pdf',
          status: 'anexado',
          uploadedAt: new Date().toISOString(),
        },
      },
      statusProcesso: 'novo',
    };

    await saveSubmission(samplePF);
    await saveSubmission(samplePJ);
  } catch (e) {
    console.error('Erro ao semear dados de demonstração:', e);
  }
}
