const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const db = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async(req, res, next)=>{
  const user = req.user;
  res.json(user);
});

router.post('/', isNotLoggedIn, async (req, res, next) => { // 회원가입
    try {
      const hash = await bcrypt.hash(req.body.password, 12);
      const exUser = await db.User.findOne({
        where: {
          email: req.body.email,
        },
      });
      if (exUser) { // 이미 회원가입되어있으면
        return res.status(403).json({
          errorCode: 1,
          message: '이미 회원가입되어있습니다.',
        });
      }
      await db.User.create({
        email: req.body.email,
        password: hash,
        nickname: req.body.nickname,
        aboutme: req.body.aboutme
      }); // HTTP STATUS CODE
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          console.error(err);
          return next(err);
        }
        if (info) {
          return res.status(401).send(info.reason);
        }
        return req.login(user, async (err) => { 
          if (err) {
            console.error(err);
            return next(err);
          }
          const fullUser = await db.User.findOne({
            where: { id: user.id },
            attributes: ['id', 'email', 'nickname', 'aboutme'],
          });
          return res.json(fullUser);
        });
      })(req, res, next);
    } catch (err) {
      console.log(err);
      return next(err);
    }
  });

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      if (info) {
        return res.status(401).send(info.reason);
      }
      return req.login(user, async (err) => { 
        if (err) {
          console.error(err);
          return next(err);
        }
        const fullUser = await db.User.findOne({
          where: { id: user.id },
          attributes: ['id', 'email', 'nickname', 'aboutme'],
        });
        return res.json(fullUser);
      });
    })(req, res, next);
});

router.post('/logout', isLoggedIn, (req, res)=>{
  if(req.isAuthenticated()){
    req.logout();
    req.session.destroy();
    return res.status(200).send('로그아웃 되었습니다');
  }
})

module.exports = router;