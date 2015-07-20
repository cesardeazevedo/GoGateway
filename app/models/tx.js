module.exports = function (sequelize, DataTypes) {

    var tx = sequelize.define('tx', {
        email: {
            type: DataTypes.STRING
          , allowNull: false
          , unique   : false
          , validate : {
              isEmail: {
                  msg: 'Email is not valid'
              }
          }
      }
      , address: {
            type: DataTypes.STRING
          , allowNull: false
          , unique: true
      }
      , amount: DataTypes.DECIMAL(16,8)
      , valuePaid: DataTypes.DECIMAL(16,8)
      , tx: DataTypes.TEXT
    }, {
        tableName    : 'tx'
      , classMethods : {
            associate: function (models) {
                // example on how to add relations
                // Article.hasMany(models.Comments);
                tx.belongsTo(models.tx_status);
            }
        }
    });

    return tx;
};

