define(function () {
    return function ($, wx, signObj) {
        /*
        $('button').on('click', function () {
            alert('获取优惠');
        });
        */
        wx.addCard({
            cardList: [{
                cardId: 'pPeU8uHMB-ibFXmBjloSrKE8CDqQ',
                cardExt: JSON.stringify(signObj)
            }],
            success: function (res)  {
                alert('已经添加卡券：' + JSON.stringify(res.cardList));
            }
        });
    }
});
