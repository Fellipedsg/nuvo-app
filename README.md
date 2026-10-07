# Nuvo

Protótipo navegável do app **Nuvo** (gestão financeira pessoal): onboarding, cadastro com verificação, dashboard, análise de gastos, cartões, agenda de contas e nova transação. Feito em React Native (Expo), com uma API simulada dentro do próprio app.

**Acesse:** https://fellipedsg.github.io/nuvo-app/

No protótipo, o login já vem preenchido (é só tocar em **Entrar**), o código de verificação é `123456` e os dados voltam ao original ao recarregar a página. Todos os dados são fictícios.

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
git clone https://github.com/Fellipedsg/nuvo-app.git
cd nuvo-app
npm install
EXPO_PUBLIC_DEMO=1 npx expo start --web
```

Para gerar a versão publicada: `npm run build` (saída em `dist/`).
