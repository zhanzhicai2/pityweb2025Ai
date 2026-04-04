import PityAceEditor from '@/components/CodeEditor/AceEditor/index';
import React from 'react';

interface SqlAceEditorProps {
  value?: string;
  language?: string;
  theme?: string;
  tables?: string[];
  height?: number | string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  setEditor?: (editor: any) => void;
}

const SqlAceEditor: React.FC<SqlAceEditorProps> = (props) => {
  return <PityAceEditor {...props} theme={props.theme || 'material-one-dark'} />;
};

export default SqlAceEditor;
