var tx = require('../controllers/tx.controller');

module.exports = function(app){
    app.io.route('tx', {
        list  : tx.list
      , create: tx.create
      , read  : tx.read
    });

    app.post('/tx/callback/:id', tx.callback);

    app.param('id', tx.findById);
};
