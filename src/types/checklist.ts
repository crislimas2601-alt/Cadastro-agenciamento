export type SellerType = 'PF' | 'PJ';

export interface AttachedDocument {
  id: string;
  key: string;
  label: string;
  category: 'vendedor' | 'procurador' | 'imovel';
  name?: string;
  size?: number;
  type?: string;
  dataUrl?: string; // Base64 para download/visualização
  status: 'anexado' | 'pendente' | 'solicitar_despachante' | 'nao_se_aplica';
  uploadedAt?: string;
  notes?: string;
}

export interface CadastroSubmission {
  id: string;
  createdAt: string;
  sellerType: SellerType;
  
  // 14 Informações para Cadastro (Base do Agenciamento)
  nomeCorretor: string;
  nomeCompleto: string; // Nome completo (PF) ou Razão Social (PJ)
  cpfOuCnpj: string;
  dataNascimentoOuFundacao: string;
  profissao: string; // Profissão (PF) ou Ramo de Atuação (PJ)
  estadoCivil: string; // Estado Civil (PF) ou Regime Tributário (PJ)
  enderecoCompleto: string;
  cep: string;
  solOrientacao: string;
  email: string;
  opcoesLazer: string;
  telefone: string;
  moveisFicam: string;
  numeroVaga: string;

  // Dados Bancários e Contato da Engenharia Caixa (Presentes em ambos os checklists)
  contaCaixaFinanciamento: string;
  telefoneEngenhariaCaixa: string;

  // Campos Específicos para Pessoa Física (Checklist PF)
  temProcurador?: boolean;
  nomeProcurador?: string;
  cpfProcurador?: string;
  numeroMatriculaIndividualizada?: string; // Caso não tenha em mãos a certidão de inteiro teor

  // Campos Específicos para Pessoa Jurídica (Checklist PJ)
  numeroFuncionariosObra?: string; // Número de funcionários e se eram contratados ou terceirizados (para SCPO)
  ehApartamentoObra?: boolean; // Se for apto, não precisa Síntese Memorial Descritivo

  // Documentos Anexados
  documents: Record<string, AttachedDocument>;
  
  // Status de controle do Back Office
  statusProcesso: 'novo' | 'em_analise' | 'documentos_aprovados' | 'com_pendencia';
  observacoesBackoffice?: string;
}
