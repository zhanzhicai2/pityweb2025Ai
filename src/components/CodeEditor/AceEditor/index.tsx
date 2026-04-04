import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-yaml';
import React, { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import '../themes/VsDark';
import './AtomOneDark';
import './editor.less';
import './MaterialOneDark';

interface PityAceEditorProps {
  value?: string;
  language?: string;
  onChange?: (value: string) => void;
  height?: number | string;
  readOnly?: boolean;
  theme?: string;
  useWorker?: boolean;
  tables?: string[];
  setEditor?: (editor: any) => void;
}

const PityAceEditor: React.FC<PityAceEditorProps> = ({
  value,
  language,
  onChange,
  height,
  readOnly,
  theme,
  useWorker,
  tables,
  setEditor,
}) => {
  const aceRef = useRef<any>(null);

  useEffect(() => {
    setEditor?.(aceRef.current);
    addCompleter({
      getCompletions: (_editor: any, _session: any, _pos: any, prefix: any, callback: any) => {
        callback(
          null,
          (tables || []).map((v: string) => ({
            name: v,
            value: v,
          })),
        );
      },
    });
  }, [tables, setEditor]);

  return (
    <AceEditor
      ref={aceRef}
      mode={language || 'json'}
      theme={theme || 'material-one-dark'}
      fontSize={14}
      showGutter
      showPrintMargin={false}
      onChange={onChange}
      value={value}
      wrapEnabled
      highlightActiveLine
      enableSnippets
      style={{ width: '100%', height: height || 300 }}
      setOptions={{
        readOnly: readOnly || false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 4,
        useWorker: useWorker === undefined ? false : useWorker,
      }}
    />
  );
};

export default PityAceEditor;
