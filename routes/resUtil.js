var responseWithJson = function (res, data) {
    res.json(data);
};
var responseCrossDomain = function (res) {
    // 允许跨域异步获取
    res.set({
        "Access-Control-Allow-Origin": "*"
        ,"Access-Control-Allow-Methods": "POST,GET"
        ,"Access-Control-Allow-Credentials": "true"
    });
};
module.exports.responseWithJson = responseWithJson;
module.exports.responseCrossDomain = responseCrossDomain;
