import * as UserConfig from './UserConfig';
import { Schema, model } from 'mongoose';

export interface IGuild {
  guildID: string;
  isJoin: UserConfig.GuildState;
}
interface UserInfo extends IGuild {
  userName: string;
  passWord: string;
  avatar?: string;
  coin: number;
  inventory: any;
  gem: number;
}
const schema = new Schema<UserInfo>({
  userName: { type: String, required: true },
  passWord: { type: String, required: true },
  avatar: { type: String, required: false },
  inventory: { type: Array, required: false, default: null },
  coin: { type: Number, require: true, default: UserConfig.InitDataUser.COIN },
  gem: { type: Number, require: true, default: UserConfig.InitDataUser.GEM },
  guildID: { type: String, require: true, default: '' },
  isJoin: { type: Number, require: true, default: UserConfig.GuildState.NORMAL },
});
export const userInfo = model<UserInfo>('User', schema);
