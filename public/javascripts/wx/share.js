define(['lib/j', 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js'], function (jq, wx) {
    // 获取签名
    var wxDataHref = window.location.href;
    //wxDataHref = wxDataHref.replace(/#.*/, '');
    //wxDataHref = wxDataHref.replace(/\?.*/g, '');
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

    // 开始部署微信相关功能
    function deploy(data, config) {
        wx.config({
            debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: data.appid, // 必填，公众号的唯一标识
            timestamp: data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonce, // 必填，生成签名的随机串
            signature: data.signature,// 必填，签名，见附录1
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ']
        });

        var sImgurl = 'http://f4.sjbly.cn/f15/0522/iegi/cs.jpg';
        wx.ready(function () {
            //监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
            wx.onMenuShareAppMessage({
                title: '带上咖啡走世界',
                desc: '谁说旅行就一定狼狈？世界邦旅行网让你在旅途中也能随时享用一杯精品手冲咖啡。',
                link: 'http://www.baidu.com',
                imgUrl: sImgurl,
                success:function () {
                }
            });

            //监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
            wx.onMenuShareTimeline({
                title: '谁说旅行就一定狼狈？世界邦旅行网让你在旅途中也能随时享用一杯精品手冲咖啡。',
                link: 'http://www.baidu.com',
                imgUrl: sImgurl,
                success:function(){
                }
            });
        });
    };
});
