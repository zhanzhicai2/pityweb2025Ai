import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight-ssr';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import { Viewer } from '@bytemd/react';
import 'bytemd/dist/index.min.css';
import 'highlight.js/styles/atom-one-dark.css';

const plugins = [gfm(), highlight(), mediumZoom()];

interface MarkdownViewerProps {
  value: string;
  setValue?: (v: string) => void;
}

const Markdown: React.FC<MarkdownViewerProps> = ({ value }) => {
  return <Viewer value={value} plugins={plugins} />;
};

export default Markdown;
