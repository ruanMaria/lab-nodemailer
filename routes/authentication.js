const { Router } = require('express');
const router = new Router();

const nodemailer = require('nodemailer');
const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

const generateId = length => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += characters[Math.floor(Math.random() * characters.length)];
  }
  return token;
};



const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAIL,
    pass: process.env.MAIL_PW 
  }
});

function sendMail(user) {
  transport.sendMail ({
    from: '"Buu" <process.env.MAIL>', 
    to: `${user.email}`, 
    subject: 'Hello ', 
    html: `<b>Hello world?</b>
    please confirm your email clicking <a href="http://localhost:3000/auth/confirm-email/${user.confirmationCode}">here</a>` 
  })
  .then(result => {
    console.log('Email was sent.');
    console.log(result);
})
.catch(error => {
    console.log('There was an error sending email');
    console.log(error);
});
}

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/confirm-email/:mailToken', (req, res, next) => {
  const mailToken = req.params.mailToken;
  User.findOneAndUpdate({ confirmationCode: mailToken }, { status: 'Active' })
    .then(user => {
      req.session.user = user._id;
      res.redirect('/success');
    })
    .catch(err => next(err));
});




router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const { name, email, password } = req.body;
  const confirmToken = generateId(10);
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        name,
        email,
        passwordHash: hash,
        confirmationCode: confirmToken
      });
    })
    .then(user => {
      sendMail(user);
      req.session.user = user._id;
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let userId;
  const { email, password } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        req.session.user = userId;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/profile', (req, res, next) => {
  res.render('profile');
});

const routeGuard = require('./../middleware/route-guard');

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;
