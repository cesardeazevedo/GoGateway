angular.module('pay.tx.controllers')
.controller('ListTXController', ListTXController);

function ListTXController($scope, Socket){
    Socket.emit('tx:list');
    Socket.on('tx:list:response', function(data){
        console.log(data);
        $scope.transactions = data;
    });
}
