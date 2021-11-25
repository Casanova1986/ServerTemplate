import { clientRedis } from '../redisConnect';
import * as Guild from './GuildModel';
import * as GuildConfig from './GuildConfig';
import { userInfo } from '../Users/UserModel';
import * as UserConfig from '../Users/UserConfig';
import { CMD } from '../CMD';

function maxGuildMember(guildLevel: number) {
  return guildLevel * GuildConfig.MemberGuild.STEP + GuildConfig.MemberGuild.STEP;
}

export class GuildController {
  async createGuild(msg: any, callback: any) {
    let result: any;
    console.log(msg);
    if (msg.isJoin == 2) {
      result = `Player can't create guild`;
    } else if (msg.isJoin == 1) {
      result = `You are being request guild, can't create guild`;
    } else if (msg.coin < GuildConfig.CointCreate) {
      result = 'Coin is not enough';
    } else {
      let guildLevel = 1;
      let region = 1;
      let maxMember = maxGuildMember(guildLevel);
      let member = 1;
      let point = 0;
      let fund = 0;
      let maxLevelReach = 10;
      let autoAcceptMember = true;
      let memberRequest: Array<Guild.ListMemberRequest> = new Array<Guild.ListMemberRequest>();
      let blockList: Array<String> = new Array<String>();
      let timeCreated = new Date();
      let memberList: Array<Guild.IGuildMemberInfo> = new Array<Guild.IGuildMemberInfo>();
      memberList.push({
        role: Guild.GuildRole.LEADER,
        pointDonate: 0,
        memberID: msg.leaderId,
        fundDonate: 0,
        timeJoin: new Date(),
      });
      let guildData = new Guild.GuildModel({
        name: msg.name,
        icon: msg.icon,
        guildLevel: guildLevel,
        maxMember: maxMember,
        member: member,
        region: region,
        leaderId: msg.leaderId,
        memberList: memberList,
        memberRequest: memberRequest,
        point: point,
        fund: fund,
        maxLevelReach: maxLevelReach,
        slogan: msg.slogan,
        announce: msg.announce,
        autoAcceptMember: autoAcceptMember,
        blockList: blockList,
        timeCreated: timeCreated,
      });
      result = await guildData.save();
      await userInfo.findByIdAndUpdate(
        { _id: msg.leaderId },
        {
          $inc: { coin: -GuildConfig.CointCreate },
          $set: { guildID: result._id, isJoin: UserConfig.GuildState.JOINED },
        }
      );
    }
    callback('', result);
  }

  async findGuild(msg: any, callback: any) {}

  async deleteGuild(msg: any, callback: any) {}

  async joinGuild(msg: any, callback: any) {
    if (msg.isJoin == 2) {
      callback('', `Can't join another Guild!`);
    } else if (msg.isJoin == 1) {
      callback('', `Please wait for response leader`);
    } else {
      let checkRole = await Guild.GuildModel.findById({ _id: msg.guildID });
      if (!checkRole?.autoAcceptMember) {
        let newMemberRequest: Array<Guild.ListMemberRequest> = new Array<Guild.ListMemberRequest>();
        await newMemberRequest.push({
          playerId: msg.playerId,
          name: msg.playerName,
        });
        Guild.GuildModel.updateOne({ _id: msg.guildID }, { $push: { memberRequest: newMemberRequest } })
          .then((data) => callback('', 'Wait for leader accpet!'))
          .catch((err) => callback('', err));
        await userInfo.findByIdAndUpdate(
          { _id: msg.playerId },
          { $set: { guildID: msg.guildID, isJoin: UserConfig.GuildState.PENDING } }
        );
      } else {
        let newMember: Array<Guild.IGuildMemberInfo> = new Array<Guild.IGuildMemberInfo>();
        await newMember.push({
          role: Guild.GuildRole.MEMBER,
          pointDonate: 0,
          memberID: msg.playerId,
          fundDonate: 0,
          timeJoin: new Date(),
        });
        Guild.GuildModel.updateOne({ _id: msg.guildID }, { $push: { memberList: newMember }, $inc: { member: 1 } })
          .then((data) => callback('', 'Join Guild Succeeded!'))
          .catch((err) => callback('', err));
        await userInfo.findByIdAndUpdate(
          { _id: msg.playerId },
          { $set: { guildID: msg.guildID, isJoin: UserConfig.GuildState.JOINED } }
        );
      }
    }
  }

  async leaveGuild(msg: any, callback: any) {
    Guild.GuildModel.findOne({ _id: msg.guildID })
      .then(async (data) => {
        if (data) {
          if (data.leaderId == msg.memberLeaveId) {
            callback('', `Please change leader before leave your guild`);
          } else {
            let indexRm = -1;
            for (let i = 0; i < data.memberList.length; i++) {
              if (data.memberList[i].memberID == msg.memberLeaveId) {
                indexRm = i;
              }
            }
            if (indexRm != -1) {
              data.memberList.splice(indexRm, 1);
              Guild.GuildModel.updateOne(
                { _id: msg.guildID },
                { $set: { memberList: data.memberList }, $inc: { member: -1 } }
              )
                .then((success) => callback('', 'Leave Succeeded'))
                .catch((err) => callback('', err));
              await userInfo.updateOne(
                { _id: msg.memberLeaveId },
                { $set: { guildID: '', isJoin: UserConfig.GuildState.NORMAL } }
              );
            } else callback('', `You not on guild`);
          }
        } else callback('', `Not found guild`);
      })
      .catch((err) => callback('', 'Error when leave guild please contact admin'));
  }

