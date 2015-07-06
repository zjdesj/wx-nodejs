define(['lib/j', 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js'], function (jq, wx) {
    return function (methodArray, callback) {
        // 获取card签名
        var wxDataHref = window.location.href;

        $.ajax({
            url: '/node/signature',
            type: 'GET',
            data: {'url': wxDataHref},
            success: function (data) {
                console.log(data);
                deploy(data);
            },
            error: function (err) {
                alert(JSON.stringify(err));
            }
        });

        var me = this;
        // 开始部署微信相关功能
        function deploy(data, config) {
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: data.appid, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonce, // 必填，生成签名的随机串
                signature: data.signature,// 必填，签名，见附录1
                jsApiList: methodArray
            });

            wx.ready(function () {
                callback($, wx);
            });
        };
    }
});
