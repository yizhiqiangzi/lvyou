//专门用作数据分析


const router = require('@koa/router')()
const {

} = require('@/models/collection-pc')
const {
    modelUser,
    modelArticle,
    modelLike
} = require('@/models/collection')
const {

} = require('@/config/valiData')
const { Auth } = require('@/token/auth')
const moment = require('moment')
moment.locale('zh-cn')

// 累计注册用户;昨日新增用户;发布游记数量;今日发布游记
router.get('/userAnalysis', new Auth().m, async ctx => {
    // 累计注册用户;
    const userCount = await modelUser.countDocuments()
    // 昨日新增用户;
    // 获取昨天零点的时间戳
    const yesterdayZero = moment().subtract(1, 'days').startOf('day').unix() * 1000
    // 获取今天零点的时间戳
    const todayZero = moment().startOf('day').unix() * 1000
    const newUserCount = await modelUser.countDocuments({
        uid: { $gte: yesterdayZero, $lte: todayZero }
    })
    // 发布游记数量
    const travelsCount = await modelArticle.countDocuments()
    // 今日发布游记
    const theSameDay = moment().utcOffset(8).format('YYYY-MM-DD')
    const theSameDayTCount = await modelArticle.countDocuments(
        { time: theSameDay })
    const resObj = { userCount, newUserCount, travelsCount, theSameDayTCount }
    ctx.send('SUCCESS', 200, resObj)
})

// 用户性别占比
router.get('/getGenderRatio', new Auth().m, async ctx => {
    const res = await modelUser.aggregate([
        {
            $group: {
                _id: '$gender',
                count: { $sum: 1 }
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})

// 八大最感兴趣旅游城市排名:按游记点赞量多少来排序
router.get('/cityOfInterest', new Auth().m, async ctx => {
    const res = await modelLike.aggregate([
        {
            $group: {
                _id: '$article_id',
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: modelArticle.collection.name,
                localField: "_id",
                foreignField: '_id',
                as: 'article'
            }
        },
        { $unwind: '$article' },
        {
            $project: {
                _id: "$article._id",
                cover_image: "$article.cover_image",
                city: "$article.city",
                count: 1
            }
        },
        {//将同一城市的游记合并，统计点赞数量
            $group: {
                _id: "$city",
                _ids: { $addToSet: "$_id" },
                cover_image: { $addToSet: "$cover_image" },
                count: { $sum: "$count" }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 8
        },
        {
            $project: {
                _id: 0,
                city: "$_id",
                cover_image: { $arrayElemAt: ["$cover_image", 0] },
                count: 1
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})

// 词云图
router.get('/wordCloud', async ctx => {
    const res = await modelUser.aggregate([
        {
            $unwind: "$my_tags"
        },
        {
            $group: {
                _id: "$my_tags",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                city: "$_id",
                count: 1
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})


module.exports = router.routes()
