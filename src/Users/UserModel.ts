//import mongoose from '../mongoConnect';
import { Schema, model } from 'mongoose';
interface UserInfo {
  userName: string;
  passWord: string;
  avatar?: string;
  coint: number;
  gem: number;
}

const schema = new Schema<UserInfo>({
  userName: { type: String, required: true },
  passWord: { type: String, required: true },
  avatar: { type: String, required: false },
  coint: { type: Number, require: true, default: 2000 },
  gem: { type: Number, require: true, default: 10 },
});
export const userInfo = model<UserInfo>('User', schema);
