var AV = require('leanengine');
var Match = AV.Object.extend('Match');

function log(item) {
    console.log('>>', item)
}
var example = {
    contact: '111',
    group: 'aaa',
    seat: 'bbb',
    time: 'ccc',
    address: {
        detail: 'ddd',
        latitude: 34234,
        longitude: 111
    },
    creatorInfo: {
        avatar: 'dsfsdfsd',
        gender: 1,
        nickname: 'safsdfdg',
        location: {
            latitude: 34234,
            longitude: 111
        }
    },
    remark: 'eee',
    groupRange: [18, 100],
    creatorLocation: {
        latitude: 34234,
        longitude: 111
    },
    date: 2354254564365747
};
AV.Cloud.define('createMatch', function(request) {
    log(request.params)
    const params = request.params;
    // log(request.currentUser)
    const creator = AV.Object.createWithoutData('_User', request.currentUser.id);
    var match = new Match();
    var baseInfo = {
        contact: params.contact, // 联系方式
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
    // 创建者位置信息
    const geoPoint = new AV.GeoPoint(params.creatorLocation.latitude, params.creatorLocation.longitude)
    match.set('whereCreated', geoPoint);
    // 时间
    const date = new Date(params.date);
    match.set('date', date);
    return match.save()
        .then(function(_match) {
            return {
                result: true,
                msg: '创建成功'
            };
        }, function(error) {
            throw new AV.Cloud.Error('创建失败', { code: 400 });;
        });
});