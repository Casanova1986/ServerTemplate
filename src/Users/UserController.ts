import { clientRedis } from '../redisConnect';
import { userInfo } from './UserModel';

export class UserController {
  registerUser(userName: string, passWord: string) {
    userInfo.create(
      {
        userName: userName,
        passWord: passWord,
      },
      (err: any, res: any) => {
        if (err) console.log(err);
        else console.log('Create User Succeeded!');
      }
    );
  }

  processMessage(socketId: string, msg: any) {
    clientRedis.HMSET('TestSocketServer', socketId, JSON.stringify(msg), (err, res) => {
      if (err) console.log(err);
      else console.log('Add Message Success from Id:' + '  ' + msg);
    });
  }
}
