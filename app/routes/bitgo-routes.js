var bitgo = require('../controllers/bitgo.controller');

module.exports = function(app){

    app.io.route('market', bitgo.market);
    app.io.route('getWallet', bitgo.getWallet);
    app.io.route('getLabels', bitgo.getLabels);
    app.io.route('webhook', {
        list   : bitgo.listWebhook
      , create : bitgo.addWebhook
      , delete : bitgo.removeWebhook
    });

    app.io.route('address', {
        create : bitgo.createAddress
    });
};
