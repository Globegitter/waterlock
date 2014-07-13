var proxyquire = require('proxyquire');
var should = require('should');
var mocha = require('mocha');

describe('engine', function(){
  describe('#findAuth()', function(){
    it('should find a user record with auth', function(done){
      var scope = {
        Auth: {
          findOne: function(){
            return {
              populate: function(){
                return this;
              },
              exec: function(cb){
                cb(null, {user:""});
              }
            }
          }
        }
      }
      var engine = require('../../lib/engine').apply(scope);
      engine.findAuth({}, function(){
        done();
      });
    });
  });
  describe('#findOrCreateAuth()', function(){
    it('should create a user if auth does not have one', function(done){
      var scope = {
        Auth:{
          findOrCreate: function(){
            return {
              populate: function(){
                return this;
              },
              exec: function(cb){
                cb(null, {});
              }
            }
          }
        },
        User:{
          create: function(){
            return {
              exec: function(cb){
                cb(null, {});
              }
            }
          }
        }
      };
      var engine = require('../../lib/engine').apply(scope);
      engine.findOrCreateAuth({},{}, function(err, user){
        user.should.be.type('object');
        done();
      });
    });
    it('should return an existing user auth object', function(done){
      var scope = {
        Auth:{
          findOrCreate: function(){
            return {
              populate: function(){
                return this;
              },
              exec: function(cb){
                cb(null, {user: {}});
              }
            }
          }
        }
      };
      var engine = require('../../lib/engine').apply(scope);
      engine.findOrCreateAuth({},{}, function(err, user){
        user.should.be.type('object');
        done();
      });
    });

    it('should run the findOrCreateAuth again if population didnt work', function(done){
      var called = false;
      var scope = {
        Auth:{
          findOrCreate: function(){
            return {
              populate: function(){
                return this;
              },
              exec: function(cb){
                if(!called){
                  called = true;
                  cb(null, {user: 1});
                }else{ cb(null, {user: {}}) }
              }
            }
          }
        }
      };
      var engine = require('../../lib/engine').apply(scope);
      engine.findOrCreateAuth({},{}, function(err, user){
        user.should.be.type('object');
        done();
      });
    });
    it('should fail if findOrCreateAuth is run more than twice', function(done){
      var called = false;
      var scope = {
        Auth:{
          findOrCreate: function(){
            return {
              populate: function(){
                return this;
              },
              exec: function(cb){
                if(!called){
                  called = true;
                  cb(null, {user: 1});
                }else{ cb(null, {user: 1}) }
              }
            }
          }
        }
      };
      var engine = require('../../lib/engine').apply(scope);
      engine.findOrCreateAuth({},{}, function(err, user){
        err.should.be.type('string');
        done();
      });
    });
  });
  describe('#attachAuthToUser()', function(){
    it('should create auth if user does not have one', function(done){
      var scope = {
        User:{
          findOne: function(){
            return {
              exec: function(cb){
                cb(null, {user: {}});
              }
            };
          }
        }
      };
      var context = {
        findOrCreateAuth: function(a,b,cb){
          cb('a');
        }
      };
      var engine = require('../../lib/engine').apply(scope);
      engine.attachAuthToUser.apply(context, [{},{id:1},function(a){
        a.should.be.type('string');
        done();
      }]);
    });

    it('should run an update if user has an auth', function(done){
      var scope = {
        User:{
          findOne: function(){
            return {
              exec: function(cb){
                cb(null, {auth: true});
              }
            };
          }
        },
        Auth:{
          update:function(){
            return {
              exec: function(cb){
                cb(null, {});
              }
            }
          }
        }
      };

      var engine = require('../../lib/engine').apply(scope);
      engine.attachAuthToUser({},{id:1},function(a, r){
        r.should.be.type('object');
        done();
      });
    });
  });
  describe('#_invertAuth()', function(){
    it('should invert the given auth/user object', function(done){
      var engine = require('../../lib/engine')();
      var auth = {user:{name:'foo'}};
      var user = engine._invertAuth(auth);
      user.should.have.property('auth');
      done();
    });
  });
});