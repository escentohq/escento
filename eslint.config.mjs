import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".next/**", ".vercel/**", "node_modules/**", "public/fonts/**"],
  },
];

export default eslintConfig;
