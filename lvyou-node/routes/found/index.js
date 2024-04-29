const router = require('@koa/router')()
const {
    modelLocal,
    modelArticle,
    modelCity,
    modelCountry
} = require('@/models/collection')
const {
    Localtravels,
    Addressquerytravels,
    Chooseaddress
} = require('@/config/valiData')
const { Auth } = require('@/token/auth')
const moment = require('moment')
moment.locale('zh-cn')
const { looKup } = require('@/config/lookup')
const fs = require('fs')
const { log } = require('console')

// 导入当地玩法到数据库
router.get('/loacl-database', async ctx => {
    return false
    // const citydata = fs.readFileSync('F:/node/lvyou-node-v3/local.json', 'utf-8')//C:/Users/Administrator/Desktop/lvyou-node-v3/local.json
    // const res = JSON.parse(citydata)
    // await modelLocal.insertMany(res)
})

//获取当地玩法
router.get('/local-gameplay', async ctx => {
    const res = await modelLocal.find()
    ctx.send('SUCCESS', 200, res)
})

// 根据定位获取当地游记
router.get('/local-travel', async ctx => {
    const { page, address } = ctx.query
    Localtravels(page, address)
    const query = { $regex: address, $options: 'i' }
    const res = await modelArticle.aggregate([
        {
            $match: {
                $or: [
                    { city: query },
                    { address: query },
                    { province: query }
                ]
            }
        },
        { $skip: (page - 1) * 6 },
        { $limit: 6 },
        looKup().model_user,
        looKup().model_like,
        looKup().project
    ])
    ctx.send('SUCCESS', 200, res)
})

// 图片合集：查询选中的城市所有的游记图片
router.get('/addressImage', async ctx => {
    const { page, address } = ctx.query
    Localtravels(page, address)
    const query = { $regex: address, $options: 'i' }
    const res = await modelArticle.find({
        $or: [
            { city: query },
            { address: query },
            { province: query }
        ]
    })
        .skip((page - 1) * 10)
        .limit(10)
        .select('image')
        .lean()
    const imageData = res.flatMap(item => item.image)   //数组扁平化
    ctx.send('SUCCESS', 200, imageData)
})

// 当地玩法：按地址和游记分类关键词查询游记
router.get('/addressQueryTravels', async ctx => {
    const { address, keywords, page } = ctx.query
    Addressquerytravels(address, keywords, page)
    const query = { $regex: keywords, $options: 'i' }
    const res = await modelArticle.aggregate([
        {
            $match: {
                $and: [
                    { city: address },
                    {
                        $or: [
                            { title: query },
                            { content: query },
                            { tag: { $in: [keywords] } },
                        ]
                    }
                ]
            }
        },
        { $skip: (page - 1) * 6 },
        { $limit: 6 },
        looKup().model_user,
        looKup().model_like,
        looKup().project
    ])
    ctx.send('SUCCESS', 200, res)
})

// 导入选择城市界面的国家和城市
router.get('/country-database', async ctx => {
    return false
    // const citydata = fs.readFileSync('F:/node/lvyou-node-v3/city.json', 'utf-8')
    // const res = JSON.parse(citydata)
    // await modelCity.insertMany(res)
})

// 用户根据分类选择地址
router.get('/choose-address', async ctx => {
    const { type } = ctx.query
    Chooseaddress(type)
    if (type === 'AAA') {//点击了推荐
        // 去本月热门城市：6
        // 去当前月份月初和月末的时间戳
        const startOfMonth = moment().clone().startOf('month').unix();
        const endOfMonth = moment().clone().endOf('month').unix();
        const currentMonth = await modelArticle.aggregate([
            {
                $match: {
                    time_stamp: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: '$city',
                    count: { $sum: 1 },
                    image: { $first: "$cover_image.url" }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 6
            }
        ])
        // 自由行必去城市：前三个游记数量最多的
        const freedom = await modelArticle.aggregate([
            {
                $unwind: "$tag"
            },
            {
                $match: { tag: "自由行" }
            },
            {
                $group: {
                    _id: '$city',
                    count: { $sum: 1 },
                    image: { $first: "$cover_image.url" }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 3
            }
        ])
        // 取热度飙升的前三个旅游城市
        const heatCity = await modelArticle.aggregate([
            {
                $group: {
                    _id: '$city',
                    count: { $sum: 1 },
                    image: { $first: "$cover_image.url" }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 3
            }
        ])
        const resObj = { currentMonth, freedom, heatCity }
        ctx.send('SUCCESS', 200, resObj)
    } else {
        const res = await modelCity.find({ type }, { type: false })
        ctx.send('SUCCESS', 200, res)
    }
})

// 城市选择界面，进入页面获取左边的国家城市分类
router.get('/country-class', async ctx => {
    const res = await modelCountry.find()
    ctx.send('SUCCESS', 200, res)
})


module.exports = router.routes()