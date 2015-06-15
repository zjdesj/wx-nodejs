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
requirejs(['share'], function (share) {
  //jQuery, canvas and the app/sub module are all
  //loaded and can be used here now.
});
