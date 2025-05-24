📦 Gerenciamento de Conexão

| Ação                      | Comando/Exemplo                                                      |
| ------------------------- | -------------------------------------------------------------------- |
| Conectar ao MongoDB       | mongoose.connect('mongodb://localhost:27017/nomeDoBanco')            |
| Verificar conexão         | mongoose.connection.readyState (0: desconectado, 1: conectado, etc.) |
| Lidar com eventos de erro | mongoose.connection.on('error', console.error)                       |
| Fechar conexão            | await mongoose.disconnect()                                          |

📘 Definição de Modelos e Esquemas

| Ação                        | Comando/Exemplo                                                       |
| --------------------------- | --------------------------------------------------------------------- |
| Criar esquema               | const UserSchema = new mongoose.Schema({ name: String, age: Number }) |
| Criar modelo                | const User = mongoose.model('User', UserSchema)                       |
| Usar interface (TypeScript) | interface IUser extends Document { name: string; age: number }        |

📝 CRUD - Operações Básicas

| Ação                | Comando/Exemplo                                              |
| ------------------- | ------------------------------------------------------------ |
| Criar documento     | const user = await User.create({ name: 'Eduardo', age: 22 }) |
| Buscar todos        | const users = await User.find()                              |
| Buscar por ID       | const user = await User.findById(id)                         |
| Buscar com filtro   | const user = await User.findOne({ name: 'Eduardo' })         |
| Atualizar documento | await User.findByIdAndUpdate(id, { age: 23 }, { new: true }) |
| Remover documento   | await User.findByIdAndDelete(id)                             |

🔧 Outros Comandos Úteis

| Ação                          | Comando/Exemplo                                         |
| ----------------------------- | ------------------------------------------------------- |
| Verificar se documento existe | const exists = await User.exists({ name: 'Eduardo' })   |
| Contar documentos             | const count = await User.countDocuments()               |
| Adicionar timestamps          | new mongoose.Schema({ ... }, { timestamps: true })      |
| Populando referência          | const post = await Post.findById(id).populate('author') |

💡 Dicas

* Sempre use try/catch com await para capturar erros de banco.
* Use lean() em queries de leitura para melhorar performance: User.find().lean()