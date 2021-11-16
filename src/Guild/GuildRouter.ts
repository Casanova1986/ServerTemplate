import { Router } from 'express';
import { GuildController } from './GuildController';
import { GuildModel, GuildRole, IGuildDocument } from './GuildModel';

var GuildRouter = Router();
let guildController = new GuildController();

export default GuildRouter;
