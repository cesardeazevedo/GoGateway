var db = require(root+'/app/models');

module.exports = {

    list: function(req){
        db.tx.findAll({ include: [db.tx_status] }).then(function(tx){
            req.io.emit('tx:list:response', tx);
        });
    }

    , create: function(req){
        db.tx.create(req.data).then(function(tx){
            req.data.id = tx.id;
            req.io.route('webhook:create');
            req.io.emit('tx:create:response', tx);
        });
    }

    , read: function(req){
        db.tx.find({ id: req.data.id }).then(function(tx){
            req.io.emit('tx:read:response', tx);
        });
    }

    , callback: function(req, res){
        console.dir(req);
        req.io.emit('callback');
        res.json(req.body);
    }
};
