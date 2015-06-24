var path = require('path');
// 从外部加载app的配置信息
var postData = require(path.join(__dirname, '/wxPost')).postData;
var appInfo = require(path.join(__dirname, '/appInfo'));
var wxTicket = require(path.join(__dirname, '/wxTicket'));

var getLogo = function (data, callback) {
    postData('https://api.weixin.qq.com/cgi-bin/media/uploadimg', data, function (data) {
        if (data.url) {
            callback(url);
        } else {
            callback();
        }
    });
};

var createCardTest = function (callback) {
    var data = { 
        "card": {
            "card_type": "GROUPON",
            "groupon": {
                "base_info": {
                    "logo_url": 
                        "http://mmbiz.qpic.cn/mmbiz/iaL1LJM1mF9aRKPZJkmG8xXhiaHqkKSVMMWeN3hLut7X7hicFNjakmxibMLGWpXrEXB33367o7zHN0CwngnQY7zb7g/0",
                    "brand_name":"海底捞",
                    "code_type":"CODE_TYPE_TEXT",
                    "title": "132元双人火锅套餐",
                    "sub_title": "周末狂欢必备",
                    "color": "Color010",
                    "notice": "使用时向服务员出示此券",
                    "service_phone": "020-88888888",
                    "description": "不可与其他优惠同享\n如需团购券发票，请在消费时向商户提出\n店内均可使用，仅限堂食",
                    "date_info": {
                        "type": 1,
                        "begin_timestamp": 1397577600 ,
                        "end_timestamp": 1442678400
                    },
                    "sku": {
                        "quantity": 500000
                    },
                    "get_limit": 3,
                    "use_custom_code": false,
                    "bind_openid": false,
                    "can_share": true,
                    "can_give_friend": true,
                    "location_id_list" : [123, 12321, 345345],
                    "custom_url_name": "立即使用",
                    "custom_url": "http://www.qq.com",
                    "custom_url_sub_title": "6个汉字tips",
                    "promotion_url_name": "更多优惠",
                    "promotion_url": "http://www.qq.com",
                    "source": "大众点评"   
                },
                "deal_detail": "以下锅底2选1（有菌王锅、麻辣锅、大骨锅、番茄锅、清补凉锅、酸菜鱼锅可选）：\n大锅1份 12元\n小锅2份 16元 "
            }
        }
    };
    wxTicket.getAccessToken(function (access_token) {
        postData('https://api.weixin.qq.com/card/create?access_token=' + access_token, data, function (msg) {
            callback(msg);
        });
    });
};

var createCard = function (data, callback) {
    wxTicket.getAccessToken(function (access_token) {
        postData('https://api.weixin.qq.com/card/create?access_token=' + access_token, data, function (msg) {
            callback(msg);
        });
    });
};

module.exports = {
    createCard: createCard,
    createCard: createCardTest
};
