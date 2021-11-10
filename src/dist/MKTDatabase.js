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
exports.mktDatabase = exports.Tax = exports.GameGGPlay = exports.GameAppstore = exports.GameAppFlyer = exports.GameMax = exports.GameIronSource = exports.GameRef = exports.GameDetail = exports.GameData = void 0;
var mysql_1 = require("mysql");
var request = require("request");
var GameDataModel_1 = require("./Models/GameDataModel");
var dateFormat = require("dateformat");
var GameData = /** @class */ (function () {
    function GameData() {
    }
    return GameData;
}());
exports.GameData = GameData;
exports.GameDetail = new Map();
exports.GameRef = new Map();
exports.GameIronSource = new Map();
exports.GameMax = new Map();
exports.GameAppFlyer = new Map();
exports.GameAppstore = new Map();
exports.GameGGPlay = new Map();
exports.Tax = new Map();
var fs_1 = require("fs");
var timeOfDay = [{
        id: 1,
        value: 8
    },
    {
        id: 2,
        value: 10
    },
    {
        id: 3,
        value: 12
    },
    {
        id: 4,
        value: 14
    },
    {
        id: 5,
        value: 16
    },
    {
        id: 6,
        value: 18
    },
    {
        id: 8,
        value: 20
    },
    {
        id: 9,
        value: 22
    }
];
;
console.log({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
});
var db;
// Connect to MySQL server
var MKTDatabase = /** @class */ (function () {
    function MKTDatabase() {
        //this.initConfig();
    }
    MKTDatabase.prototype.initConfig = function () {
        db = mysql_1["default"].createPool({
            connectionLimit: 100,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PWD,
            database: process.env.DB_NAME
        });
        db.query('select * from tbl_game where isActive = 1', function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                for (var i = 0; i < result.length; i++) {
                    //console.log(result[i]['gameId'], result[i]['displayName']);
                    if (result[i]['appflyer_id'] != undefined && result[i]['appflyer_id'] != '')
                        exports.GameAppFlyer.set(result[i]['appflyer_id'], result[i]);
                    if (result[i]['max_id'] != undefined && result[i]['max_id'] != '')
                        exports.GameMax.set(result[i]['max_id'] + result[i]['device'], result[i]);
                    if (result[i]['ironsource_id'] != undefined && result[i]['ironsource_id'] != '')
                        exports.GameIronSource.set(result[i]['ironsource_id'], result[i]);
                    if (result[i]['ggplay_id'] != undefined && result[i]['ggplay_id'] != '' && result[i]['device'] == 'android')
                        exports.GameGGPlay.set(result[i]['ggplay_id'], result[i]);
                    if (result[i]['appstore_id'] != undefined && result[i]['appstore_id'] != '' && result[i]['device'] == 'ios')
                        exports.GameAppstore.set(result[i]['appstore_id'], result[i]);
                }
                console.log(exports.GameMax);
            }
        });
        db.query('select device, tax from tbl_tax_inapp ', function (err, result) {
            if (err) {
                console.log(err);
            }
            else
                for (var i = 0; i < result.length; i++) {
                    //console.log(result[i]['gameId'], result[i]['displayName']);
                    exports.Tax.set(result[i]['device'], result[i]['tax']);
                }
        });
    };
    MKTDatabase.prototype.ExportInappApple = function (results) {
        var _this = this;
        var gameDataDaily = new Map();
        fs_1["default"].writeFile("rawInapp " + dateFormat(new Date(), "isoDate") + ".txt", JSON.stringify(results), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        // let arrmissing: string[] = [];
        results.forEach(function (element) {
            var gameCfg = element.platform == 'android' ? exports.GameGGPlay.get(element.bundleId) : exports.GameAppstore.get(element.bundleId);
            //console.log('gameData', gameCfg);
            var team;
            var name;
            try {
                if (gameCfg != undefined) {
                    team = gameCfg['team'];
                    name = gameCfg['game'];
                    console.log('team', team);
                    console.log('name', name);
                }
                else {
                    console.log('missing ', element.bundleId, element);
                }
            }
            catch (error) {
                console.log(element.bundleId, gameCfg);
            }
            if (name != undefined && team != undefined) {
                if (gameDataDaily.has(name)) {
                    gameDataDaily.get(name).updateInApp(element.revenue);
                }
                else {
                    var gameData = new GameDataModel_1.GameDataModel();
                    //gameData.gameId = gameId;
                    gameData.game = name;
                    gameData.team = team;
                    gameData.date = dateFormat(element.date, "isoDate");
                    gameData.device = gameCfg['device'];
                    gameData.updateInApp(element.revenue);
                    gameDataDaily.set(name, gameData);
                }
            }
            else {
                //arrmissing.push(element.bundleId + element.platform);
                //console.log('chua khai bao', element.bundleId);
            }
        });
        // if (arrmissing.length > 0)
        //     this.SkypeReportComplete('MKT Appstore bundeId Missing: ' + JSON.stringify([...new Set(arrmissing)]), "Rocket_TuDT", "1234_Rocket_TuDT_5678");
        gameDataDaily.forEach(function (data, key, map) { return __awaiter(_this, void 0, void 0, function () {
            var tax_inapp, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tax_inapp = (data.device.toLowerCase() == 'android' ? exports.Tax.get('android') : exports.Tax.get('ios'));
                        sql = "INSERT INTO tbl_mkt_data (\n                    game, team, date, device, cost_facebook, cost_apple_search,\n                     cost_google_ads, cost_unity_ads, cost_applovin_ads, cost_ironsource, \n                     cost_twitter, cost_vungle, cost_liftoff, cost_mobvista, \n                     cost_yeahmobi, cost_shareit, cost_adcolony, cost_mintegral, \n                     cost_snapchat, cost_moloco, cost_tiktok, cost_optimise, \n                     cost_mopub, cost_taptica, cost_youappi, cost_mobwonder, \n                     rev_unity_video, rev_vungle_video, rev_applovin_video, \n                     rev_admob_video, rev_ironsource_video, rev_fan_video, \n                     rev_adcolony_video, rev_gam_video, rev_mintegral_video, \n                     rev_pangle_video, rev_fyber_video, rev_inmobi_video, \n                     rev_mopub_video, rev_unity_inter, rev_gam_inter, \n                     rev_vungle_inter, rev_applovin_inter, rev_admob_inter, \n                     rev_ironsource_inter, rev_fan_inter, rev_adcolony_inter, \n                     rev_mintegral_inter, rev_fyber_inter, rev_mytarget_inter, \n                     rev_mopub_inter, rev_inmobi_inter, rev_pangle_inter, \n                     rev_gam_abi_inter, rev_gam_rocket_inter, rev_banner, rev_offer_wall, rev_inapp_report,tax_inapp\n    \n                    ) VALUES(";
                        //sql += '"' + data.gameId + '",';
                        sql += '"' + data.game + '",';
                        sql += '"' + data.team + '",';
                        sql += '"' + data.date + '",';
                        sql += '"' + data.device + '",';
                        sql += data.cost_facebook + ',';
                        sql += data.cost_apple_search + ',';
                        sql += data.cost_google_ads + ',';
                        sql += data.cost_unity_ads + ',';
                        sql += data.cost_applovin_ads + ',';
                        sql += data.cost_ironsource + ',';
                        sql += data.cost_twitter + ',';
                        sql += data.cost_vungle + ',';
                        sql += data.cost_liftoff + ',';
                        sql += data.cost_mobvista + ',';
                        sql += data.cost_yeahmobi + ',';
                        sql += data.cost_shareit + ',';
                        sql += data.cost_adcolony + ',';
                        sql += data.cost_mintegral + ',';
                        sql += data.cost_snapchat + ',';
                        sql += data.cost_moloco + ',';
                        sql += data.cost_tiktok + ',';
                        sql += data.cost_optimise + ',';
                        sql += data.cost_mopub + ',';
                        sql += data.cost_taptica + ',';
                        sql += data.cost_youappi + ',';
                        sql += data.cost_mobwonder + ',';
                        sql += data.rev_unity_video + ',';
                        sql += data.rev_vungle_video + ',';
                        sql += data.rev_applovin_video + ',';
                        sql += data.rev_admob_video + ',';
                        sql += data.rev_ironsource_video + ',';
                        sql += data.rev_fan_video + ',';
                        sql += data.rev_adcolony_video + ',';
                        sql += data.rev_gam_video + ',';
                        sql += data.rev_mintegral_video + ',';
                        sql += data.rev_pangle_video + ',';
                        sql += data.rev_fyber_video + ',';
                        sql += data.rev_inmobi_video + ',';
                        sql += data.rev_mopub_video + ',';
                        sql += data.rev_unity_inter + ',';
                        sql += data.rev_gam_inter + ',';
                        sql += data.rev_vungle_inter + ',';
                        sql += data.rev_applovin_inter + ',';
                        sql += data.rev_admob_inter + ',';
                        sql += data.rev_ironsource_inter + ',';
                        sql += data.rev_fan_inter + ',';
                        sql += data.rev_adcolony_inter + ',';
                        sql += data.rev_mintegral_inter + ',';
                        sql += data.rev_fyber_inter + ',';
                        sql += data.rev_mytarget_inter + ',';
                        sql += data.rev_mopub_inter + ',';
                        sql += data.rev_inmobi_inter + ',';
                        sql += data.rev_pangle_inter + ',';
                        sql += data.rev_gam_abi_inter + ',';
                        sql += data.rev_gam_rocket_inter + ',';
                        sql += data.rev_banner + ',';
                        sql += data.rev_offer_wall + ',';
                        sql += data.rev_inapp_report.toFixed(2) + ',';
                        sql += tax_inapp + ')';
                        sql += ' ON DUPLICATE KEY UPDATE';
                        sql += ' rev_inapp_report = ' + data.rev_inapp_report.toFixed(2);
                        return [4 /*yield*/, this.InsertDataToMySQL(sql)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    MKTDatabase.prototype.InsertDataToMySQL = function (sql) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) {
                            db.query(sql, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    resolve('');
                                }
                                else
                                    resolve('ok');
                            });
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MKTDatabase.prototype.QueryData = function (sql) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) {
                            db.query(sql, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    resolve(null);
                                }
                                else
                                    resolve(result);
                            });
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MKTDatabase.prototype.SaveCSVToSQL = function (dataGame, res) {
        return __awaiter(this, void 0, void 0, function () {
            var errList;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errList = [];
                        dataGame.forEach(function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var sql, rs;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        sql = "INSERT INTO tbl_mkt_data (\n            game, team, date, device, cost_facebook, cost_apple_search,\n             cost_google_ads, cost_unity_ads, cost_applovin_ads, cost_ironsource, \n             cost_twitter, cost_vungle, cost_liftoff, cost_mobvista, \n             cost_yeahmobi, cost_shareit, cost_adcolony, cost_mintegral, \n             cost_snapchat, cost_moloco, cost_tiktok, cost_optimise, \n             cost_mopub, cost_taptica, cost_youappi, cost_mobwonder, \n             rev_unity_video, rev_vungle_video, rev_applovin_video, \n             rev_admob_video, rev_ironsource_video, rev_fan_video, \n             rev_adcolony_video, rev_gam_video, rev_mintegral_video, \n             rev_pangle_video, rev_fyber_video, rev_inmobi_video, \n             rev_mopub_video, rev_unity_inter, rev_gam_inter, \n             rev_vungle_inter, rev_applovin_inter, rev_admob_inter, \n             rev_ironsource_inter, rev_fan_inter, rev_adcolony_inter, \n             rev_mintegral_inter, rev_fyber_inter, rev_mytarget_inter, \n             rev_mopub_inter, rev_inmobi_inter, rev_pangle_inter, \n             rev_gam_abi_inter, rev_gam_rocket_inter, rev_banner, rev_offer_wall, rev_inapp_report,tax_inapp\n\n        \n    ) VALUES(";
                                        //sql += '"' + data.gameId + '",';
                                        sql += '"' + data.game + '",';
                                        sql += '"' + data.team + '",';
                                        sql += '"' + dateFormat(data.date, "isoDate") + '",';
                                        sql += '"' + data.device + '",';
                                        sql += (data.cost_facebook == '' ? 0 : data.cost_facebook) + ',';
                                        sql += (data.cost_apple_search == '' ? 0 : data.cost_apple_search) + ',';
                                        sql += (data.cost_google_ads == '' ? 0 : data.cost_google_ads) + ',';
                                        sql += (data.cost_unity_ads == '' ? 0 : data.cost_unity_ads) + ',';
                                        sql += (data.cost_applovin_ads == '' ? 0 : data.cost_applovin_ads) + ',';
                                        sql += (data.cost_ironsource == '' ? 0 : data.cost_ironsource) + ',';
                                        sql += (data.cost_twitter == '' ? 0 : data.cost_twitter) + ',';
                                        sql += (data.cost_vungle == '' ? 0 : data.cost_vungle) + ',';
                                        sql += (data.cost_liftoff == '' ? 0 : data.cost_liftoff) + ',';
                                        sql += (data.cost_mobvista == '' ? 0 : data.cost_mobvista) + ',';
                                        sql += (data.cost_yeahmobi == '' ? 0 : data.cost_yeahmobi) + ',';
                                        sql += (data.cost_shareit == '' ? 0 : data.cost_shareit) + ',';
                                        sql += (data.cost_adcolony == '' ? 0 : data.cost_adcolony) + ',';
                                        sql += (data.cost_mintegral == '' ? 0 : data.cost_mintegral) + ',';
                                        sql += (data.cost_snapchat == '' ? 0 : data.cost_snapchat) + ',';
                                        sql += (data.cost_moloco == '' ? 0 : data.cost_moloco) + ',';
                                        sql += (data.cost_tiktok == '' ? 0 : data.cost_tiktok) + ',';
                                        sql += (data.cost_optimise == '' ? 0 : data.cost_optimise) + ',';
                                        sql += (data.cost_mopub == '' ? 0 : data.cost_mopub) + ',';
                                        sql += (data.cost_taptica == '' ? 0 : data.cost_taptica) + ',';
                                        sql += (data.cost_youappi == '' ? 0 : data.cost_youappi) + ',';
                                        sql += (data.cost_mobwonder == '' ? 0 : data.cost_mobwonder) + ',';
                                        sql += (data.rev_unity_video == '' ? 0 : data.rev_unity_video) + ',';
                                        sql += (data.rev_vungle_video == '' ? 0 : data.rev_vungle_video) + ',';
                                        sql += (data.rev_applovin_video == '' ? 0 : data.rev_applovin_video) + ',';
                                        sql += (data.rev_admob_video == '' ? 0 : data.rev_admob_video) + ',';
                                        sql += (data.rev_ironsource_video == '' ? 0 : data.rev_ironsource_video) + ',';
                                        sql += (data.rev_fan_video == '' ? 0 : data.rev_fan_video) + ',';
                                        sql += (data.rev_adcolony_video == '' ? 0 : data.rev_adcolony_video) + ',';
                                        sql += (data.rev_gam_video == '' ? 0 : data.rev_gam_video) + ',';
                                        sql += (data.rev_mintegral_video == '' ? 0 : data.rev_mintegral_video) + ',';
                                        sql += (data.rev_pangle_video == '' ? 0 : data.rev_pangle_video) + ',';
                                        sql += (data.rev_fyber_video == '' ? 0 : data.rev_fyber_video) + ',';
                                        sql += (data.rev_inmobi_video == '' ? 0 : data.rev_inmobi_video) + ',';
                                        sql += (data.rev_mopub_video == '' ? 0 : data.rev_mopub_video) + ',';
                                        sql += (data.rev_unity_inter == '' ? 0 : data.rev_unity_inter) + ',';
                                        sql += (data.rev_gam_inter == '' ? 0 : data.rev_gam_inter) + ',';
                                        sql += (data.rev_vungle_inter == '' ? 0 : data.rev_vungle_inter) + ',';
                                        sql += (data.rev_applovin_inter == '' ? 0 : data.rev_applovin_inter) + ',';
                                        sql += (data.rev_admob_inter == '' ? 0 : data.rev_admob_inter) + ',';
                                        sql += (data.rev_ironsource_inter == '' ? 0 : data.rev_ironsource_inter) + ',';
                                        sql += (data.rev_fan_inter == '' ? 0 : data.rev_fan_inter) + ',';
                                        sql += (data.rev_adcolony_inter == '' ? 0 : data.rev_adcolony_inter) + ',';
                                        sql += (data.rev_mintegral_inter == '' ? 0 : data.rev_mintegral_inter) + ',';
                                        sql += (data.rev_fyber_inter == '' ? 0 : data.rev_fyber_inter) + ',';
                                        sql += (data.rev_mytarget_inter == '' ? 0 : data.rev_mytarget_inter) + ',';
                                        sql += (data.rev_mopub_inter == '' ? 0 : data.rev_mopub_inter) + ',';
                                        sql += (data.rev_inmobi_inter == '' ? 0 : data.rev_inmobi_inter) + ',';
                                        sql += (data.rev_pangle_inter == '' ? 0 : data.rev_pangle_inter) + ',';
                                        sql += (data.rev_gam_abi_inter == '' ? 0 : data.rev_gam_abi_inter) + ',';
                                        sql += (data.rev_gam_rocket_inter == '' ? 0 : data.rev_gam_rocket_inter) + ',';
                                        sql += (data.rev_banner == '' ? 0 : data.rev_banner) + ',';
                                        sql += (data.rev_offer_wall == '' ? 0 : data.rev_offer_wall) + ',';
                                        sql += (data.rev_inapp_report == '' ? 0 : data.rev_inapp_report) + ',';
                                        sql += (data.tax_inapp == '' ? 0 : data.tax_inapp) + ')';
                                        sql += ' ON DUPLICATE KEY UPDATE';
                                        sql += ' team = "' + data.team + '"';
                                        if (data.cost_facebook != '' && data.cost_facebook > 0)
                                            sql += ', cost_facebook = ' + (data.cost_facebook == '' ? 0 : data.cost_facebook);
                                        if (data.cost_apple_search != '' && data.cost_apple_search > 0)
                                            sql += ', cost_apple_search = ' + (data.cost_apple_search == '' ? 0 : data.cost_apple_search);
                                        if (data.cost_google_ads != '' && data.cost_google_ads > 0)
                                            sql += ', cost_google_ads = ' + (data.cost_google_ads == '' ? 0 : data.cost_google_ads);
                                        if (data.cost_unity_ads != '' && data.cost_unity_ads > 0)
                                            sql += ', cost_unity_ads = ' + (data.cost_unity_ads == '' ? 0 : data.cost_unity_ads);
                                        if (data.cost_applovin_ads != '' && data.cost_applovin_ads > 0)
                                            sql += ', cost_applovin_ads = ' + (data.cost_applovin_ads == '' ? 0 : data.cost_applovin_ads);
                                        if (data.cost_ironsource != '' && data.cost_ironsource > 0)
                                            sql += ', cost_ironsource = ' + (data.cost_ironsource == '' ? 0 : data.cost_ironsource);
                                        if (data.cost_twitter != '' && data.cost_twitter > 0)
                                            sql += ', cost_twitter = ' + (data.cost_twitter == '' ? 0 : data.cost_twitter);
                                        if (data.cost_vungle != '' && data.cost_vungle > 0)
                                            sql += ', cost_vungle = ' + (data.cost_vungle == '' ? 0 : data.cost_vungle);
                                        if (data.cost_liftoff != '' && data.cost_liftoff > 0)
                                            sql += ', cost_liftoff = ' + (data.cost_liftoff == '' ? 0 : data.cost_liftoff);
                                        if (data.cost_mobvista != '' && data.cost_mobvista > 0)
                                            sql += ', cost_mobvista = ' + (data.cost_mobvista == '' ? 0 : data.cost_mobvista);
                                        if (data.cost_yeahmobi != '' && data.cost_yeahmobi > 0)
                                            sql += ', cost_yeahmobi = ' + (data.cost_yeahmobi == '' ? 0 : data.cost_yeahmobi);
                                        if (data.cost_shareit != '' && data.cost_shareit > 0)
                                            sql += ', cost_shareit = ' + (data.cost_shareit == '' ? 0 : data.cost_shareit);
                                        if (data.cost_adcolony != '' && data.cost_adcolony > 0)
                                            sql += ', cost_adcolony = ' + (data.cost_adcolony == '' ? 0 : data.cost_adcolony);
                                        if (data.cost_mintegral != '' && data.cost_mintegral > 0)
                                            sql += ', cost_mintegral = ' + (data.cost_mintegral == '' ? 0 : data.cost_mintegral);
                                        if (data.cost_snapchat != '' && data.cost_snapchat > 0)
                                            sql += ', cost_snapchat = ' + (data.cost_snapchat == '' ? 0 : data.cost_snapchat);
                                        if (data.cost_moloco != '' && data.cost_moloco > 0)
                                            sql += ', cost_moloco = ' + (data.cost_moloco == '' ? 0 : data.cost_moloco);
                                        if (data.cost_tiktok != '' && data.cost_tiktok > 0)
                                            sql += ', cost_tiktok = ' + (data.cost_tiktok == '' ? 0 : data.cost_tiktok);
                                        if (data.cost_optimise != '' && data.cost_optimise > 0)
                                            sql += ', cost_optimise = ' + (data.cost_optimise == '' ? 0 : data.cost_optimise);
                                        if (data.cost_mopub != '' && data.cost_mopub > 0)
                                            sql += ', cost_mopub = ' + (data.cost_mopub == '' ? 0 : data.cost_mopub);
                                        if (data.cost_taptica != '' && data.cost_taptica > 0)
                                            sql += ', cost_taptica = ' + (data.cost_taptica == '' ? 0 : data.cost_taptica);
                                        if (data.cost_youappi != '' && data.cost_youappi > 0)
                                            sql += ', cost_youappi = ' + (data.cost_youappi == '' ? 0 : data.cost_youappi);
                                        if (data.cost_mobwonder != '' && data.cost_mobwonder > 0)
                                            sql += ', cost_mobwonder = ' + (data.cost_mobwonder == '' ? 0 : data.cost_mobwonder);
                                        if (data.rev_unity_video != '' && data.rev_unity_video > 0)
                                            sql += ', rev_unity_video = ' + (data.rev_unity_video == '' ? 0 : data.rev_unity_video);
                                        if (data.rev_vungle_video != '' && data.rev_vungle_video > 0)
                                            sql += ', rev_vungle_video = ' + (data.rev_vungle_video == '' ? 0 : data.rev_vungle_video);
                                        if (data.rev_applovin_video != '' && data.rev_applovin_video > 0)
                                            sql += ', rev_applovin_video = ' + (data.rev_applovin_video == '' ? 0 : data.rev_applovin_video);
                                        if (data.rev_admob_video != '' && data.rev_admob_video > 0)
                                            sql += ', rev_admob_video = ' + (data.rev_admob_video == '' ? 0 : data.rev_admob_video);
                                        if (data.rev_ironsource_video != '' && data.rev_ironsource_video > 0)
                                            sql += ', rev_ironsource_video = ' + (data.rev_ironsource_video == '' ? 0 : data.rev_ironsource_video);
                                        if (data.rev_fan_video != '' && data.rev_fan_video > 0)
                                            sql += ', rev_fan_video = ' + (data.rev_fan_video == '' ? 0 : data.rev_fan_video);
                                        if (data.rev_adcolony_video != '' && data.rev_adcolony_video > 0)
                                            sql += ', rev_adcolony_video = ' + (data.rev_adcolony_video == '' ? 0 : data.rev_adcolony_video);
                                        if (data.rev_gam_video != '' && data.rev_gam_video > 0)
                                            sql += ', rev_gam_video = ' + (data.rev_gam_video == '' ? 0 : data.rev_gam_video);
                                        if (data.rev_mintegral_video != '' && data.rev_mintegral_video > 0)
                                            sql += ', rev_mintegral_video = ' + (data.rev_mintegral_video == '' ? 0 : data.rev_mintegral_video);
                                        if (data.rev_pangle_video != '' && data.rev_pangle_video > 0)
                                            sql += ', rev_pangle_video = ' + (data.rev_pangle_video == '' ? 0 : data.rev_pangle_video);
                                        if (data.rev_fyber_video != '' && data.rev_fyber_video > 0)
                                            sql += ', rev_fyber_video = ' + (data.rev_fyber_video == '' ? 0 : data.rev_fyber_video);
                                        if (data.rev_mytarget_video != '' && data.rev_mytarget_video > 0)
                                            sql += ', rev_mytarget_video = ' + (data.rev_mytarget_video == '' ? 0 : data.rev_mytarget_video);
                                        if (data.rev_inmobi_video != '' && data.rev_inmobi_video > 0)
                                            sql += ', rev_inmobi_video = ' + (data.rev_inmobi_video == '' ? 0 : data.rev_inmobi_video);
                                        if (data.rev_mopub_video != '' && data.rev_mopub_video > 0)
                                            sql += ', rev_mopub_video = ' + (data.rev_mopub_video == '' ? 0 : data.rev_mopub_video);
                                        if (data.rev_unity_inter != '' && data.rev_unity_inter > 0)
                                            sql += ', rev_unity_inter = ' + (data.rev_unity_inter == '' ? 0 : data.rev_unity_inter);
                                        if (data.rev_gam_inter != '' && data.rev_gam_inter > 0)
                                            sql += ', rev_gam_inter = ' + (data.rev_gam_inter == '' ? 0 : data.rev_gam_inter);
                                        if (data.rev_vungle_inter != '' && data.rev_vungle_inter > 0)
                                            sql += ', rev_vungle_inter = ' + (data.rev_vungle_inter == '' ? 0 : data.rev_vungle_inter);
                                        if (data.rev_applovin_inter != '' && data.rev_applovin_inter > 0)
                                            sql += ', rev_applovin_inter = ' + (data.rev_applovin_inter == '' ? 0 : data.rev_applovin_inter);
                                        if (data.rev_admob_inter != '' && data.rev_admob_inter > 0)
                                            sql += ', rev_admob_inter = ' + (data.rev_admob_inter == '' ? 0 : data.rev_admob_inter);
                                        if (data.rev_ironsource_inter != '' && data.rev_ironsource_inter > 0)
                                            sql += ', rev_ironsource_inter = ' + (data.rev_ironsource_inter == '' ? 0 : data.rev_ironsource_inter);
                                        if (data.rev_fan_inter != '' && data.rev_fan_inter > 0)
                                            sql += ', rev_fan_inter = ' + (data.rev_fan_inter == '' ? 0 : data.rev_fan_inter);
                                        if (data.rev_adcolony_inter != '' && data.rev_adcolony_inter > 0)
                                            sql += ', rev_adcolony_inter = ' + (data.rev_adcolony_inter == '' ? 0 : data.rev_adcolony_inter);
                                        if (data.rev_mintegral_inter != '' && data.rev_mintegral_inter > 0)
                                            sql += ', rev_mintegral_inter = ' + (data.rev_mintegral_inter == '' ? 0 : data.rev_mintegral_inter);
                                        if (data.rev_fyber_inter != '' && data.rev_fyber_inter > 0)
                                            sql += ', rev_fyber_inter = ' + (data.rev_fyber_inter == '' ? 0 : data.rev_fyber_inter);
                                        if (data.rev_mytarget_inter != '' && data.rev_mytarget_inter > 0)
                                            sql += ', rev_mytarget_inter = ' + (data.rev_mytarget_inter == '' ? 0 : data.rev_mytarget_inter);
                                        if (data.rev_mopub_inter != '' && data.rev_mopub_inter > 0)
                                            sql += ', rev_mopub_inter = ' + (data.rev_mopub_inter == '' ? 0 : data.rev_mopub_inter);
                                        if (data.rev_inmobi_inter != '' && data.rev_inmobi_inter > 0)
                                            sql += ', rev_inmobi_inter = ' + (data.rev_inmobi_inter == '' ? 0 : data.rev_inmobi_inter);
                                        if (data.rev_pangle_inter != '' && data.rev_pangle_inter > 0)
                                            sql += ', rev_pangle_inter = ' + (data.rev_pangle_inter == '' ? 0 : data.rev_pangle_inter);
                                        if (data.rev_gam_abi_inter != '' && data.rev_gam_abi_inter > 0)
                                            sql += ', rev_gam_abi_inter = ' + (data.rev_gam_abi_inter == '' ? 0 : data.rev_gam_abi_inter);
                                        if (data.rev_gam_rocket_inter != '' && data.rev_gam_rocket_inter > 0)
                                            sql += ', rev_gam_rocket_inter = ' + (data.rev_gam_rocket_inter == '' ? 0 : data.rev_gam_rocket_inter);
                                        if (data.rev_banner != '' && data.rev_banner > 0)
                                            sql += ', rev_banner = ' + (data.rev_banner == '' ? 0 : data.rev_banner);
                                        if (data.rev_offer_wall != '' && data.rev_offer_wall > 0)
                                            sql += ', rev_offer_wall = ' + (data.rev_offer_wall == '' ? 0 : data.rev_offer_wall);
                                        if (data.rev_inapp_report != '' && data.rev_inapp_report > 0)
                                            sql += ', rev_inapp_report = ' + (data.rev_inapp_report == '' ? 0 : data.rev_inapp_report);
                                        sql += ';';
                                        return [4 /*yield*/, this.InsertDataToMySQL(sql)];
                                    case 1:
                                        rs = _a.sent();
                                        if (rs != 'ok') {
                                            errList.push(data.game + ' ' + data.team + ' ' + dateFormat(data.date, "isoDate") + ' ' + data.device);
                                            console.log(data.game, data.team, dateFormat(data.date, "isoDate"), data.device);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        res.send({
                            Status: 1,
                            Body: {
                                msg: 'ok',
                                errList: errList
                            }
                        });
                        return [4 /*yield*/, this.InsertDataToMySQL("CALL refresh_tbl_network_cost_rev();")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MKTDatabase.prototype.saveCrawlLog = function (name, userName, logs, status) {
        var sql = "INSERT INTO tbl_schedule_details (networkName, timeData, userName, dataLog, statusServer) values (?, ?, ?, ?, ?)";
        var date = new Date();
        var hours = date.getHours() + 7;
        var data = new Map();
        data.set('networkName', name);
        data.set('dayData', date.toISOString().slice(0, 10));
        var timeKey = 'time22PM';
        var timeValue = hours + ':' + date.getMinutes() + "/" + userName + "/" + status + "/" + logs;
        for (var i = 1; i < timeOfDay.length; i++) {
            if (hours >= timeOfDay[i - 1].value && hours < timeOfDay[i].value) {
                timeKey = "time" + timeOfDay[i - 1].value + ((hours < 12) ? "AM" : "PM");
                timeValue = hours + ':' + date.getMinutes() +
                    "/"
                    + userName +
                    "/"
                    + status +
                    "/"
                    + logs;
                break;
            }
        }
        var sql2 = "INSERT INTO tbl_schedule_data (networkName, dayData, "
            + timeKey +
            ") values (?,?,?) ON DUPLICATE KEY UPDATE "
            + timeKey +
            " = '"
            + timeValue + "'";
        var values = [name, date, userName, logs, status];
        var values2 = [name, data.get('dayData'), timeValue];
        console.log(sql2);
        console.log(values2);
        console.log('-----------');
        console.log(sql);
        console.log(values);
        db.query(sql2, values2, function (err, result) {
            if (err)
                throw err;
            console.log(result);
        });
        db.query(sql, values, function (err, result) {
            if (err)
                throw err;
            console.log(result);
        });
    };
    MKTDatabase.prototype.SkypeReportComplete = function (msg, groupId, GroupPass) {
        var promise = new Promise(function (resolve, reject) {
            request.post('http://rocketstudio.com.vn/Jarvis/api/rocket/sendmsg', {
                json: {
                    Id: groupId,
                    GroupPass: GroupPass,
                    Msg: msg
                }
            }, function (error, res, body) {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                console.log("statusCode: " + res.statusCode);
                console.log(body);
                resolve("" + res.statusCode);
            });
        });
        return promise;
    };
    return MKTDatabase;
}());
exports.mktDatabase = new MKTDatabase();
