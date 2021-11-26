import { clientRedis } from '../redisConnect';
import * as Guild from './GuildModel';
import * as GuildConfig from './GuildConfig';
import { userInfo } from '../Users/UserModel';
import * as UserConfig from '../Users/UserConfig';
import { CMD } from '../CMD';
import { GuildErrMsg } from './GuildMessage';

function maxGuildMember(guildLevel: number) {
  return guildLevel * GuildConfig.MemberGuild.STEP + GuildConfig.MemberGuild.STEP;
}

function donateGuildProcess(typeDonate: number): { Coin: number; Gem: number; Fund: number; Point: number } {
  let guildDonate = {
    Coin: GuildConfig.DontateGuild.COMMON.Coin,
    Gem: GuildConfig.DontateGuild.COMMON.Gem,
    Fund: GuildConfig.DontateGuild.COMMON.Fund,
    Point: GuildConfig.DontateGuild.COMMON.Point,
  };
  if (typeDonate == GuildConfig.DontateGuild.GOOD.type) {
    guildDonate.Coin = GuildConfig.DontateGuild.GOOD.Coin;
    guildDonate.Gem = GuildConfig.DontateGuild.GOOD.Gem;
    guildDonate.Fund = GuildConfig.DontateGuild.GOOD.Fund;
    guildDonate.Point = GuildConfig.DontateGuild.GOOD.Point;
  } else if (typeDonate == GuildConfig.DontateGuild.VERYGOOD.type) {
    guildDonate.Coin = GuildConfig.DontateGuild.VERYGOOD.Coin;
    guildDonate.Gem = GuildConfig.DontateGuild.VERYGOOD.Gem;
    guildDonate.Fund = GuildConfig.DontateGuild.VERYGOOD.Fund;
    guildDonate.Point = GuildConfig.DontateGuild.VERYGOOD.Point;
  }
  return guildDonate;
}

