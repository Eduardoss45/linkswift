# To-Do List para Sistema de Registro com Verificação por Código

## Backend

- [x] Configurar servidor Node.js com Express (ou framework de sua escolha)
- [x] Configurar banco de dados para armazenar usuários (com status: pendente/verificado)
- [x] Criar modelo/entidade de Usuário com campos:
  - email
  - senha (hash)
  - status (ex: "pendente", "verificado")
  - código de verificação (token numérico ou string)
- [x] Implementar endpoint de registro:
  - Receber dados do usuário
  - Validar formato do e-mail e dados obrigatórios
  - Gerar código de verificação aleatório
  - Salvar usuário com status "pendente" e código
  - Enviar e-mail com o código usando Nodemailer
- [x] Implementar endpoint de verificação do código:
  - Receber e-mail + código enviado pelo usuário
  - Verificar se código confere e ainda é válido
  - Atualizar status do usuário para "verificado"
- [x] Implementar endpoint de login:
  - Receber e-mail e senha
  - Verificar se usuário existe e está "verificado"
  - Validar senha (comparar hash)
  - Gerar token JWT (ou outra estratégia de autenticação)
- [ ] Implementar endpoint para reenviar código de verificação (caso necessário)
- [ ] Configurar tratamento de erros (ex: código inválido, usuário não verificado) <!-- ? Isso é algo que farei no final do projeto -->

## Frontend (React + TypeScript)

- [x] Criar formulário de registro (input: e-mail, senha, etc)
- [x] Criar formulário para inserir código de verificação
- [x] Criar formulário de login
- [ ] Implementar chamadas API para:
  - Registrar usuário (envia dados)
  - Verificar código (envia e-mail + código)
  - Login (envia e-mail + senha)
- [x] Implementar estados da UI para:
  - Mostrar mensagens de erro (ex: código errado, login inválido)
  - Mostrar loading durante requisições
  - Redirecionar usuário após ações (ex: login bem-sucedido)
- [ ] Implementar fluxo:
  - Após registro, redirecionar para tela de código
  - Após verificação bem-sucedida, liberar acesso ao login
  - Após login, redirecionar para dashboard ou área privada
- [ ] Implementar opção para reenviar código

## Configuração do E-mail (Nodemailer)

- [x] Configurar transporte SMTP (ex: Gmail, SendGrid, outro)
- [ ] Criar template simples para o e-mail com o código
- [x] Testar envio do e-mail manualmente
- [ ] Garantir segurança e evitar spam (ex: uso de domínio confiável, SPF, DKIM)

## Segurança

- [x] Hash das senhas com bcrypt ou similar
- [ ] Validação dos inputs para evitar injeção e ataques
- [ ] Implementar limite de tentativas para verificação do código e login
- [ ] Utilizar HTTPS para proteger requisições

## Testes

- [ ] Testar fluxo completo do registro até login
- [ ] Testar casos de erro (código inválido, usuário já verificado, login errado)
- [ ] Testar envio de e-mails e recepção pelo usuário