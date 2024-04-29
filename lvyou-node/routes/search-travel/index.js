//专门用作游记的搜索

const router = require('@koa/router')()
const {
    modelArticle,
    modelUser,
    modelLike,
    modelCollection,
    modelComment,
    modelConcern
} = require('@/models/collection')
const {
    Searchtravel,
    Clssifytravels
} = require('@/config/valiData')
const { Auth } = require('@/token/auth')
const { Authuid } = require('@/token/auth_uid')
const moment = require('moment')
moment.locale('zh-cn')
const mongoose = require('mongoose')
const { looKup } = require('@/config/lookup')




// 获取前十个热门旅游城市：小程序和后台管理公用
router.get('/hot-city', async ctx => {
  const res = await modelArticle.aggregate([
      {
          $group: {//分组
              _id: '$city',//根据city来分组   根据city的数量
              count: { $sum: 1 },
              image: { $first: "$cover_image.url" }
          }
      },
      {
          $sort: { count: -1 }
      },
      { $limit: 10 }  //只取10个
  ])
  ctx.send('SUCCESS', 200, res)
})


// 获取搜索关键词:游记和作者
router.get('/search-travel', async ctx => {
  const { keywords } = ctx.query
  Searchtravel(keywords)
  if (keywords.trim() === '') {
      ctx.send('SUCCESS', 200, [])
      return false
  }
  const query = { $regex: keywords, $options: 'i' }
  // 匹配游记表
  const articles = await modelArticle.find({
      $or: [
          { city: query },
          { address: query },
          { province: query },
          { tag: { $in: [keywords] } },
      ]
  }).select('city address tag')
  // 匹配用户表
  const users = await modelUser.find({
      $or: [
          { uid: query },
          { nickname: query }
      ]
  }).select('nickname')
  const results = [...articles, ...users].flatMap(item => {
      const { city, address, tag, nickname } = item
      const newtag = tag ? tag : []
      return [city, address, ...newtag, nickname].filter((v) => v)
  }).reduce((acc, cur) => {
      if (!acc.includes(cur)) {
          acc.push(cur)
      }
      return acc
  }, [])
  ctx.send('SUCCESS', 200, results)
})



// 根据关键词搜索游记
router.get('/paging-search-result', async ctx => {
  const { keywords, page } = ctx.query
  Clssifytravels(keywords, page)
  const query = { $regex: keywords, $options: 'i' }   //mongose  提供的模糊查询
  const res = await modelArticle.aggregate([
      {
          $match: {
              $or: [
                  { title: query },
                  { content: query },
                  { city: keywords },
                  { address: keywords },
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



// 根据关键词搜索作者
router.get('/search-author', new Authuid().m, async ctx => {
  const { keywords, page } = ctx.query
  Clssifytravels(keywords, page)
  const query = { $regex: keywords, $options: 'i' }
  const myUid = ctx.auth.uid ? ctx.auth.uid : 'm1'
  const res = await modelUser.aggregate([
      {
          $match: {
              $or: [{ uid: query }, { nickname: query }]
          }
      },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
      {
          $lookup: {//关联关注表，获取作者的粉丝数量
              from: modelConcern.collection.name,
              localField: 'uid',
              foreignField: 'im_concerned_uid',
              as: 'concernnedUsers'
          }
      },
      {
          $project: {
              _id: 1,
              avatarUrl: 1,
              nickname: 1,
              uid: 1,
              numberOfFans: { $size: "$concernnedUsers" },
              concernedUser: {
                  $in: [myUid, "$concernnedUsers.user_uid"]
              }
          }
      }
  ])
  ctx.send('SUCCESS', 200, res)
})




module.exports = router.routes()