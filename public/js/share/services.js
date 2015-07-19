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
