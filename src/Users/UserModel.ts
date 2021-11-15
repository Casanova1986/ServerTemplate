//import mongoose from '../mongoConnect';
import { Schema, model } from 'mongoose';
interface UserInfo {
  userName: string;
  passWord: string;
  avatar?: string;
}

const schema = new Schema<UserInfo>({
  userName: { type: String, required: true },
  passWord: { type: String, required: true },
  avatar: { type: String, required: false },
});
export const userInfo = model<UserInfo>('userInfo', schema);
