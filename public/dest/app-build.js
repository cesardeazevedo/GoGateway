angular.module('pay',
    ['ngInput'
    ,'oitozero.ngSweetAlert'
    ,'ja.qr'
    ,'angularMoment'
    ,'720kb.tooltips'
    ,'pay.tx'
    ,'pay.share.services.socket'
    ]);

$(function(){
    $('table').each(function() {
        if($(this).find('thead').length > 0 && $(this).find('th').length > 0) {
            // Clone <thead>
            var $w = $(window),
            $t     = $(this),
            $thead = $t.find('thead').clone(),
            $col   = $t.find('thead, tbody').clone();

            // Add class, remove margins, reset width and wrap table
            $t
            .addClass('sticky-enabled')
            .css({
                margin: 0,
                width: '100%'
            }).wrap('<div class="sticky-wrap" />');

            if($t.hasClass('overflow-y')) $t.removeClass('overflow-y').parent().addClass('overflow-y');

            // Create new sticky table head (basic)
            $t.after('<table class="sticky-thead" />');

            // If <tbody> contains <th>, then we create sticky column and intersect (advanced)
            if($t.find('tbody th').length > 0) {
                $t.after('<table class="sticky-col" /><table class="sticky-intersect" />');
            }

            // Create shorthand for things
            var $stickyHead  = $(this).siblings('.sticky-thead'),
            $stickyCol   = $(this).siblings('.sticky-col'),
            $stickyInsct = $(this).siblings('.sticky-intersect'),
            $stickyWrap  = $(this).parent('.sticky-wrap');

            $stickyHead.append($thead);

            $stickyCol
            .append($col)
            .find('thead th:gt(0)').remove()
            .end()
            .find('tbody td').remove();

            $stickyInsct.html('<thead><tr><th>'+$t.find('thead th:first-child').html()+'</th></tr></thead>');

            // Set widths
            var setWidths = function () {
                $t
                .find('thead th').each(function (i) {
                    $stickyHead.find('th').eq(i).width($(this).width());
                })
                .end()
                .find('tr').each(function (i) {
                    $stickyCol.find('tr').eq(i).height($(this).height());
                });

                // Set width of sticky table head
                $stickyHead.width($t.width());

                // Set width of sticky table col
                $stickyCol.find('th').add($stickyInsct.find('th')).width($t.find('thead th').width())
            },
            repositionStickyHead = function () {
                // Return value of calculated allowance
                var allowance = calcAllowance();

                // Check if wrapper parent is overflowing along the y-axis
                if($t.height() > $stickyWrap.height()) {
                    // If it is overflowing (advanced layout)
                    // Position sticky header based on wrapper scrollTop()
                    if($stickyWrap.scrollTop() > 0) {
                        // When top of wrapping parent is out of view
                        $stickyHead.add($stickyInsct).css({
                            opacity: 1,
                            top: $stickyWrap.scrollTop()
                        });
                    } else {
                        // When top of wrapping parent is in view
                        $stickyHead.add($stickyInsct).css({
                            opacity: 0,
                            top: 0
                        });
                    }
                } else {
                    // If it is not overflowing (basic layout)
                    // Position sticky header based on viewport scrollTop
                    if($w.scrollTop() > $t.offset().top && $w.scrollTop() < $t.offset().top + $t.outerHeight() - allowance) {
                        // When top of viewport is in the table itself
                        $stickyHead.add($stickyInsct).css({
                            opacity: 1,
                            top: $w.scrollTop() - $t.offset().top
                        });
                    } else {
                        // When top of viewport is above or below table
                        $stickyHead.add($stickyInsct).css({
                            opacity: 0,
                            top: 0
                        });
                    }
                }
            },
            repositionStickyCol = function () {
                if($stickyWrap.scrollLeft() > 0) {
                    // When left of wrapping parent is out of view
                    $stickyCol.add($stickyInsct).css({
                        opacity: 1,
                        left: $stickyWrap.scrollLeft()
                    });
                } else {
                    // When left of wrapping parent is in view
                    $stickyCol
                    .css({ opacity: 0 })
                    .add($stickyInsct).css({ left: 0 });
                }
            },
            calcAllowance = function () {
                var a = 0;
                // Calculate allowance
                $t.find('tbody tr:lt(3)').each(function () {
                    a += $(this).height();
                });

                // Set fail safe limit (last three row might be too tall)
                // Set arbitrary limit at 0.25 of viewport height, or you can use an arbitrary pixel value
                if(a > $w.height()*0.25) {
                    a = $w.height()*0.25;
                }

                // Add the height of sticky header
                a += $stickyHead.height();
                return a;
            };

            setWidths();

            $t.parent('.sticky-wrap').scroll($.throttle(250, function() {
                repositionStickyHead();
                repositionStickyCol();
            }));

            $w
            .load(setWidths)
            .resize($.debounce(250, function () {
                setWidths();
                repositionStickyHead();
                repositionStickyCol();
            }))
            .scroll($.throttle(250, repositionStickyHead));
        }
    });
});

angular.module('pay.share.services.socket', [])
.factory('Socket', Socket);

Socket.$inject = ['$rootScope', 'SweetAlert'];
function Socket($rootScope, SweetAlert){

    io = io.connect();

    return {

        on: function(event, callback){
            io.on(event, function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    callback.apply(io, args);
                });
            });
        }

        , emit: function(event, data, callback){
            io.emit(event, data, function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    if(callback)
                        callback.apply(io, args);
                });
            });
        }
    };
}

angular.module('pay.tx', [ 'pay.tx.controllers' ]);

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
