//小程序首页


const router = require('@koa/router')()
const {
    modelDailyrecom,
    modelFourtravel
} = require('@/models/collection-pc')
const {
    modelUser,
    modelArticle,
    modelHometab
} = require('@/models/collection')
const {
    Resreturn,
    Clssifytravels
} = require('@/config/valiData')
const { Auth } = require('@/token/auth')
const { gentoken } = require('@/token/jwt')
const moment = require('moment')
moment.locale('zh-cn')
const { looKup, looKupRecommend } = require('@/config/lookup')
const fs = require('fs')


// 获取小程序端顶部每日推荐游记
router.get('/wxGainDailyRecom', async ctx => {
  const { page } = ctx.query
  //校验
  Resreturn(page)
  const res = await modelDailyrecom.find({}, {//调用每日推荐的游记  ,除了两个时间不返回,其他的都要返回
      time: false, timestamp: false
  })
      .sort({ timestamp: -1 })  //按照时间戳进行倒序排列
      .skip((page - 1) * 1)   //进行分页
      .limit(1)//每次都返回一条
  // 获取数据总条数----用于下拉刷新时循环展示
  const count = await modelDailyrecom.countDocuments()
  const resData = { data: res, count }
  ctx.send('SUCCESS', 200, resData)
})


// 获取小程序端四个游记推荐
router.get('/wxGainRecomTravel', async ctx => {
  const res = await modelFourtravel.aggregate([
      { $sort: { timestamp: -1 } },
      looKupRecommend().model_Article,
      looKupRecommend().model_reco_user,
      { $unwind: '$articleData' },
      { $unwind: '$userData' },
      {
          $project: {
              "_id": 1,
              "imageUrl": 1,
              "travel_id": 1,
              "title": "$articleData.title",
              "address": "$articleData.address",
              "fileType": "$articleData.fileType",
              "nickname": "$userData.nickname",
              "avatarUrl": "$userData.avatarUrl"  //作者头像
          }
      }
  ])
  ctx.send('SUCCESS', 200, res)
})


// 获取小程序段10个游记分类
router.get('/recomm-travel', async ctx => {
  const res = await modelHometab.find({})    //查询全部返回
  ctx.send('SUCCESS', 200, res)
})


// 导入10个游记分类到数据库
router.get('/hometab-database', async ctx => {
  return false
})

// 游记分类切换tab
router.get('/travelogue-class', async ctx => {
  const res = moment().utcOffset(8).format('M')
  const arr = [
      { name: '推荐', key: '001' },
      { name: `${res}月去哪`, key: '002' },
      { name: '露营', key: '003' },
      { name: '古镇漫游', key: '004' },
      { name: '徒步骑行', key: '005' },
      { name: '躺酒店', key: '006' },
      { name: '宝藏小城', key: '007' },
      { name: '亲子游', key: '008' },
      { name: '博物馆', key: '009' },
      { name: '摄影', key: '010' },
      { name: '海景', key: '011' },
  ]
  ctx.send('SUCCESS', 200, arr)
})

//获取首页瀑布流游记
router.get('/user-travels', async ctx => {
  const { keywords, page } = ctx.query
  Clssifytravels(keywords, page)
  let match = {}
  if (keywords === '001') {
      match = {}   //表示选择推荐栏的话，就是数据库中的所有数据
  } else if (keywords === '002') {
      // 取当前月份月初和月末的时间戳
      const startOfMonth = moment().clone().startOf('month').unix();
      const endOfMonth = moment().clone().endOf('month').unix();
      match = {
          time_stamp: {
              $gte: startOfMonth,
              $lte: endOfMonth
          }
      }
  } else {
      const arr = [
          { name: '露营', key: '003' },
          { name: '古镇漫游', key: '004' },
          { name: '徒步骑行', key: '005' },
          { name: '躺酒店', key: '006' },
          { name: '宝藏小城', key: '007' },
          { name: '亲子游', key: '008' },
          { name: '博物馆', key: '009' },
          { name: '摄影', key: '010' },
          { name: '海景', key: '011' },
      ]
      const result = arr.filter(item => item.key === keywords)     //根据key进行过滤
      match = { tag: { $in: [result[0].name] } }
  }
  const res = await modelArticle.aggregate([
      { $match: match },
      { $sort: { time_stamp: -1 } },
      { $skip: (page - 1) * 6 },
      { $limit: 6 },
      looKup().model_user,
      looKup().model_like,
      looKup().project
  ])
  ctx.send('SUCCESS', 200, res)
})


// 登录校验
router.get('/check-login', new Auth().m, async ctx => {
  const res = await modelUser.find({ uid: ctx.auth.uid })
  if (res.length > 0) {
      ctx.send()
  } else {
      ctx.send('SUCCESS', 401)
  }
})


// 根据游记分类关键词查询游记
router.get('/clAssifyTravels', async ctx => {
  const { keywords, page } = ctx.query
  Clssifytravels(keywords, page)
  const query = { $regex: keywords, $options: 'i' }
  const res = await modelArticle.aggregate([
      {
          $match: {
              $or: [
                  { title: query },
                  { content: query },
                  { tag: { $in: [keywords] } }
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





module.exports = router.routes()