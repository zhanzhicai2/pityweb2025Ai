import 'ace-builds';
import 'ace-builds/src-noconflict/ext-language_tools';
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-spellcheck';
import 'ace-builds/src-noconflict/mode-json';
import React, { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import './MaterialOneDark';

interface JSONAceEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: number | string;
  readOnly?: boolean;
  theme?: string;
  tables?: string[];
  setEditor?: (editor: any) => void;
}

const JSONAceEditor: React.FC<JSONAceEditorProps> = ({
  value,
  onChange,
  height,
  readOnly,
  theme,
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
      mode="json"
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
        useWorker: true,
      }}
    />
  );
};

export default JSONAceEditor;
