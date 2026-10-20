import React, { useRef } from 'react';
import { AttachedDocument } from '../types/checklist';
import {
  Upload,
  FileCheck,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface DocumentUploadItemProps {
  itemKey: string;
  label: string;
  description?: string;
  document?: AttachedDocument;
  canRequestFromDespachante?: boolean;
  extraInputPlaceholder?: string;
  extraInputValue?: string;
  onExtraInputChange?: (val: string) => void;
  onUpload: (fileData: { name: string; size: number; type: string; dataUrl: string }) => void;
  onRequestDespachante?: () => void;
  onRemove: () => void;
  isOptional?: boolean;
}

export const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({
  itemKey,
  label,
  description,
  document,
  canRequestFromDespachante,
  extraInputPlaceholder,
  extraInputValue,
  onExtraInputChange,
  onUpload,
  onRequestDespachante,
  onRemove,
  isOptional,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converte o arquivo para Base64 para armazenar no IndexedDB e permitir download pelo Back Office
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpload({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
    // Limpa o input para permitir anexar o mesmo arquivo novamente caso queira
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (!document?.dataUrl) return;
    const a = window.document.createElement('a');
    a.href = document.dataUrl;
    a.download = document.name || 'documento';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const isAnexado = document?.status === 'anexado';
  const isSolicitar = document?.status === 'solicitar_despachante';

  return (
    <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        
        {/* Identificação do Documento */}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{label}</span>
            {isOptional && (
              <span className="text-[10px] text-slate-400 font-medium">(Opcional / Se houver)</span>
            )}
            
            {/* Status Visual */}
            {isAnexado && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <FileCheck className="w-3 h-3 text-emerald-600" /> Anexado
              </span>
            )}

            {isSolicitar && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                Solicitar via Despachante
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          )}

          {/* Campo extra (ex: Número da matrícula para o despachante solicitar) */}
          {canRequestFromDespachante && isSolicitar && extraInputPlaceholder && (
            <div className="pt-2">
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Número da Matrícula para o Despachante emitir:
              </label>
              <input
                type="text"
                value={extraInputValue || ''}
                onChange={(e) => onExtraInputChange && onExtraInputChange(e.target.value)}
                placeholder={extraInputPlaceholder}
                className="w-full sm:w-2/3 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
              />
            </div>
          )}
        </div>

        {/* Ações de Upload / Seleção */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="hidden"
          />

          {isAnexado ? (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
              <div className="text-left">
                <span className="text-xs font-medium text-slate-800 block truncate max-w-[140px] sm:max-w-[180px]">
                  {document.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatFileSize(document.size)}
                </span>
              </div>

              {document.dataUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Baixar arquivo anexado"
                  className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onRemove}
                title="Remover anexo"
                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                Anexar Arquivo
              </button>

              {canRequestFromDespachante && !isSolicitar && onRequestDespachante && (
                <button
                  type="button"
                  onClick={onRequestDespachante}
                  className="px-2.5 py-1.5 text-blue-700 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Não tenho em mãos (solicitar)
                </button>
              )}

              {isSolicitar && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1.5"
                >
                  Cancelar solicitação
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
