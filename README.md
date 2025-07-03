# ✨ Encurtador de Links

## ✨ Visão Geral

Este projeto é um **encurtador de links** que cria URLs curtas com validade automática de **7 dias**. Ele utiliza **Node.js + TypeScript + Express** no backend e **React.js + TypeScript** no frontend.

---

## 🔍 Requisitos

### ✨ Requisitos Funcionais (RF)

- [RF-01] O usuário deve poder **encurtar URLs** enviando uma URL longa.
- [RF-02] O sistema deve **gerar um link curto** e armazená-lo por **7 dias**.
- [RF-03] O usuário deve poder **acessar a URL curta** e ser redirecionado para a original.
- [RF-04] O sistema deve remover automaticamente os links após **7 dias**, utilizando a expiração do Redis.
- [RF-05] O frontend deve permitir que o usuário **copie o link** com um botão.

### ✨ Requisitos Não Funcionais (RNF)

- [RNF-01] A API deve ser desenvolvida em **Node.js + TypeScript + Express**.
- [RNF-02] O frontend deve ser desenvolvido em **React.js + TypeScript** com **Shadcn**.
- [RNF-03] O sistema deve suportar múltiplas requisições simultâneas sem degradação de desempenho perceptível.
- [RNF-04] O backend deve utilizar **Redis** para armazenar links temporários.
- [RNF-05] O frontend deve permitir **requisições para a API via Axios**.

---

## 🏢 Tecnologias Utilizadas

### **Backend** (API)

- Node.js (JavaScript)
- Express
- Redis
- MongoDB

### **Frontend**

- React.Js (Vite)
- Shadcn
- Axios

---

## 👨‍💻 Arquitetura do Projeto

```
/linkswift
 ├── backend/
 │   ├── dist/
 │   ├── src/
 │   │   ├── config/
 │   │   ├── controllers/
 │   │   ├── middleware/
 │   │   ├── models/
 │   │   ├── routes/
 │   │   ├── types/
 │   │   ├── utils/
 │   │   └── index.ts
 │   └── .env
 ├── frontend/
 │   ├── src/
 │   │   ├── assets/
 │   │   ├── components/
 │   │   ├── hooks/
 │   │   ├── lib/
 │   │   ├── pages/
 │   │   ├── App.tsx
 │   │   ├── global.css
 │   │   ├── main.tsx
 │   │   └── vite-env.d.ts
 │   ├── .gitignore
 │   └── index.html
 └── README.md
```

---

## 🚀 Fluxo do Sistema

1. O **usuário insere uma URL** no frontend.
2. A API gera um **ID curto** e armazena o link com tempo de expiração de 7 dias.
3. A API retorna a URL curta para o frontend.
4. O frontend exibe a URL curta e permite **copiá-la**.
5. Quando alguém acessa a URL curta, o backend faz o **redirecionamento**.
6. O sistema deve remover automaticamente os links após 7 dias, utilizando a expiração do Redis.

---

## 🛠 Como Rodar o Projeto

### **1️⃣ Backend JS**

```sh
cd backend
npm install
npm run build
npm run dev
```

### **2️⃣ Frontend (React.js)**

```sh
cd frontend
npm install
npm run dev
```

---

## ✨ Melhorias Futuras

- [ ] Criar um **painel administrativo** para gerenciar links.
- [ ] Implementar estatísticas de acesso de links e armazenar no **MongoDB**.
- [ ] Gerar qr code com `http(s)://api.qrserver.com/v1/create-qr-code/?data=[URL-encoded-text]&size=[pixels]x[pixels]`

## ✅ Melhorias Implementadas

- [x] Implementar **autenticação JWT** para links exclusivos.
- [x] Melhorar **segurança** com autenticação via e-mail.