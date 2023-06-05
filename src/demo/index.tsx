import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  Formula,
  arithmeticExpression,
  compileFromTestString,
  diagnose,
  tokenToString,
  Token,
  ExpressionType,
  WizardComponent,
  TokenComponent,
  CursorComponent,
  WizardUpdateReturn,
  createTokenVariable,
} from '../lib';

import './style.css';

const knownVariables = [
  { name: 'aaa', id: 'var_aaa', parameters: {} },
  { name: 'bbb', id: 'var_bbb', parameters: {} },
  { name: 'ccc', id: 'var_ccc', parameters: {} },
  { name: 'ddd', id: 'var_ddd', parameters: {} },
];

const Renderer: TokenComponent = ({ token, onReplace, updateCursor }) => {
  return (
    <span
      tabIndex={0}
      onClick={() => {
        if (token.type === 'variable') {
          onReplace({ ...token, value: { ...token.value, name: 'hahaha' } });
        } else {
          updateCursor();
        }
      }}
      className={`Renderer ${token.type} `}
    >
      {tokenToString(token)}
    </span>
  );
};

const Wizard: WizardComponent = forwardRef(({ onWizardUpdate }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        focus() {
          inputRef.current?.focus();
        },
      };
    },
    [],
  );

  function callback(e: React.SyntheticEvent | null, wur: WizardUpdateReturn) {
    if (wur?.preventDefault) {
      e?.preventDefault();
      console.log('preventing');
    }
    if (wur?.resetInput && inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="Wizard">
      <input
        onKeyDown={(event) => {
          callback(
            event,
            onWizardUpdate({
              type: 'key',
              currentText: event.currentTarget.value,
              key: event.key,
              selectionStart: event.currentTarget.selectionStart,
            }),
          );
        }}
        onChange={(event) => {
          callback(
            event,
            onWizardUpdate({
              type: 'change',
              currentText: event.currentTarget.value,
            }),
          );
        }}
        ref={inputRef}
      />
      {knownVariables.map((v) => (
        <button
          key={v.id}
          onClick={(event) => {
            callback(
              event,
              onWizardUpdate({
                type: 'insert',
                token: createTokenVariable(v),
              }),
            );
          }}
        >
          {v.name}
        </button>
      ))}
    </div>
  );
});

const Cursor: CursorComponent = ({ active, index, onClick }) => {
  return (
    <div
      onClick={onClick}
      tabIndex={0}
      className={`CursorMarker ${active ? 'active' : ''}`}
      data-cursor-index={index}
    >
      <div className="CursorMarker__cursor" />
    </div>
  );
};

const App = () => {
  const [tokens, setTokens] = useState<Token[]>(compileFromTestString('1+1'));
  const result = useMemo(() => {
    try {
      return arithmeticExpression.validate(tokens);
    } catch {
      return null;
    }
  }, [tokens]);

  return (
    <div className="app">
      <Formula
        value={tokens}
        type={ExpressionType.Inequation}
        onChange={setTokens}
        item={Renderer}
        wizard={Wizard}
        cursor={Cursor}
      />

      {result && (
        <pre className="diagnostics">
          <code>{diagnose(result)}</code>
        </pre>
      )}
    </div>
  );
};

const _root = document.getElementById('root');
if (_root)
  createRoot(_root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
