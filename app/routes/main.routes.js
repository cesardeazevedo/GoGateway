module.exports = function(app){
    app.get('/', function(req, res){
        res.render('tx-list');
    });

    app.get('/tx/list', function(req, res){
        res.render('tx-list');
    });

    app.get('/tx/create', function(req, res){
        res.render('invoice');
    });
};
