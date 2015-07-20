var db = require(root+'/app/models')
  , bitgo = require('./bitgo.controller');

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
        bitgo.getTransaction(req).then(function(response){
            console.log(response);
            var tx = req.tx;
            var amount = tx.amount;
            var valuePaid = response.outputs[0].value.toBitcoin() +
                            response.outputs[1].value.toBitcoin() +
                            response.fee.toBitcoin();

            tx.valuePaid  = valuePaid;
            tx.txStatusId = valuePaid > amount ? 3 :
                            valuePaid < amount ? 2 : 4;

            tx.tx = req.body.hash;
            tx.save().then(function(tx){
                req.io.broadcast('callback', { address: tx.address });
                res.status(200).json(tx);
            });
        }).catch(function(err){
            if(err)
                return req.status(400).json(err);
        });
    }

    , findById: function(req, res, next, id){
        db.tx.find({ where: { id: id }}).then(function(tx){
            if(!tx)
                res.status(404).send('Transaction has not found');

            req.tx = tx;
            next();
        });
    }
};
