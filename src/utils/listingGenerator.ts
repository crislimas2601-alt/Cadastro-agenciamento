export interface ListingFormData {
  nomeCorretor: string;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  profissao: string;
  estadoCivil: string;
  enderecoCompleto: string;
  cep: string;
  solOrientacao: string;
  email: string;
  opcoesLazer: string;
  telefone: string;
  moveisFicam: string;
  numeroVaga: string;
}

/**
 * Gera a descrição comercial automática do imóvel com base exclusiva
 * nas respostas fornecidas pelo proprietário.
 */
export function generatePortalDescription(data: ListingFormData): string {
  const parts: string[] = [];

  // Título chamativo
  let title = 'EXCELENTE OPORTUNIDADE DE IMÓVEL';
  if (data.solOrientacao && data.solOrientacao.toLowerCase().includes('manhã')) {
    title += ' COM SOL DA MANHÃ';
  }
  parts.push(title);
  parts.push('');

  // Parágrafo do imóvel e localização
  if (data.enderecoCompleto) {
    parts.push(`Localizado em ${data.enderecoCompleto}, este imóvel reúne conforto, praticidade e ótima ventilação.`);
  }

  // Características de sol e vaga
  const caracs: string[] = [];
  if (data.solOrientacao) {
    caracs.push(`• Posição solar privilegiada: ${data.solOrientacao}`);
  }
  if (data.numeroVaga) {
    caracs.push(`• Garagem: ${data.numeroVaga}`);
  }
  if (data.moveisFicam) {
    caracs.push(`• Mobília e benfeitorias inclusas: ${data.moveisFicam}`);
  }
  if (caracs.length > 0) {
    parts.push('');
    parts.push('CARACTERÍSTICAS DO IMÓVEL:');
    parts.push(...caracs);
  }

  // Lazer
  if (data.opcoesLazer) {
    parts.push('');
    parts.push('INFRAESTRUTURA E LAZER DO CONDOMÍNIO:');
    parts.push(`• ${data.opcoesLazer}`);
  }

  // Chamada para ação do corretor
  parts.push('');
  parts.push('Agende sua visita e conheça de perto todos os detalhes.');
  if (data.nomeCorretor) {
    parts.push(`Corretor responsável: ${data.nomeCorretor}`);
  }

  return parts.join('\n');
}

/**
 * Gera o texto estruturado para o CRM da Imobiliária
 */
export function generateCrmText(data: ListingFormData): string {
  return `=== FICHA DE CAPTAÇÃO / CADASTRO CRM ===
Data de Registro: ${new Date().toLocaleDateString('pt-BR')}
Corretor Captador: ${data.nomeCorretor || 'Não informado'}

[DADOS DO PROPRIETÁRIO]
Nome Completo: ${data.nomeCompleto}
CPF: ${data.cpf}
Data de Nascimento: ${data.dataNascimento ? new Date(data.dataNascimento).toLocaleDateString('pt-BR') : 'Não informada'}
Profissão: ${data.profissao}
Estado Civil: ${data.estadoCivil}
Telefone / WhatsApp: ${data.telefone}
E-mail: ${data.email}

[DADOS DO IMÓVEL]
Endereço Completo: ${data.enderecoCompleto}
CEP de onde mora: ${data.cep}
Posição Solar: ${data.solOrientacao}
Vaga de Estacionamento: ${data.numeroVaga}
Móveis que Ficam no Imóvel: ${data.moveisFicam}
Opções de Lazer do Condomínio: ${data.opcoesLazer}
=========================================`;
}