  async changeRole(msg: any, callback: any) {
    Guild.GuildModel.findOne({ leaderId: msg.leaderId, _id: msg.guildID })
      .then((data) => {
        if (data) {
          if (msg.typeChange == Guild.GuildRole.DEPUTY) {
            data.memberList.forEach((member) => {
              if (member.memberID == msg.memberIdChange) {
                member.role = Guild.GuildRole.DEPUTY;
              }
            });
            Guild.GuildModel.updateOne({ _id: msg.guildID }, { $set: { memberList: data.memberList } })
              .then((res) => callback('', 'Change Role Succeeded!'))
              .catch((err) => callback('', err));
          } else if (msg.typeChange == Guild.GuildRole.LEADER) {
            data.memberList.forEach((member) => {
              if (member.memberID == msg.leaderId) {
                member.role = Guild.GuildRole.MEMBER;
              }
              if (member.memberID == msg.memberIdChange) {
                member.role = Guild.GuildRole.LEADER;
              }
            });
            Guild.GuildModel.updateOne(
              { _id: msg.guildID },
              { $set: { memberList: data.memberList, leaderId: msg.memberIdChange } }
            )
              .then((res) => callback('', 'Change Role Succeeded!'))
              .catch((err) => callback('', err));
          } else {
            callback('', 'Parameter change role err!');
          }
        } else {
          console.log('Check security!');
          callback('', 'You dont have permession!');
        }
      })
      .catch((err) => callback('', err));
  }

  async acceptMember(msg: any, callback: any) {
    Guild.GuildModel.findOne({ leaderId: msg.leaderId })
      .then(async (data) => {
        if (data) {
          console.log(msg);
          let indexRm = -1;
          for (let i = 0; i < data.memberRequest.length; i++) {
            if (data.memberRequest[i].playerId == msg.memberWaitId) {
              indexRm = i;
            }
          }
          if (indexRm != -1) {
            if (msg.accept) {
              console.log(data.memberRequest);
              let newMember: Array<Guild.IGuildMemberInfo> = new Array<Guild.IGuildMemberInfo>();
              await newMember.push({
                role: Guild.GuildRole.MEMBER,
                pointDonate: 0,
                memberID: msg.memberWaitId,
                fundDonate: 0,
                timeJoin: new Date(),
              });
              data.memberRequest.splice(indexRm, 1);
              Guild.GuildModel.updateOne(
                { _id: msg.guildID },
                { $push: { memberList: newMember }, $inc: { member: 1 }, $set: { memberRequest: data.memberRequest } }
              )
                .then((data) => callback('', 'Add Member Succeeded!'))
                .catch((err) => callback('', err));
              await userInfo.updateOne({ _id: msg.memberWaitId }, { $set: { isJoin: UserConfig.GuildState.JOINED } });
            } else {
              data.memberRequest.splice(indexRm, 1);
              Guild.GuildModel.updateOne({ _id: msg.guildID }, { $set: { memberRequest: data.memberRequest } })
                .then((data) => callback('', 'Deny Member Succeeded!'))
                .catch((err) => callback('', err));
              await userInfo.updateOne(
                { _id: msg.memberWaitId },
                { $set: { guildID: '', isJoin: UserConfig.GuildState.NORMAL } }
              );
            }
          } else {
            callback('', 'Not found member request!');
          }
        } else {
          console.log('Player dont have permission!');
          callback('', 'You dont have permession!');
        }
      })
      .catch((err) => callback('', err));
  }
  async changeAcceptMember(msg: any, callback: any) {
    Guild.GuildModel.findOne({ leaderId: msg.leaderId })
      .then((data) => {
        if (data) {
          Guild.GuildModel.updateOne({ _id: msg.guildID }, { $set: { autoAcceptMember: msg.acceptMember } })
            .then((res) => callback('', 'Change Accept Member Succeeded!'))
            .catch((err) => callback('', err));
        } else {
          console.log('Check security!');
          callback('', 'You dont have permession!');
        }
      })
      .catch((err) => callback('', err));
  }
}

const guildController = new GuildController();

export class ProcessGuild {
  processGuildMessage(msg: any, callback: any) {
    switch (msg.typeMsg) {
      case CMD.GUILD_CREATE:
        guildController.createGuild(msg, callback);
        break;
      case CMD.GUILD_JOIN:
        guildController.joinGuild(msg, callback);
        break;
      case CMD.GUILD_LEAVE:
        guildController.leaveGuild(msg, callback);
        break;
      case CMD.GUILD_DELETE:
        guildController.deleteGuild(msg, callback);
        break;
      case CMD.GUILD_CHANGE_ROLE:
        guildController.changeRole(msg, callback);
        break;
      case CMD.GUILD_ACCEPT_MEMBER:
        guildController.acceptMember(msg, callback);
        break;
      case CMD.GUILD_AUTO_ACCEPT:
        guildController.changeAcceptMember(msg, callback);
        break;
      case CMD.GUILD_FIND_GUILD:
        guildController.findGuild(msg, callback);
        break;
    }
  }
}
