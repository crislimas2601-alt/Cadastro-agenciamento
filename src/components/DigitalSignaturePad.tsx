import React, { useRef, useState, useEffect } from 'react';
import { Eraser, CheckCircle2, PenTool } from 'lucide-react';

interface DigitalSignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
  initialSignature?: string;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  onSave,
  onClear,
  initialSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isLocked, setIsLocked] = useState(Boolean(initialSignature));

  // Inicializa o canvas com suporte para telas Retina (alta densidade de pixels)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Se já houver assinatura prévia salva
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
      return;
    }

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900 para parecer caneta esferográfica preta
  }, [initialSignature]);

  // Função auxiliar para calcular coordenadas relativas à posição do Canvas
  const getCoordinates = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      if (event.touches.length === 0) return null;
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (isLocked) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || isLocked) return;
    // Previne rolagem da tela em aparelhos celulares enquanto assina
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    setIsLocked(false);
    onClear();
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
      setIsLocked(true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <PenTool className="w-4 h-4 text-amber-600" />
          Assine na caixa abaixo (com o dedo na tela ou mouse):
        </label>
        {isLocked && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Assinatura Confirmada
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          className="w-full h-44 cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {!hasDrawn && !isLocked && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-sm">
            <span>Escreva sua assinatura aqui</span>
          </div>
        )}

        {/* Linha guia de assinatura */}
        <div className="absolute bottom-6 left-8 right-8 border-b border-slate-200 pointer-events-none" />
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Eraser className="w-3.5 h-3.5" />
          Limpar e Refazer
        </button>

        {!isLocked && hasDrawn && (
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Adotar Esta Assinatura
          </button>
        )}
      </div>
    </div>
  );
};
