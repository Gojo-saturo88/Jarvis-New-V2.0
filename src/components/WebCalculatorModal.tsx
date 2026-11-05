import React, { useState } from 'react';
import { Calculator as CalcIcon, X, Delete, Equal } from 'lucide-react';
import { playSound } from '../services/soundEffects';
import { HolographicModalWrapper } from './HolographicModalWrapper';

interface WebCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebCalculatorModal: React.FC<WebCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (n: string) => {
    playSound('tick');
    setDisplay((prev) => (prev === '0' ? n : prev + n));
  };

  const handleOperator = (op: string) => {
    playSound('tick');
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    playSound('tick');
    setDisplay('0');
    setEquation('');
  };

  const handleCalculate = () => {
    playSound('success');
    try {
      const fullExpr = equation + display;
      // Sanitize input to only numbers and basic math operators
      if (!/^[0-9+\-*/. ()]+$/.test(fullExpr)) {
        setDisplay('Error');
        return;
      }
      // Safe math evaluation
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${fullExpr})`)();
      setDisplay(String(Number(result.toFixed(6))));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <HolographicModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
      maxHeight="max-h-[90vh]"
      className="holo-panel rounded-2xl flex flex-col border border-amber-500/40 shadow-2xl"
      accentColor="amber"
    >
        {/* Header */}
        <div className="p-3.5 border-b border-amber-500/20 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-stone-100 text-sm tracking-wider font-mono">
              QUANTUM COMPUTATION MATRIX // CALC
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-5 bg-stone-950/90 border-b border-stone-800 text-right">
          <div className="h-5 text-xs font-mono text-amber-400/70">{equation || ' '}</div>
          <div className="text-3xl font-mono text-amber-300 font-bold truncate tracking-wider mt-1">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-stone-950/50">
          <button
            onClick={handleClear}
            className="p-3 rounded-xl bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-900/50 font-mono font-bold text-sm cursor-pointer"
          >
            AC
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="p-3 rounded-xl bg-stone-900 text-amber-400 border border-stone-800 hover:bg-amber-500/20 font-mono font-bold text-sm cursor-pointer"
          >
            ÷
          </button>
          <button
            onClick={() => handleOperator('*')}
            className="p-3 rounded-xl bg-stone-900 text-amber-400 border border-stone-800 hover:bg-amber-500/20 font-mono font-bold text-sm cursor-pointer"
          >
            ×
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="p-3 rounded-xl bg-stone-900 text-amber-400 border border-stone-800 hover:bg-amber-500/20 font-mono font-bold text-sm cursor-pointer"
          >
            -
          </button>

          {['7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              className="p-3 rounded-xl bg-stone-900/80 text-stone-200 border border-stone-800 hover:bg-stone-800 font-mono text-base font-bold cursor-pointer"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOperator('+')}
            className="p-3 rounded-xl bg-stone-900 text-amber-400 border border-stone-800 hover:bg-amber-500/20 font-mono font-bold text-sm cursor-pointer"
          >
            +
          </button>

          {['4', '5', '6'].map((n) => (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              className="p-3 rounded-xl bg-stone-900/80 text-stone-200 border border-stone-800 hover:bg-stone-800 font-mono text-base font-bold cursor-pointer"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleCalculate}
            className="row-span-2 p-3 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-stone-950 font-mono font-black text-lg gold-glow flex items-center justify-center cursor-pointer"
          >
            <Equal className="w-6 h-6" />
          </button>

          {['1', '2', '3'].map((n) => (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              className="p-3 rounded-xl bg-stone-900/80 text-stone-200 border border-stone-800 hover:bg-stone-800 font-mono text-base font-bold cursor-pointer"
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => handleNumber('0')}
            className="col-span-2 p-3 rounded-xl bg-stone-900/80 text-stone-200 border border-stone-800 hover:bg-stone-800 font-mono text-base font-bold cursor-pointer text-center"
          >
            0
          </button>
          <button
            onClick={() => handleNumber('.')}
            className="p-3 rounded-xl bg-stone-900/80 text-stone-200 border border-stone-800 hover:bg-stone-800 font-mono text-base font-bold cursor-pointer"
          >
            .
          </button>
        </div>
    </HolographicModalWrapper>
  );
};
