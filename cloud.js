var AV = require('leanengine');
var Match = AV.Object.extend('Match');

function log(item) {
    console.log('>>', item)
}

// 获取附近的局
AV.Cloud.define('getNearbyMatches', function(request) {
    const params = request.params;
    if (params.latitude === undefined || params.longitude === undefined) {
        return {
            isSuccess: false,
            msg: '缺少参数'
        };
    }
    var query = new AV.Query('Match');
    var point = new AV.GeoPoint(params.latitude, params.longitude);
    query.withinKilometers('whereCreated', point, 2.0);
    return query.find()
        .then(function(results) {
            var nearbyMatches = results;
            return {
                isSuccess: true,
                data: nearbyMatches
            };
        }, function(error) {});
});

// 组局
AV.Cloud.define('createMatch', function(request) {
    log(request.params)
    const params = request.params;
    // log(request.currentUser)
    const creator = AV.Object.createWithoutData('_User', request.currentUser.id);
    var match = new Match();
    var baseInfo = {
        contact: params.contact, // 联系方式
        head: params.head, // 头像
        group: params.group, // 组局对象
        seat: params.seat, // 组局人数
        time: params.time, // 组局时间
        address: params.address, // 组局地址
        remark: params.remark, //  备注
        creatorInfo: params.creatorInfo, // 组局者信息
    };
    // 基础信息
    match.set('baseInfo', baseInfo);
    // 创建者
    match.set('creator', creator);
    // 组局对象
    match.set('groupRange', params.groupRange);
    // 组局人数
    match.set('seats', params.seats);
    // 创建者位置信息
    const geoPoint = new AV.GeoPoint(params.creatorLocation.latitude, params.creatorLocation.longitude)
    match.set('whereCreated', geoPoint);
    // 时间
    match.set('_time', params._time);
    return match.save()
        .then(function(_match) {
            return {
                isSuccess: true,
                msg: '组局成功'
            };
        }, function(error) {
            // throw new AV.Cloud.Error('创建失败', { code: 400 });
            return {
                isSuccess: false,
                msg: '组局失败'
            };
        });
});