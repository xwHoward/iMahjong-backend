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
    log(`getNearbyMatches('${params.latitude}','${params.longitude}')`)
    var query = new AV.Query('Match');
    var point = new AV.GeoPoint(params.latitude, params.longitude);
    query.withinKilometers('whereCreated', point, 10.0);
    return query.find()
        .then(function(results) {
            var nearbyMatches = results.map(el => {
                let match = el.get('baseInfo')
                Object.assign(match, { id: el.id })
                return match
            });
            return {
                isSuccess: true,
                data: nearbyMatches,
                total: nearbyMatches.length
            };
        }, function(error) {
            return {
                isSuccess: false,
                msg: '获取附近组局失败'
            };
        });
});

// 获取附近的局
AV.Cloud.define('getFilteredMatches', function(request) {
    const { filter, filterParams } = request.params;
    if (filter === undefined) {
        return {
            isSuccess: false,
            msg: '缺少参数'
        };
    }
    log(`getFilteredMatches('${filter}','${filterParams.toString()}')`)
    var query = new AV.Query('Match');
    // query.select(['id', 'baseInfo']);
    if (filter === 'address') {
        var point = new AV.GeoPoint(filterParams.latitude, filterParams.longitude);
        query.withinKilometers('whereCreated', point, 20.0);
    } else if (filter === 'time') {
        query.greaterThanOrEqualTo('startAt', new Date());
        query.ascending('startAt', new Date());
    } else if (filter === 'group') {
        // const teenagers = [18, 25];
        // const youths = [26, 30];
        // const middleAged = [31, 45];
        // const elders = [46, 99];
        // const all = [18, 99];
        // query.containsAll('groupRange', teenagers);
        // query.containsAll('groupRange', youths);
        // query.containsAll('groupRange', middleAged);
        // query.containsAll('groupRange', elders);
        // query.containsAll('groupRange', teenagers);
    }
    return query.find()
        .then(function(results) {
            var nearbyMatches = results.map(el => {
                let match = el.get('baseInfo')
                Object.assign(match, { id: el.id })
                return match
            });
            return {
                isSuccess: true,
                data: nearbyMatches,
                total: nearbyMatches.length
            };
        }, function(error) {
            return {
                isSuccess: false,
                msg: '获取附近组局失败'
            };
        });
});

// 获取局详情
AV.Cloud.define('getMatchDetail', function(request) {
    log('getMatchDetail()')
    const params = request.params;
    if (params.matchId === undefined) {
        return {
            isSuccess: false,
            msg: '缺少参数'
        };
    }
    var query = new AV.Query('Match');
    return query.get(params.matchId)
        .then(function(match) {
            // 成功获得实例
            return {
                isSuccess: true,
                data: match.get('baseInfo')
            };
        }, function(error) {
            // 异常处理
            return {
                isSuccess: false,
                msg: '获取对局详情失败'
            };
        });
});

// 组局
AV.Cloud.define('createMatch', function(request) {
    log('createMatch()')
    const params = request.params;
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
    // formId
    match.set('formId', params.formId);
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
    match.set('startAt', new Date(params.startAt));
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