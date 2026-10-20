/**
 * Serviço de Integração com a API ViaCEP
 * 
 * Conceito didático de Engenharia de Software:
 * Uma API externa (Application Programming Interface) nos permite consultar
 * dados em tempo real na internet. Aqui, quando o usuário digita 8 números de CEP,
 * fazemos uma requisição HTTP assíncrona (fetch) para a API pública dos Correios (ViaCEP)
 * e preenchemos rua, bairro, cidade e estado automaticamente, economizando tempo
 * do proprietário e evitando erros de digitação!
 */

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!response.ok) {
      throw new Error('Falha ao consultar CEP');
    }
    const data = await response.json();
    if (data.erro) {
      return null;
    }
    return data as ViaCepResponse;
  } catch (error) {
    console.error('Erro na requisição ViaCEP:', error);
    return null;
  }
}
