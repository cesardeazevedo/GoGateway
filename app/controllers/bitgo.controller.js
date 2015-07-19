var BitGoJS    = require('bitgo')
  , secret     = require(root+'/config/secrets')
  , config     = require(root+'/config/config')
  , superagent = require('superagent')
  , walletId   = process.env.WALLET_ID
  , wallet     = {}
  , bitgo      = {};

require('superagent-proxy')(superagent);

if(process.env.NODE_ENV === 'production')
    //add proxy to production environment
    bitgo = new BitGoJS.BitGo({ env: secret.BITGO.env
                              , accessToken: secret.BITGO.accessToken
                              , proxy: secret.BITGO.proxy
                              });
else
    bitgo = new BitGoJS.BitGo({ env: secret.BITGO.env, accessToken: secret.BITGO.accessToken });

module.exports = {

    market: function(req){
        bitgo.market({}, function callback(err, market) {
            req.io.emit('market:response', market);
        });
    }

    , wallets: function(req){

        var wallets = bitgo.wallets();
        wallets.list({}, function callback(err, wallets){
            if(err)
                return req.io.emit('error', err);

            req.io.emit('wallets:response', wallets);
        });
    }

    , createAddress: function(req){
        if(!wallet)
            req.io.route('getWallet');

        wallet.createAddress({ "chain": 0 }, function callback(err, address) {
            if(err)
                return req.io.emit('error', err);

            wallet.setLabel({ label: JSON.stringify(req.data), address: address.address }, function(err, label){
                req.io.emit('address:response', label);
            });
        });
    }

    , getWallet: function(req){

        bitgo.wallets().get({ "id": walletId }, function callback(err, result) {
            if(err)
                return req.io.emit('error', err);

            wallet = result;
        });
    }

    , getLabels: function(req){
        bitgo.labels({}, function callback(err, labels) {
            if (err)
                return req.io.emit('error', err);

            console.dir(labels);
            req.io.emit('label:response', labels);
        });
    }

    , addWebhook: function(req){
        var url = config.url+'/tx/callback/'+req.data.id;
        wallet.addWebhook({ url: url, type: 'transaction' });
        req.io.route('webhook:list');
    }

    , listWebhook: function(req){
        bitgo.wallets().get({ "id": walletId }, function(err, wallet) {
            wallet.listWebhooks({}, function callback(err, result) {
                console.dir(result);
            });
        });
    }

    , removeWebhook: function(req){

    }
};
