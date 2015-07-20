var request    = require('supertest')
  , should     = require('should')
  , app        = require('../app')
  , db         = require('../app/models')
  , fixtures   = require('sequelize-fixtures')
  , bitcore    = require('bitcore')
  , privateKey = new bitcore.PrivateKey()
  , overpaid   = {}
  , underpaid  = {}
  , tx         = {}
  , callback   = {};

describe('Transaction tests', function(){

    before(function(){
        tx = {
            email: 'test@gmail.com'
          , address: privateKey.toAddress().toString()
          , amount: '0.01495952'
        };
        overpaid = {
            email: 'over@gmail.com'
          , address: privateKey.toAddress().toString()
          , amount: '0.001'
        };
        underpaid = {
            email: 'under@gmail.com'
          , address: privateKey.toAddress().toString()
          , amount: '0.2'
        };
        callback = {
            hash: 'c8f17b2b5e5be7fcfe33980a9ddaa4f3b97e0d00e2aeda0421381a113de118c9' // => 0.01495952
        };
    });

    beforeEach(function(done){
        db.tx.sync({ force: true, logs: false }).then(function(){
            fixtures.loadFile(__dirname+"/../config/data/**.yml", require('../app/models')).then(function(){
                done();
            });
        });
    });
    it('Should give an underpaid transaction', function(done){
        db.tx.create(underpaid).then(function(tx){
            request(app)
            .post('/tx/callback/'+tx.id)
            .send(callback)
            .expect(200)
            .end(function(err, response){
                if(err)
                    done(new Error(err));

                console.dir(response.body);
                response.body.txStatusId.should.be.exactly(2);
                done();
            });
        });
    });
    it('Should give an overpaid transaction', function(done){
        db.tx.create(overpaid).then(function(tx){
            request(app)
            .post('/tx/callback/'+tx.id)
            .send(callback)
            .expect(200)
            .end(function(err, response){
                if(err)
                    done(new Error(err));

                console.dir(response.body);
                response.body.txStatusId.should.be.exactly(3);
                done();
            });
        });
    });
    it('Should give an complete transaction', function(done){
        db.tx.create(tx).then(function(tx){
            request(app)
            .post('/tx/callback/'+tx.id)
            .send(callback)
            .expect(200)
            .end(function(err, response){
                if(err)
                    done(new Error(err));

                console.dir(response.body);
                response.body.txStatusId.should.be.exactly(4);
                done();
            });
        });
    });
});

