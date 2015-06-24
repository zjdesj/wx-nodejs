define(['lib/j'], function (jq) {
    return function (callback) {
        $.ajax({
            url: '/node/card-signature',
            type: 'GET',
            success: function (data) {
                callback(data);
            },
            error: function (err) {
                alert(JSON.stringify(err));
            }
        });
    }
});
