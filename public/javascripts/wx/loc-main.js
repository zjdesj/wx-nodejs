requirejs.config({
    baseUrl: '/node/js/wx',
    paths: {
        lib: '../lib'
    }
});
requirejs(['base'], function (base) {
    base(['openLocation', 'getLocation'], function ($, wx) {
        wx.getLocation({
            success: function (res) {
                alert('res latitude :  ' +  res.latitude);
                wx.openLocation({
                    latitude: res.latitude, // 纬度，浮点数，范围为90 ~ -90
                    longitude: res.longitude, // 经度，浮点数，范围为180 ~ -180。
                    name: '12345', // 位置名
                    address: 'test test', // 地址详情说明
                    scale: 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
                    infoUrl: 'http://wwww.baidu.com' // 在查看位置界面底部显示的超链接,可点击跳转
                });
            }
        });
    });
});

