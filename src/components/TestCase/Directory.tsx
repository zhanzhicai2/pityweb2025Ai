import React from 'react';

interface DirectoryProps {
  response?: any;
  caseName?: string;
  width?: number;
  modal?: boolean;
  setModal?: (modal: boolean) => void;
  single?: boolean;
}

const Directory: React.FC<DirectoryProps> = () => {
  return <div>Directory</div>;
};

export default Directory;
