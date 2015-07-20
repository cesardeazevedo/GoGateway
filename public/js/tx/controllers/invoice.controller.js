angular.module('pay.tx.controllers', [])
.controller('InvoiceController', InvoiceController);

InvoiceController.$inject = ['$scope', '$compile', '$timeout', '$window', 'SweetAlert', 'Socket'];
function InvoiceController($scope, $compile, $timeout, $window, SweetAlert, Socket) {

    var wrapper = angular.element(document.querySelector('.wrapper'));
    var qrcode  = angular.element("<qr text='address' type-number='10' size='200' image='false'></qr>");

    Socket.emit('market');
    Socket.on('market:response', function(data){
        $scope.last = data.latest.currencies.USD.last;
    });

    Socket.emit('getWallet');

    Socket.on('error', function(error){
        SweetAlert.swal({
            title: error.status === 401 ? 'Unauthorized' : error.status
          , animation: "slide-from-top"
          , type: 'error'
        }, function(){
            fadeIn();
        });
    });

    $scope.pay = function() {

        fadeOut();

        SweetAlert.swal({
            title: "Pay with bitcoin"
          , text: "Waiting Payment...<hr><br><img id='loading' src='img/loading.gif'/><div id='qr'></div><span id='address'></span>"
          , html: true
          , animation: "slide-from-top"
          , imageUrl: '/img/bitcoin.png'
          , showCancelButton: true
          , showConfirmButton: false
        }, function(){
            fadeIn();
        });

        Socket.emit('address:create', { email: $scope.email, amount: $scope.amount });
        Socket.on('address:response', function(data){

            angular.element(document.querySelector('#loading')).addClass('animated zoomOut');

            $scope.address = data.address;

            //Append qr manually to sweet alert
            angular.element(document.querySelector('#qr')).append($compile(qrcode)($scope));
            //Display addres to sweet alert
            angular.element(document.querySelector('#address')).text($scope.address);

            //Register transaction
            var tx = {
                email: $scope.email
              , address: $scope.address
              , amount: $scope.amount / $scope.last
            };
            Socket.emit('tx:create', tx);
        });

        Socket.on('callback', function(data){
            console.log(data);
            if(data.address === $scope.address){
                fadeIn();
                swal.close();
                $timeout(function(){
                    $window.location.href = '/tx/list';
                }, 500);
            }
        });
    };

    function fadeOut(){
        qrcode.remove();
        wrapper.addClass('animated fadeOutUp');
    }

    function fadeIn(){
        wrapper.removeClass('animated fadeOutUp');
        wrapper.addClass('animated fadeInDown');
    }
}

