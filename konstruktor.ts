import { KonstruktorConfig } from '@myua/konstruktor';

const conf: KonstruktorConfig = {
  entrypoints: [
    {
      entryPoints: ['src/demo/index.tsx'],
      filename: 'index.html',
      title: 'formula',
    },
  ],
};

export default conf;
