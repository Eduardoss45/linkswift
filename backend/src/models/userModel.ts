import { Schema, model } from 'mongoose';
import { UserDocument } from '../types/types';

const UserSchema = new Schema<UserDocument>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  links: [{ type: Schema.Types.ObjectId, ref: 'Link', default: [] }],
  refreshToken: { type: String, default: null },
  accessToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  verificado: { type: Boolean, default: false },
  verificationCode: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000),
  },
});

export default model<UserDocument>('User', UserSchema);
