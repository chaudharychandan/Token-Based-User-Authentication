const passport = require('passport');
const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

const generateToken = (user) => {
  const timestamp = +new Date();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
};

exports.signup = function(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) return res.status(422).send({ message: 'You must provide email and password' });

  try {
    // See if a user exists with the given email address
    User.findOne({ email }, function(err, existingUser) {
      if(err) { return next(err); }

      // If a user with email does exist, return an error
      if(existingUser) {
        return res.status(422).send({ message: 'Email is in use' });
      }

      // If a user with email does not exist, create and save the user record
      const user = new User({
        email, password
      });

      user.save(function(err) {
        if(err) { return next(err); }

        res.send({ token: generateToken(user) });
      });
    });
  } catch (err) {
    next(err);
  }
};

exports.signin = function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if(err) return next(err);
    if(!user) return res.status(401).send(info);
    res.send({ token: generateToken(user) });
  })(req, res, next);
}
