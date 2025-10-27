import { Schema, model } from 'mongoose';
import { LinkDocument } from '../types/types';

const LinkSchema = new Schema<LinkDocument>({
  key: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  criado_por: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  senha: { type: String, default: null },
  privado: { type: Boolean, default: false },
  expira_em: { type: Date, default: null },
  analytics: {
    total_clicks: { type: Number, default: 0 },
    clicks_por_dia: [{ data: String, quantidade: Number }],
    ultimos_ips: [String],
  },
  criado_em: { type: Date, default: Date.now },
});

export default model('Link', LinkSchema);
