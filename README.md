# ✨ Encurtador de Links

Este projeto é um **encurtador de links** que cria URLs curtas com validade automática de **7 dias**. Ele utiliza **Node.js + TypeScript + Express** no backend e **React.js + TypeScript** no frontend.

---

## Tecnologias Utilizadas

### **Backend** (API)

- Node.js (Typescript)
- Express
- Redis
- MongoDB

### **Frontend**

- React.Js (Vite + Typescript)
- Shadcn
- Axios

---

## Arquitetura do Projeto

```
/linkswift *raiz*
├── backend/
    ├── dist/
    ├── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── types/
        ├── utils/
        └── index.ts
    └── .env
├── frontend/
    ├── public/
    ├── src/
        ├── assets/
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── lib/
        ├── pages/
        ├── App.tsx
        ├── global.css
        ├── main.tsx
        └── index.html
    └── .env
```

---

## Como Rodar o Projeto

Execute este comando na **raiz** do projeto.

#### Desenvolvimento

```bash
    npm run dev
```

#### Produção

```bash
    npm run start
```

## Melhorias Futuras

- [ ] Criar um **painel administrativo** para gerenciar links.
- [ ] Implementar estatísticas de acesso de links e armazenar no **MongoDB**.
- [ ] Gerar qr code com QR code API