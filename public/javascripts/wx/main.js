requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '/node/js/wx',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: '../lib'
    }
});
// Start the main app logic.
requirejs(['base', 'cardSign', 'card'], function (base, sign, card) {
    base(['openCard', 'chooseCard', 'addCard'], function ($, wx) {
        $('button').on('click', function (){
            alert('获取优惠');
            sign(function (signature) {
                console.log(signature);
                card($, wx, signature);
            });
        });
    });
});

/*
requirejs(['card'], function (card) {
    card(function ($, wx) {
        console.log('bbb');
    });    
});
*/
