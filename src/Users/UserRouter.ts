import { Router } from 'express';
const bcrypt = require('bcrypt');
import { UserController } from './UserController';
import { userInfo } from './UserModel';

var UserRouter = Router();

UserRouter.post('/registerUser', async (req: any, res: any) => {
  console.log(req.body);
  let errors = new Array();
  if (!req.body.userName) {
    errors.push('Name is required.');
  }
  if (!req.body.passWord) {
    errors.push('Password is required.');
  }
  let user = await userInfo.find({ userName: req.body.userName });
  if (user.length) {
    errors.push('User exist.');
  }
  if (errors.length) {
    res.send({
      Status: 1,
      Body: {
        data: errors,
      },
    });
  } else {
    let salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(req.body.passWord, salt);
    let registerUser = new UserController().registerUser;
    registerUser(req.body.userName, hashedPassword);
    res.send({
      Status: 1,
      Body: {
        data: 'Create User Success',
      },
    });
  }
});
UserRouter.post('/login', async (req, res) => {
  let user = userInfo.findOne({ userName: req.body.userName });
  let validatePassWord: any;
  user.exec((err, data) => {
    if (err) console.log(err);
    else {
      let userData = JSON.parse(JSON.stringify(data));
      if (!userData) {
        res.send({
          Status: 1,
          Body: {
            data: 'Wrong useranme or password',
          },
        });
      } else {
        let password = userData.passWord;
        validatePassWord = bcrypt.compareSync(req.body.passWord, password);
        if (!validatePassWord) {
          res.send({
            Status: 1,
            Body: {
              data: 'Wrong useranme or password',
            },
          });
        } else {
          res.send({
            Status: 1,
            Body: {
              data: {
                id: userData._id,
                name: userData.userName,
                coin: userData.coin,
                gem: userData.gem,
                guildID: userData.guildID,
                isJoin: userData.isJoin,
              },
            },
          });
        }
      }
    }
  });
});

export default UserRouter;
