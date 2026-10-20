export interface FullCadastroData {
  // Metadados do Corretor / Torresul
  codigoImovel?: string;
  nomeCorretor: string;

  // DADOS DO PROPRIETÁRIO (PDF 1 + PDF 2)
  isPessoaJuridica: boolean;
  razaoSocial?: string;
  cnpj?: string;
  nomeCompleto: string; // Proprietário(a)*
  cpf: string;
  dataNascimento: string;
  profissao: string;
  estadoCivil: string;
  email: string;
  telefone: string; // Celular
  telefoneSecundario?: string;
  cepOndeMora: string; // CEP de onde mora?*
  enderecoProprietario: string; // Endereço residencial completo
  numeroProprietario: string;
  bairroProprietario: string;
  cidadeProprietario: string;

  // DADOS DO IMÓVEL (PDF 1 + PDF 2)
  enderecoImovelMesmo: boolean;
  tipoImovel: string; // Casa, Apartamento, Sobrado, Terreno, etc.
  metragemPrivativa: string;
  enderecoImovel: string;
  numeroImovel: string;
  bairroImovel: string;
  cidadeImovel: string;
  loteamentoCondominio: string;
  numeroIncorporacao?: string;
  numeroMatricula?: string;

  // Perguntas do Google Form incorporadas
  solOrientacao: string; // Sol da manhã ou da tarde?*
  numeroVaga: string; // Numero da vaga de estacionamento?*
  moveisFicam: string; // Moveis que ficam no imóvel?*
  opcoesLazerDescricao: string; // Opções de Lazer?*

  // Situação do Imóvel (Checkboxes do PDF 2)
  imovelLocado: boolean;
  imovelAverbado: boolean;
  valorCondominio: string; // Condomínio R$
  exclusividade: boolean; // Exclusividade SIM ou NÃO
  aceitaFgts: boolean;
  terrenoEscriturado: boolean;
  aceitaFinanciamento: boolean;
  imovelQuitado: boolean;
  mobiliaStatus: 'Mobiliado' | 'Semi Mobiliado' | 'Sem Mobília' | '';
  condicaoImovel: 'Imóvel Novo' | 'Imóvel Usado' | '';

  // Características / Estrutura / Acabamentos (Checkboxes PDF 2)
  dormitoriosQtd: string;
  suitesQtd: string;
  caracteristicas: string[];

  // NEGOCIAÇÃO (PDF 2)
  valorAnuncio: string;
  margemNegociacao?: string;
  valorAvaliacaoBanco?: string;
  condicaoPagamento?: string;
  permutaImovel: boolean;
  permutaTerreno: boolean;
  permutaCarro: boolean;
  saldoDevedor?: string;
  breveDescricao?: string; // Pontos de referência, pontos fortes, peculiaridades
  observacoes?: string;

  // CONDIÇÕES GERAIS CRECI TORRESUL
  comissaoPercentual: number; // padrão 6%
  assinaturaDigitalUrl?: string;
  assinadoEm?: string;

  // BANCO DE DADOS & BACK OFFICE TORRESUL
  id?: string;
  status?: 'pendente' | 'conferido';
  criadoEm?: string;
  conferidoPor?: string;
  conferidoEm?: string;
}

export const LISTA_CARACTERISTICAS = [
  'Dormitórios',
  'Suítes',
  'Closet',
  'Lavabo',
  'Banheiro social',
  'Sala de estar',
  'Cozinha',
  'Sala e cozinha integradas',
  'Sacada simples',
  'Sacada com churrasqueira',
  'Churrasqueira',
  'Área de festas',
  'Salão de festas',
  'Piscina',
  'Varanda',
  'Mezanino',
  'Porão',
  'Despensa',
  'Dependência de empregada',
  'Lareira',
  'Garagem Coberta',
  'Garagem',
  'Portão eletrônico',
  'Elevador',
  'Playground',
  'Quadra esportiva',
  'Academia',
  'Sala de jogos',
  'Portaria 24h',
  'Piso cerâmico',
  'Porcelanato',
  'Laminado',
  'Gesso',
  'Massa corrida',
  'Cal fino',
  'Preparação para split',
  'Pr. Aquecedor',
  'Espaço de terreno',
  'Passagem lateral',
];