export class GuildController {
  async createGuild(msg: any, callback: any) {
    let result: any;
    if (msg.isJoin == UserConfig.GuildState.JOINED) {
      result = {
        Status: 0,
        Body: {
          err: {
            code: GuildErrMsg.GUILD_CLIENT_ERR,
            message: `Player can't create guild`,
          },
        },
      };
    } else if (msg.isJoin == UserConfig.GuildState.PENDING) {
      result = {
        Status: 0,
        Body: {
          err: {
            code: GuildErrMsg.GUILD_CLIENT_ERR,
            message: `You are being request guild, can't create guild`,
          },
        },
      };
    } else if (msg.coin < GuildConfig.CointCreate) {
      result = {
        Status: 0,
        Body: {
          err: {
            code: GuildErrMsg.GUILD_NOT_ENOUGH,
            message: 'Coin is not enough',
          },
        },
      };
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
      guildData
        .save()
        .then((success) => {
          result = {
            Status: 1,
            Body: {
              data: guildData,
            },
          };
        })
        .catch((err) => {
          result = {
            Status: 0,
            Body: {
              err: {
                code: GuildErrMsg.GUILD_PARAM_ERR,
                message: 'Param is uncorrect',
              },
            },
          };
        });
      await userInfo.updateOne(
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
    if (msg.isJoin == UserConfig.GuildState.JOINED) {
      callback('', {
        Status: 0,
        Body: {
          err: {
            code: GuildErrMsg.GUILD_CLIENT_ERR,
            message: `Player can't join another guild`,
          },
        },
      });
    } else if (msg.isJoin == UserConfig.GuildState.PENDING) {
      callback('', {
        Status: 0,
        Body: {
          err: {
            code: GuildErrMsg.GUILD_CLIENT_ERR,
            message: `You are being request guild, can't join another guild`,
          },
        },
      });
    } else {
      let checkRole = await Guild.GuildModel.findById({ _id: msg.guildID });
      if (!checkRole?.autoAcceptMember) {
        let newMemberRequest: Array<Guild.ListMemberRequest> = new Array<Guild.ListMemberRequest>();
        await newMemberRequest.push({
          playerId: msg.playerId,
          name: msg.playerName,
        });
        Guild.GuildModel.updateOne({ _id: msg.guildID }, { $push: { memberRequest: newMemberRequest } })
          .then((data) =>
            callback('', {
              Status: 1,
              Body: {
                data: {
                  message: 'Wait for leader accept',
                },
              },
            })
          )
          .catch((err) =>
            callback('', {
              Status: 0,
              Body: {
                err: {
                  code: GuildErrMsg.GUILD_DATA_ERROR,
                  message: `Data server error, retry another `,
                },
              },
            })
          );
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
        Guild.GuildModel.findByIdAndUpdate(
          { _id: msg.guildID },
          { $push: { memberList: newMember }, $inc: { member: 1 } }
        )
          .then((data) =>
            callback('', {
              Status: 1,
              Body: {
                data: data,
              },
            })
          )
          .catch((err) =>
            callback('', {
              Status: 0,
              Body: {
                err: {
                  code: GuildErrMsg.GUILD_DATA_ERROR,
                  message: `Data server error, retry another `,
                },
              },
            })
          );
        await userInfo.updateOne(
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
            callback('', {
              Status: 0,
              Body: {
                err: {
                  code: GuildErrMsg.GUILD_CLIENT_ERR,
                  message: `Please change leader before leave your guild`,
                },
              },
            });
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
                .then((success) =>
                  callback('', {
                    Status: 1,
                    Body: {
                      data: {
                        message: `Leave Success`,
                      },
                    },
                  })
                )
                .catch((err) =>
                  callback('', {
                    Status: 0,
                    Body: {
                      err: {
                        code: GuildErrMsg.GUILD_DATA_ERROR,
                        message: `Data server error, retry another `,
                      },
                    },
                  })
                );
              await userInfo.updateOne(
                { _id: msg.memberLeaveId },
                { $set: { guildID: '', isJoin: UserConfig.GuildState.NORMAL } }
              );
            } else
              callback('', {
                Status: 0,
                Body: {
                  err: {
                    code: GuildErrMsg.GUILD_CLIENT_ERR,
                    message: `You not on guild`,
                  },
                },
              });
          }
        } else
          callback('', {
            Status: 0,
            Body: {
              err: {
                code: GuildErrMsg.GUILD_DATA_ERROR,
                message: `Data server error, retry another `,
              },
            },
          });
      })
      .catch((err) =>
        callback('', {
          Status: 0,
          Body: {
            err: {
              code: GuildErrMsg.GUILD_SERVER_ERROR,
              message: `Server error, retry another `,
            },
          },
        })
      );
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
              .then((res) =>
                callback('', {
                  Status: 1,
                  Body: {
                    data: {
                      message: `Change Role Success`,
                    },
                  },
                })
              )
              .catch((err) =>
                callback('', {
                  Status: 0,
                  Body: {
                    err: {
                      code: GuildErrMsg.GUILD_SERVER_ERROR,
                      message: `Server error, retry another `,
                    },
                  },
                })
              );
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
              .then((res) =>
                callback('', {
                  Status: 1,
                  Body: {
                    data: {
                      message: data.memberList,
                    },
                  },
                })
              )
              .catch((err) =>
                callback('', {
                  Status: 0,
                  Body: {
                    err: {
                      code: GuildErrMsg.GUILD_CLIENT_ERR,
                      message: `Param client err `,
                    },
                  },
                })
              );
          } else {
            callback('', {
              Status: 0,
              Body: {
                err: {
                  code: GuildErrMsg.GUILD_DATA_ERROR,
                  message: `Data server error, retry another `,
                },
              },
            });
          }
        } else {
          console.log('Check security!');
          callback('', {
            Status: 0,
            Body: {
              err: {
                code: GuildErrMsg.GUILD_VALIDATE_ERROR,
                message: `You dont have permisson `,
              },
            },
          });
        }
      })
      .catch((err) =>
        callback('', {
          Status: 0,
          Body: {
            err: {
              code: GuildErrMsg.GUILD_CLIENT_ERR,
              message: `Param client err `,
            },
          },
        })
      );
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
              Guild.GuildModel.findByIdAndUpdate(
                { _id: msg.guildID },
                { $push: { memberList: newMember }, $inc: { member: 1 }, $set: { memberRequest: data.memberRequest } }
              )
                .then((data) =>
                  callback('', {
                    Status: 1,
                    Body: {
                      data: {
                        message: data?.memberList,
                      },
                    },
                  })
                )
                .catch((err) =>
                  callback('', {
                    Status: 0,
                    Body: {
                      err: {
                        code: GuildErrMsg.GUILD_CLIENT_ERR,
                        message: `Param client err `,
                      },
                    },
                  })
                );
              await userInfo.updateOne({ _id: msg.memberWaitId }, { $set: { isJoin: UserConfig.GuildState.JOINED } });
            } else {
              data.memberRequest.splice(indexRm, 1);
              Guild.GuildModel.findByIdAndUpdate({ _id: msg.guildID }, { $set: { memberRequest: data.memberRequest } })
                .then((data) =>
                  callback('', {
                    Status: 1,
                    Body: {
                      data: {
                        message: data?.memberRequest,
                      },
                    },
                  })
                )
                .catch((err) =>
                  callback('', {
                    Status: 0,
                    Body: {
                      err: {
                        code: GuildErrMsg.GUILD_DATA_ERROR,
                        message: `Data server error, retry another `,
                      },
                    },
                  })
                );
              await userInfo.updateOne(
                { _id: msg.memberWaitId },
                { $set: { guildID: '', isJoin: UserConfig.GuildState.NORMAL } }
              );
            }
          } else {
            callback('', {
              Status: 0,
              Body: {
                err: {
                  code: GuildErrMsg.GUILD_CLIENT_ERR,
                  message: `Not found member request`,
                },
              },
            });
          }
        } else {
          callback('', {
            Status: 0,
            Body: {
              err: {
                code: GuildErrMsg.GUILD_PERMISSION,
                message: `You don't have permission`,
              },
            },
          });
        }
      })
      .catch((err) =>
        callback('', {
          Status: 0,
          Body: {
            err: {
              code: GuildErrMsg.GUILD_SERVER_ERROR,
              message: `Server error, retry another `,
            },
          },
        })
      );
  }

  async changeAcceptMember(msg: any, callback: any) {
    Guild.GuildModel.findOne({ leaderId: msg.leaderId })
      .then((data) => {
        if (data) {
          Guild.GuildModel.updateOne({ _id: msg.guildID }, { $set: { autoAcceptMember: msg.acceptMember } })
            .then((res) =>
              callback('', {
                Status: 1,
              })
            )
            .catch((err) =>
              callback('', {
                Status: 0,
                Body: {
                  err: {
                    code: GuildErrMsg.GUILD_SERVER_ERROR,
                    message: `Server error, retry another `,
                  },
                },
              })
            );
        } else {
          callback('', {
            Status: 0,
            Body: {
              err: {
                code: GuildErrMsg.GUILD_VALIDATE_ERROR,
                message: `You dont have permisson`,
              },
            },
          });
        }
      })
      .catch((err) =>
        callback('', {
          Status: 0,
          Body: {
            err: {
              code: GuildErrMsg.GUILD_SERVER_ERROR,
              message: `Server error, retry another `,
            },
          },
        })
      );
  }
  async donateGuild(msg: any, callback: any) {
    Guild.GuildModel.findOne({ _id: msg.guildID })
      .then(async (data) => {
        if (data) {
          if (
            msg.typeDonate >= GuildConfig.DontateGuild.COMMON.type &&
            msg.typeDonate <= GuildConfig.DontateGuild.VERYGOOD.type
          ) {
            let donateData = donateGuildProcess(msg.typeDonate);
            console.log(donateData);
            if (msg.coin < donateData.Fund || msg.gem < donateData.Gem) {
              callback('', {
                Status: 0,
                Body: {
                  err: {
                    code: GuildErrMsg.GUILD_NOT_ENOUGH,
                    message: 'Coin, Gem is not enough',
                  },
                },
              });
            } else {
              await userInfo.updateOne(
                { _id: msg.memberDonateId },
                {
                  $inc: { coin: -donateData.Coin, gem: donateData.Gem },
                }
              );
              for (let i = 0; i < data.memberList.length; i++) {
                if (data.memberList[i].memberID == msg.memberDonateId) {
                  data.memberList[i].pointDonate += donateData.Point;
                  data.memberList[i].fundDonate += donateData.Fund;
                }
              }
              Guild.GuildModel.findByIdAndUpdate(
                { _id: msg.guildID },
                {
                  $inc: { point: donateData.Point, fund: donateData.Fund },
                  $set: { memberList: data.memberList },
                }
              )
                .then((data) =>
                  callback('', {
                    Status: 1,
                    Body: {
                      data: {
                        point: data?.point,
                        fund: data?.fund,
                      },
                    },
                  })
                )
                .catch((err) =>
                  callback('', {
                    Status: 0,
                    Body: {
                      err: {
                        code: GuildErrMsg.GUILD_CLIENT_ERR,
                        message: `Param client err `,
                      },
                    },
                  })
                );
            }
          } else {
            callback('', {
              Status: 0,
              Body: {
                err: {
                  code: GuildErrMsg.GUILD_CLIENT_ERR,
                  message: `Param client err `,
                },
              },
            });
          }
        } else {
          callback('', {
            Status: 0,
            Body: {
              err: {
                code: GuildErrMsg.GUILD_DATA_ERROR,
                message: `Data server error, retry another `,
              },
            },
          });
        }
      })
      .catch((err) =>
        callback('', {
          Status: 0,
          Body: {
            err: {
              code: GuildErrMsg.GUILD_VALIDATE_ERROR,
              message: `You dont have permisson `,
            },
          },
        })
      );
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
      case CMD.GUILD_DONATE:
        guildController.donateGuild(msg, callback);
        break;
    }
  }
}
