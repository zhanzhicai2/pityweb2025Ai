import PityAceEditor from '@/components/CodeEditor/AceEditor/index';
import React from 'react';

interface PythonAceEditorProps {
  value?: string;
  language?: string;
  theme?: string;
  tables?: string[];
  height?: number | string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  setEditor?: (editor: any) => void;
}

const PythonAceEditor: React.FC<PythonAceEditorProps> = (props) => {
  return <PityAceEditor {...props} language="python" />;
};

export default PythonAceEditor;
