import React from 'react';
import { FullCadastroData } from '../types/authorization';
import { Printer, ArrowLeft, Share2 } from 'lucide-react';

interface TorresulPrintDocumentProps {
  data: FullCadastroData;
  onBack: () => void;
  onUpdateCodigo?: (codigo: string) => void;
}

export const TorresulPrintDocument: React.FC<TorresulPrintDocumentProps> = ({
  data,
  onBack,
  onUpdateCodigo,
}) => {
  const [codigo, setCodigo] = React.useState(data.codigoImovel || '');

  const handlePrint = () => {
    window.print();
  };

  const handleCodigoChange = (newVal: string) => {
    setCodigo(newVal);
    if (onUpdateCodigo) {
      onUpdateCodigo(newVal);
    }
  };

  const hoje = new Date();
  const dia = hoje.getDate();
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesNome = meses[hoje.getMonth()];
  const ano = hoje.getFullYear();

  const isChecked = (item: string) => data.caracteristicas.includes(item);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      
      {/* Barra de Ações - Oculta ao Imprimir */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Formulário
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-700">Código do Imóvel (Uso Interno Imobiliária):</span>
            <input
              type="text"
              value={codigo}
              onChange={(e) => handleCodigoChange(e.target.value)}
              placeholder="ex: AP-104"
              className="border border-slate-300 rounded px-2 py-0.5 font-mono text-xs w-24 uppercase focus:outline-none focus:border-slate-800 bg-white"
            />
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF (A4)
          </button>
        </div>
      </div>

      {/* Documento Imprimível A4 (Exatamente como no PDF da Torresul) */}
      <div className="printable-document max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 leading-tight text-xs font-sans">
        
        {/* ================= PÁGINA 1 ================= */}
        <div>
          {/* Cabeçalho Torresul */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="font-black text-xl tracking-tight text-red-600 uppercase flex items-center gap-1">
                <span className="text-2xl font-black">🏢</span>
                <span>TORRESUL</span>
                <span className="text-slate-800 text-xs font-semibold block ml-1 tracking-normal">IMOBILIÁRIA</span>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-600 leading-snug">
              <p>Rua Pérola do Vale nº 111 sala 101 – Itoupava Central – CEP: 89062-212</p>
              <p>CRECI 4218J · Fone: (47) 3285-8252 · (47) 9.8811-7788</p>
              <p className="font-semibold text-slate-800">www.torresulimobiliaria.com.br</p>
            </div>
          </div>

          {/* Título e Código */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-black uppercase tracking-wide text-slate-900">
              AUTORIZAÇÃO DE VENDA DE IMÓVEL
            </h1>
            <div className="border border-slate-900 px-3 py-1 text-center font-mono text-xs min-w-28">
              <span className="text-[9px] block uppercase text-slate-500 font-sans">CÓDIGO DO IMÓVEL Nº</span>
              <span className="font-bold">{codigo || '_______'}</span>
            </div>
          </div>

          {/* DADOS DO PROPRIETÁRIO */}
          <div className="mb-4">
            <h2 className="font-black text-[11px] uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-2">
              DADOS DO PROPRIETÁRIO:
            </h2>

            <div className="space-y-1.5 text-[11px]">
              {data.isPessoaJuridica && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <span className="font-semibold">Razão Social*:</span> {data.razaoSocial || '__________________'}
                  </div>
                  <div>
                    <span className="font-semibold">CNPJ*:</span> {data.cnpj || '__________________'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <span className="font-semibold">Proprietário(a)*:</span> <span className="font-bold">{data.nomeCompleto}</span>
                </div>
                <div>
                  <span className="font-semibold">CPF*:</span> <span className="font-mono">{data.cpf}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="font-semibold">Data Nasc.*:</span> {data.dataNascimento ? new Date(data.dataNascimento).toLocaleDateString('pt-BR') : '__________'}
                </div>
                <div>
                  <span className="font-semibold">Profissão*:</span> {data.profissao || '__________'}
                </div>
                <div>
                  <span className="font-semibold">Estado Civil*:</span> {data.estadoCivil || '__________'}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <span className="font-semibold">Endereço Residência*:</span> {data.enderecoProprietario}
                </div>
                <div>
                  <span className="font-semibold">nº*:</span> {data.numeroProprietario}
                </div>
                <div>
                  <span className="font-semibold">Bairro*:</span> {data.bairroProprietario}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="font-semibold">CEP de onde mora*:</span> <span className="font-mono">{data.cepOndeMora}</span>
                </div>
                <div>
                  <span className="font-semibold">Celular/WhatsApp*:</span> <span className="font-mono font-bold">{data.telefone}</span>
                </div>
                <div>
                  <span className="font-semibold">E-mail:</span> {data.email || 'Não informado'}
                </div>
              </div>

              {data.nomeCorretor && (
                <div className="text-[10px] text-slate-500 pt-0.5">
                  <span className="font-semibold text-slate-700">Corretor Captador:</span> {data.nomeCorretor}
                </div>
              )}
            </div>
          </div>

          {/* DADOS DO IMÓVEL */}
          <div className="mb-4">
            <h2 className="font-black text-[11px] uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-2">
              DADOS DO IMÓVEL:
            </h2>

            <div className="space-y-1.5 text-[11px]">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <span className="font-semibold">Tipo do imóvel:</span> {data.tipoImovel || 'Não informado'}
                </div>
                <div>
                  <span className="font-semibold">Metragem privativa:</span> {data.metragemPrivativa || '______'} m²
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <span className="font-semibold">Endereço:</span> {data.enderecoImovel}
                </div>
                <div>
                  <span className="font-semibold">nº:</span> {data.numeroImovel}
                </div>
                <div>
                  <span className="font-semibold">Bairro:</span> {data.bairroImovel}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="font-semibold">Loteamento/Condomínio:</span> {data.loteamentoCondominio || '__________'}
                </div>
                <div>
                  <span className="font-semibold">Cidade:</span> {data.cidadeImovel || 'Blumenau/SC'}
                </div>
                <div>
                  <span className="font-semibold">Nº da Matrícula*:</span> {data.numeroMatricula || '__________'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <span className="font-semibold">Sol da manhã ou da tarde?*:</span> <strong className="text-slate-900">{data.solOrientacao}</strong>
                </div>
                <div>
                  <span className="font-semibold">Nº da vaga de estacionamento?*:</span> <strong className="text-slate-900">{data.numeroVaga}</strong>
                </div>
              </div>

              <div>
                <span className="font-semibold">Móveis que ficam no imóvel?*:</span> {data.moveisFicam || 'Nenhum declarado'}
              </div>

              <div>
                <span className="font-semibold">Opções de Lazer?*:</span> {data.opcoesLazerDescricao || 'Conforme condomínio'}
              </div>
            </div>
          </div>

          {/* QUADRO DE SITUAÇÃO / CHECKBOXES (PDF 2) */}
          <div className="mb-4 bg-slate-50 p-2.5 rounded border border-slate-300">
            <div className="grid grid-cols-4 gap-x-2 gap-y-1.5 text-[10px]">
              <label className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                  {data.imovelLocado ? 'X' : ''}
                </span>
                <span>Imóvel Locado</span>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                  {data.imovelAverbado ? 'X' : ''}
                </span>
                <span>Imóvel Averbado</span>
              </label>

              <div className="flex items-center gap-1">
                <span>Condomínio R$:</span>
                <span className="font-bold font-mono">{data.valorCondominio || '______'}</span>
              </div>

              <label className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                  {data.exclusividade ? 'X' : ''}
                </span>
                <span>Exclusividade</span>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                  {data.aceitaFgts ? 'X' : ''}
                </span>
                <span>Aceita FGTS</span>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                  {data.terrenoEscriturado ? 'X' : ''}
                </span>
                <span>Terreno/lote escriturado</span>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                  {data.aceitaFinanciamento ? 'X' : ''}
                </span>
                <span>Aceita Financiamento</span>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                  {data.imovelQuitado ? 'X' : ''}
                </span>
                <span>Imóvel Quitado</span>
              </label>

              <div className="col-span-2 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                    {data.mobiliaStatus === 'Mobiliado' ? 'X' : ''}
                  </span>
                  Mobiliado
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                    {data.mobiliaStatus === 'Semi Mobiliado' ? 'X' : ''}
                  </span>
                  Semi Mobiliado
                </span>
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                    {data.condicaoImovel === 'Imóvel Novo' ? 'X' : ''}
                  </span>
                  Imóvel Novo
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold border border-slate-900 w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-white">
                    {data.condicaoImovel === 'Imóvel Usado' ? 'X' : ''}
                  </span>
                  Imóvel Usado
                </span>
              </div>
            </div>
          </div>

          {/* AS 3 COLUNAS DE ITENS E CARACTERÍSTICAS (Exatamente igual ao PDF 2) */}
          <div className="mb-4">
            <h3 className="font-black text-[10px] uppercase tracking-wider mb-1.5 text-slate-700">
              CARACTERÍSTICAS E ITENS DO IMÓVEL:
            </h3>

            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[10px] border-t border-b border-slate-200 py-2">
              {/* Coluna 1 */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between pr-2">
                  <span className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {isChecked('Dormitórios') ? 'X' : ''}
                    </span>
                    Dormitórios
                  </span>
                  {data.dormitoriosQtd && <span className="font-bold">({data.dormitoriosQtd})</span>}
                </div>
                {['Closet', 'Lavabo', 'Área de festas', 'Piscina', 'Varanda', 'Sala de estar', 'Cozinha', 'Mezanino', 'Portão eletrônico', 'Elevador', 'Playground', 'Quadra esportiva'].map((item) => (
                  <div key={item} className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {isChecked(item) ? 'X' : ''}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Coluna 2 */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between pr-2">
                  <span className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {isChecked('Suítes') ? 'X' : ''}
                    </span>
                    Suítes
                  </span>
                  {data.suitesQtd && <span className="font-bold">({data.suitesQtd})</span>}
                </div>
                {['Porão', 'Banheiro social', 'Churrasqueira', 'Lareira', 'Sacada com churrasqueira', 'Sala e cozinha integradas', 'Despensa', 'Dependência de empregada', 'Garagem', 'Salão de festas', 'Academia', 'Sala de jogos'].map((item) => (
                  <div key={item} className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {isChecked(item) ? 'X' : ''}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Coluna 3 */}
              <div className="space-y-0.5">
                {['Piso cerâmico', 'Laminado', 'Cal fino', 'Espaço de terreno', 'Preparação para split', 'Porcelanato', 'Gesso', 'Massa corrida', 'Pr. Aquecedor', 'Garagem Coberta', 'Sacada simples', 'Portaria 24h', 'Passagem lateral'].map((item) => (
                  <div key={item} className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {isChecked(item) ? 'X' : ''}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NEGOCIAÇÃO */}
          <div className="mb-6">
            <h2 className="font-black text-[11px] uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-2">
              NEGOCIAÇÃO:
            </h2>

            <div className="space-y-1.5 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Valor do imóvel para anúncio:</span> <strong className="font-mono text-slate-900">{data.valorAnuncio || 'A combinar'}</strong>
                </div>
                <div>
                  <span className="font-semibold">Margem NEG:</span> {data.margemNegociacao || '________'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Valor de avaliação Banco:</span> {data.valorAvaliacaoBanco || '________'}
                </div>
                <div>
                  <span className="font-semibold">Condição:</span> {data.condicaoPagamento || 'À vista / Financiamento'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Aceita Permuta:</span>
                  <span className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {data.permutaImovel ? 'X' : ''}
                    </span>
                    Imóvel
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {data.permutaTerreno ? 'X' : ''}
                    </span>
                    Terreno
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="border border-slate-900 w-3 h-3 flex items-center justify-center text-[9px] font-bold">
                      {data.permutaCarro ? 'X' : ''}
                    </span>
                    Carro
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Saldo devedor:</span> {data.saldoDevedor || 'Quitado'}
                </div>
              </div>

              {data.observacoes && (
                <div>
                  <span className="font-semibold">Observações:</span> {data.observacoes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quebra de página para impressão formal de 2 páginas */}
        <div className="print:break-before-page pt-6 border-t-2 border-slate-300 print:border-none">
          
          {/* Cabeçalho Página 2 */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-4">
            <div className="font-black text-lg tracking-tight text-red-600 uppercase flex items-center gap-1">
              <span>TORRESUL</span>
              <span className="text-slate-800 text-xs font-semibold block ml-1 tracking-normal">IMOBILIÁRIA</span>
            </div>
            <div className="text-right text-[10px] text-slate-600 leading-snug">
              <p>CRECI 4218J · Fone: (47) 3285-8252 · www.torresulimobiliaria.com.br</p>
            </div>
          </div>

          {/* BREVE DESCRIÇÃO */}
          <div className="mb-4">
            <h2 className="font-black text-[11px] uppercase tracking-wider mb-1">
              BREVE DESCRIÇÃO DO IMÓVEL: (Pontos de referência, pontos fortes, peculiaridades, etc)
            </h2>
            <div className="p-3 bg-slate-50 border border-slate-300 rounded text-[11px] italic min-h-16">
              {data.breveDescricao || 'Imóvel residencial com excelente localização e infraestrutura.'}
            </div>
          </div>

          {/* CONDIÇÕES GERAIS (As 9 Cláusulas Oficiais da Torresul) */}
          <div className="mb-6 space-y-2 text-[10px] leading-relaxed text-slate-800">
            <h2 className="font-black text-[11px] uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-2">
              CONDIÇÕES GERAIS:
            </h2>

            <p>
              Pelo presente instrumento autorizo a <strong>TORRESUL IMOBILIÁRIA LTDA ME CRECI 4218 J</strong> estabelecida na Rua Pérola do Vale nº 111, sala 101, bairro Itoupava Central, Blumenau – SC, aqui denominada simplesmente outorgada, a promover a venda de minha propriedade em referência pelo preço e condições acima estipulado, obedecendo as seguintes cláusulas:
            </p>

            <p>
              <strong>I –</strong> Esta autorização tem validade por prazo indeterminado até que o proprietário se manifeste em contrário;
            </p>

            <p>
              <strong>II –</strong> Durante a vigência desta autorização compromete-se o proprietário a respeitar em caráter de EXCLUSIVIDADE <strong>{data.exclusividade ? '*( X ) SIM*' : '*( X ) NÃO EXCLUSIVIDADE*'}</strong>.
            </p>

            <p>
              <strong>III –</strong> O proprietário pagará a título de honorários pela intermediação do negócio o equivalente a <strong>{data.comissaoPercentual || 6}%</strong> ({data.comissaoPercentual === 5 ? 'cinco por cento' : 'seis por cento'}) sobre o preço da venda efetuada.
            </p>

            <p>
              <strong>IV –</strong> A remuneração será devida sempre que a venda se concretize com a participação do comprador apresentada pela outorgada ou nos casos que comprovadamente a negociação tiver sido por esta indicada.
            </p>

            <p>
              <strong>V –</strong> Nos casos de EXCLUSIVIDADE e na vigência desta autorização, poderão os proprietários desistir da venda ora autorizada, desde que paguem ao outorgado a remuneração consignada na cláusula III. No caso de arrependimento de proposta já efetivada, além do ônus acima citado os proprietários ficarão sujeitos à devolução do sinal recebido devidamente corrigido.
            </p>

            <p>
              <strong>VI –</strong> A outorgada fica desde já autorizada pelo proprietário a anunciar nos meios de comunicação, fixar placas e faixas e divulgar o imóvel em mídias sociais.
            </p>

            <p>
              <strong>VII –</strong> O proprietário declara que o imóvel objeto desta autorização de venda não possui nenhum ônus pessoal, ou reipersecutório, além do aqui mencionado, despesas condominiais e taxas de qualquer natureza já estão quites até a presente data.
            </p>

            <p>
              <strong>VIII –</strong> O PROPRIETÁRIO do imóvel está ciente de que a divulgação do mesmo com fotos, descrição e envio para as mídias sociais e demais canais de comunicação internos (site, e-mails) da Torresul, somente serão efetivados após a entrega completa da documentação necessária, indicada pelo seu agenciador.
            </p>

            <p>
              <strong>IX –</strong> As partes elegem o foro da comarca de <strong>Blumenau/SC</strong> para dirimir qualquer dúvida relacionada ao presente contrato, renunciando a qualquer outro por mais privilegiado que seja.
            </p>

            <p className="pt-2 font-semibold">
              E por estarem assim, justos e contratados, as partes assinam o presente contrato.
            </p>
          </div>

          {/* Data e Assinatura */}
          <div className="pt-4 text-center text-xs">
            <p className="mb-6">
              Blumenau, {dia} de {mesNome} de {ano}.
            </p>

            <div className="max-w-xs mx-auto text-center">
              {data.assinaturaDigitalUrl ? (
                <div className="h-20 flex items-center justify-center">
                  <img
                    src={data.assinaturaDigitalUrl}
                    alt="Assinatura"
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-16 border-b border-slate-400 mb-1 flex items-end justify-center text-slate-400 italic text-[11px]">
                  Assinado Digitalmente
                </div>
              )}
              <div className="border-t border-slate-900 pt-1">
                <p className="font-bold text-slate-900">{data.nomeCompleto || 'Proprietário(a)'}</p>
                <p className="text-[10px] text-slate-600 font-mono">CPF: {data.cpf}</p>
                {data.assinadoEm && (
                  <p className="text-[9px] text-emerald-700 font-mono mt-0.5">
                    Assinatura eletrônica autenticada em {new Date(data.assinadoEm).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[9px] text-slate-400 italic mt-6">
              Obs: A assinatura do proprietário deverá ser conforme documento com foto ou digital (gov, certificado ou plataforma).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
