angular.module('pay.tx.controllers')
.controller('ListTXController', ListTXController);

ListTXController.$inject = ['$scope', '$compile', '$timeout', '$window', 'Socket', 'SweetAlert'];
function ListTXController($scope, $compile, $timeout, $window, Socket, SweetAlert){


    Socket.emit('market');
    Socket.on('market:response', function(data){
        $scope.last = data.latest.currencies.USD.last;
        Socket.emit('tx:list');
        Socket.on('tx:list:response', function(data){
            console.log(data);
            $scope.transactions = data;
        });
    });

    $scope.pay = function(address) {

        var qrcode  = angular.element("<qr text='address' type-number='10' size='200' image='false'></qr>");

        $scope.address = address;

        SweetAlert.swal({
            title: "Pay with bitcoin"
          , text: "Waiting Payment...<hr><br><div id='qr'></div><span id='address'></span>"
          , html: true
          , animation: "slide-from-top"
          , imageUrl: '/img/bitcoin.png'
          , showCancelButton: true
          , showConfirmButton: false
        });

        setTimeout(function(){
            //Append qr manually to sweet alert
            angular.element(document.querySelector('#qr')).append($compile(qrcode)($scope));
            //Display addres to sweet alert
            angular.element(document.querySelector('#address')).text($scope.address);
        });

        Socket.on('callback', function(data){
            if(data.address === $scope.address)
                swal.close();
        });
    };
}
