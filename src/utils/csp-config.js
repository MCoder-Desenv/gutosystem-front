// utils/csp-config.js
export const cspConfig = `
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  connect-src 'self' http://localhost:3000 https://backendgutosystem.eadescola.online https://viacep.com.br https://gutosystem.eadescola.online;
  style-src 'self' 'unsafe-inline';
`;
