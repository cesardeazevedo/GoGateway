var io = require('express.io')()
  , config = require('./config/config')
  , db = require('./app/models')
  , env = require('dotenv').load();

io.http().io();

require('./config/express')(io, config);

db.sequelize
.sync()
.then(function () {
    io.listen(process.env.PORT || 3000);
}).catch(function (e) {
    throw new Error(e);
});
