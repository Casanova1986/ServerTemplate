"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.GuildController = void 0;
var Guild = require("./GuildModel");
var GuildConfig = require("./GuildConfig");
function maxGuildMember(guildLevel) {
    return guildLevel * GuildConfig.MemberGuild.STEP + GuildConfig.MemberGuild.STEP;
}
var GuildController = /** @class */ (function () {
    function GuildController() {
    }
    GuildController.prototype.createGuild = function (msg, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var guildLevel, region, maxMember, member, point, fund, maxLevelReach, autoAcceptMember, blockList, timeCreated, mapMember, guildData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guildLevel = 1;
                        region = 1;
                        maxMember = maxGuildMember(guildLevel);
                        member = 1;
                        point = 0;
                        fund = 0;
                        maxLevelReach = 10;
                        autoAcceptMember = true;
                        blockList = new Array();
                        timeCreated = new Date();
                        mapMember = new Map();
                        mapMember.set(msg.leaderId, {
                            role: Guild.GuildRole.LEADER,
                            pointDonate: 0,
                            memberID: msg.leaderId,
                            fundDonate: 0,
                            timeJoin: new Date()
                        });
                        guildData = new Guild.GuildModel({
                            name: msg.name,
                            icon: msg.icon,
                            guildLevel: guildLevel,
                            maxMember: maxMember,
                            member: member,
                            region: region,
                            leaderId: msg.leaderId,
                            memberList: mapMember,
                            point: point,
                            fund: fund,
                            maxLevelReach: maxLevelReach,
                            slogan: msg.slogan,
                            announce: msg.announce,
                            autoAcceptMember: autoAcceptMember,
                            blockList: blockList,
                            timeCreated: timeCreated
                        });
                        return [4 /*yield*/, guildData.save()];
                    case 1:
                        result = _a.sent();
                        callback('', result);
                        return [2 /*return*/];
                }
            });
        });
    };
    GuildController.prototype.findGuild = function () { };
    GuildController.prototype.deleteGuild = function () { };
    GuildController.prototype.joinGuild = function () { };
    GuildController.prototype.leftGuild = function () { };
    GuildController.prototype.changeRoleMember = function () { };
    return GuildController;
}());
exports.GuildController = GuildController;
