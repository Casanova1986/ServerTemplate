"use strict";
exports.__esModule = true;
var express_1 = require("express");
var GuildController_1 = require("./GuildController");
var GuildRouter = express_1.Router();
var guildController = new GuildController_1.GuildController();
exports["default"] = GuildRouter;
