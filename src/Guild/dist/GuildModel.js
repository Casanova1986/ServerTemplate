"use strict";
exports.__esModule = true;
exports.GuildModel = exports.GuildMatchStatus = exports.GuildRole = exports.BegState = void 0;
var mongoose = require("mongoose");
var BegState;
(function (BegState) {
    BegState[BegState["SENT"] = 0] = "SENT";
    BegState[BegState["GIVEN"] = 1] = "GIVEN";
    BegState[BegState["CLAIMED"] = 2] = "CLAIMED";
    BegState[BegState["CANCELED"] = 3] = "CANCELED";
})(BegState = exports.BegState || (exports.BegState = {}));
var GuildRole;
(function (GuildRole) {
    GuildRole[GuildRole["LEADER"] = 2] = "LEADER";
    GuildRole[GuildRole["DEPUTY"] = 1] = "DEPUTY";
    GuildRole[GuildRole["MEMBER"] = 0] = "MEMBER";
})(GuildRole = exports.GuildRole || (exports.GuildRole = {}));
var GuildMatchStatus;
(function (GuildMatchStatus) {
    GuildMatchStatus[GuildMatchStatus["FREE"] = 0] = "FREE";
    GuildMatchStatus[GuildMatchStatus["REQUEST"] = 1] = "REQUEST";
    GuildMatchStatus[GuildMatchStatus["MATCH"] = 2] = "MATCH";
})(GuildMatchStatus = exports.GuildMatchStatus || (exports.GuildMatchStatus = {}));
var GuildSchema = new mongoose.Schema({
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
                type: Date
            }
        })
    },
    point: Number,
    fund: Number,
    maxLevelReach: Number,
    slogan: String,
    announce: String,
    autoAcceptMember: Boolean,
    blockList: {
        type: Map,
        of: String
    },
    timeCreated: {
        type: Date
    },
    deleted: Boolean
});
GuildSchema.index({
    name: 'text'
});
GuildSchema.index({
    region: 1
});
GuildSchema.index({
    point: 1
});
GuildSchema.index({
    deleted: 1
});
// GuildSchema.index({
//     timeCreated: 1
// });
exports.GuildModel = mongoose.model('Guild', GuildSchema);
