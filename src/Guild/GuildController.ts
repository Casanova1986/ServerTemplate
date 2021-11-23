import { clientRedis } from '../redisConnect';
import * as Guild from './GuildModel';
import * as GuildConfig from './GuildConfig';
import { userInfo } from '../Users/UserModel';
import * as UserConfig from '../Users/UserConfig';

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

  async leftGuild(msg: any, callback: any) {}

  async changeRole(msg: any, callback: any) {
    Guild.GuildModel.findOne({ leaderId: msg.leaderId })
      .then((data) => {
        if (data) {
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
          if (msg.accept) {
            let newMember: Array<Guild.IGuildMemberInfo> = new Array<Guild.IGuildMemberInfo>();
            await newMember.push({
              role: Guild.GuildRole.MEMBER,
              pointDonate: 0,
              memberID: msg.memberWaitId,
              fundDonate: 0,
              timeJoin: new Date(),
            });
            let indexRm = 0;
            for (let i = 0; i < data.memberRequest.length; i++) {
              if (data.memberRequest[i].playerId == msg.memberWaitId) {
                indexRm = i;
              }
            }
            data.memberRequest.splice(indexRm, 1);
            console.log(data.memberRequest);
            Guild.GuildModel.updateOne(
              { _id: msg.guildID },
              { $push: { memberList: newMember }, $inc: { member: 1 }, $set: { memberRequest: data.memberRequest } }
            )
              .then((data) => callback('', 'Add Member Succeeded!'))
              .catch((err) => callback('', err));
            await userInfo.updateOne({ _id: msg.memberWaitId }, { $set: { isJoin: UserConfig.GuildState.JOINED } });
          } else {
            let indexRm = 0;
            for (let i = 0; i < data.memberRequest.length; i++) {
              if (data.memberRequest[i].playerId == msg.memberWaitId) {
                indexRm = i;
              }
            }
            data.memberRequest.splice(indexRm, 1);
            Guild.GuildModel.updateOne({ _id: msg.guildID }, { $set: { memberRequest: data.memberRequest } })
              .then((data) => callback('', 'Deny Succeeded!'))
              .catch((err) => callback('', err));
            await userInfo.updateOne(
              { _id: msg.memberWaitId },
              { $set: { guildID: '', isJoin: UserConfig.GuildState.NORMAL } }
            );
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
            .then((res) => callback('', 'Change Role Succeeded!'))
            .catch((err) => callback('', err));
        } else {
          console.log('Check security!');
          callback('', 'You dont have permession!');
        }
      })
      .catch((err) => callback('', err));
  }
}
export class ProcessGuild {
  processGuildMessage(msg: any, callback: any) {
    switch (msg.typeMsg) {
      case 'create':
        new GuildController().createGuild(msg, callback);
        break;
      case 'join':
        new GuildController().joinGuild(msg, callback);
        break;
      case 'left':
        new GuildController().leftGuild(msg, callback);
        break;
      case 'delete':
        new GuildController().deleteGuild(msg, callback);
        break;
      case 'changeRole':
        new GuildController().changeRole(msg, callback);
        break;
      case 'acceptMember':
        new GuildController().acceptMember(msg, callback);
        break;
      case 'autoAccept':
        new GuildController().changeAcceptMember(msg, callback);
        break;
      case 'findGuild':
        new GuildController().findGuild(msg, callback);
        break;
    }
  }
}
