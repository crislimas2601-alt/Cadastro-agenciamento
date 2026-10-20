import { maskCpf, maskPhone, maskCep, cleanDigits } from './masks';

export interface ParsedPropertyData {
  nomeCorretor?: string;
  nomeCompleto?: string;
  cpf?: string;
  dataNascimento?: string;
  profissao?: string;
  estadoCivil?: string;
  enderecoCompleto?: string;
  cep?: string;
  solOrientacao?: string;
  email?: string;
  opcoesLazer?: string;
  telefone?: string;
  moveisFicam?: string;
  numeroVaga?: string;
}

/**
 * Analisa um texto livre (ex: copiado do WhatsApp ou anotação rápida do corretor)
 * e extrai automaticamente os campos correspondentes para os 14 itens do cadastro.
 */
export function parseFreeTextToCadastro(text: string): ParsedPropertyData {
  const result: ParsedPropertyData = {};
  const lower = text.toLowerCase();

  // 1. Extração de CPF (padrao 11 dígitos ou formatado)
  const cpfMatch = text.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
  if (cpfMatch) {
    result.cpf = maskCpf(cpfMatch[0]);
  }

  // 2. Extração de CEP (padrão 8 dígitos ou 00000-000)
  const cepMatch = text.match(/\b\d{5}-?\d{3}\b/);
  if (cepMatch) {
    result.cep = maskCep(cepMatch[0]);
  }

  // 3. Extração de Telefone/WhatsApp (padrão brasileiro com DDD)
  const phoneMatch = text.match(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}/);
  if (phoneMatch && cleanDigits(phoneMatch[0]).length >= 10) {
    result.telefone = maskPhone(phoneMatch[0]);
  }

  // 4. Extração de E-mail
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0];
  }

  // 5. Sol da manhã ou da tarde
  if (lower.includes('sol da manhã') || lower.includes('sol da manha') || lower.includes('nascente')) {
    result.solOrientacao = 'Sol da manhã';
  } else if (lower.includes('sol da tarde') || lower.includes('poente')) {
    result.solOrientacao = 'Sol da tarde';
  } else if (lower.includes('ambos') || lower.includes('passante')) {
    result.solOrientacao = 'Ambos / Indiferente';
  }

  // 6. Estado Civil
  if (lower.includes('casad')) result.estadoCivil = 'Casado(a)';
  else if (lower.includes('solteir')) result.estadoCivil = 'Solteiro(a)';
  else if (lower.includes('divorciad')) result.estadoCivil = 'Divorciado(a)';
  else if (lower.includes('união estável') || lower.includes('uniao estavel')) result.estadoCivil = 'União Estável';
  else if (lower.includes('viúv') || lower.includes('viuv')) result.estadoCivil = 'Viúvo(a)';

  // 7. Extrações linha a linha caso venha com rótulos (ex: "Nome: Carlos", "Vaga: 12", etc.)
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [rawKey, ...valParts] = trimmed.split(/[:=-]/);
    if (valParts.length > 0) {
      const key = rawKey.trim().toLowerCase();
      const val = valParts.join(':').trim();

      if (key.includes('corretor')) result.nomeCorretor = val;
      if (key.includes('nome') && !key.includes('corretor')) result.nomeCompleto = val;
      if (key.includes('profissão') || key.includes('profissao')) result.profissao = val;
      if (key.includes('endereço') || key.includes('endereco') || key.includes('rua')) result.enderecoCompleto = val;
      if (key.includes('lazer')) result.opcoesLazer = val;
      if (key.includes('móve') || key.includes('move') || key.includes('fica')) result.moveisFicam = val;
      if (key.includes('vaga') || key.includes('garagem') || key.includes('estacionamento')) result.numeroVaga = val;
      if (key.includes('nasciment') || key.includes('data')) {
        // Tenta converter DD/MM/AAAA para AAAA-MM-DD
        const dateMatch = val.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
        if (dateMatch) {
          result.dataNascimento = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }
      }
    }
  }

  return result;
}
