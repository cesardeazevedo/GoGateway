module.exports = function(sequelize, DataTypes){

    var tx_status = sequelize.define('tx_status', {
        name: DataTypes.STRING
    }, {
        timestamps   : false
      , tableName    : 'tx_status'
      , classMethods: {
            associate: function(models){
                tx_status.hasOne(models.tx, {
                    foreignKey: { allowNull: false, defaultValue: 1 }
                });
            }
        }
    });

    return tx_status;
};
