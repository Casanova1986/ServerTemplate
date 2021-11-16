import mongoose = require('mongoose');

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
  memberList: Map<string, IGuildMemberInfo>;
  season?: number;
  point: number;
  fund: number;
  maxLevelReach: number;
  slogan: string;
  announce: string;
  autoAcceptMember: boolean;
  blockList: Map<string, number>;
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
    type: Map,
    of: new mongoose.Schema({
      role: Number,
      memberID: String,
      pointDonate: Number,
      fundDonate: Number,
      timeJoin: {
        type: Date,
      },
    }),
  },
  point: Number,
  fund: Number,
  maxLevelReach: Number,
  slogan: String,
  announce: String,
  autoAcceptMember: Boolean,
  blockList: {
    type: Map,
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
