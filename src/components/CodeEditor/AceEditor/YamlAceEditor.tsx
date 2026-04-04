import PityAceEditor from '@/components/CodeEditor/AceEditor/index';
import React from 'react';

interface YamlAceEditorProps {
  value?: string;
  language?: string;
  theme?: string;
  tables?: string[];
  height?: number | string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  setEditor?: (editor: any) => void;
}

const YamlAceEditor: React.FC<YamlAceEditorProps> = (props) => {
  return <PityAceEditor {...props} language="yaml" theme={props.theme || 'vs-dark'} />;
};

export default YamlAceEditor;
