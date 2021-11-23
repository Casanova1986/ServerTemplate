import mongoose = require('mongoose');
import internal = require('stream');

export enum BegState {
  SENT = 0,
  GIVEN = 1,
  CLAIMED = 2,
  CANCELED = 3,
}
export enum GuildRole {
  LEADER = 2,
  DEPUTY = 1,
  MEMBER = 0,
}
export interface IMusterInfo {
  point: number;
  time: Date;
}

export interface IGuildMemberInfo {
  role: GuildRole;
  pointDonate?: number;
  memberID: string;
  fundDonate?: number;
  timeJoin: Date;
  musterHistory?: IMusterInfo[];
}

export interface ListMemberRequest {
  playerId: string;
  name: string;
  // coin: number;
  // gem: number;
  // inventory: Array<Object>;
}

export interface IGuildBeg {
  id: number;
  timeRequest: Date;
  timeGive: Date;
  giverId: string;
  state: BegState;
}

export interface IItemInfo {
  timeBuy: number;
}

export interface IApplication {
  content: string;
}

export enum GuildMatchStatus {
  FREE = 0,
  REQUEST = 1,
  MATCH = 2,
}

export interface IGuild {
  name: string;
  icon: number;
  maxMember: number;
  member: number;
  region?: string;
  leaderId: string;
  memberList: Array<IGuildMemberInfo>;
  memberRequest: Array<ListMemberRequest>;
  season?: number;
  point: number;
  fund: number;
  maxLevelReach: number;
  slogan: string;
  announce: string;
  autoAcceptMember: boolean;
  blockList: Map<string, string>;
  items: Map<string, IItemInfo>;
  begList: Map<string, IGuildBeg>;
  timeCreated: Date;
  chief: IGuildMemberInfo;
  timeLoad?: number;
  isLock?: boolean;
  deleted?: boolean;
  retain?: boolean;
  bossId?: string;
}

export interface IGuildDocument extends IGuild, mongoose.Document {}

const GuildSchema = new mongoose.Schema({
  name: String,
  icon: Number,
  guildLevel: Number,
  maxMember: Number,
  member: Number,
  region: String,
  leaderId: String,
  memberList: {
    type: Array,
    of: Object,
  },
  memberRequest: {
    type: Array,
    of: Object,
  },
  point: Number,
  fund: Number,
  maxLevelReach: Number,
  slogan: String,
  announce: String,
  autoAcceptMember: Boolean,
  blockList: {
    type: Array,
    of: String,
  },
  timeCreated: {
    type: Date,
  },
  deleted: Boolean,
});

GuildSchema.index({
  name: 'text',
});
GuildSchema.index({
  region: 1,
});
GuildSchema.index({
  point: 1,
});
GuildSchema.index({
  deleted: 1,
});
// GuildSchema.index({
//     timeCreated: 1
// });

export const GuildModel = mongoose.model<IGuildDocument>('Guild', GuildSchema);
