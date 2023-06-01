import { KonstruktorConfig } from "@myua/konstruktor";

const conf: KonstruktorConfig = {
  entrypoints: [
    {
      entryPoints: ["index.tsx"],
      filename: "index.html",
      title: "formula",
    },
  ],
};

export default conf;
