const router = require('@koa/router')()
const {
    modelCompanion,
    modelSignup,
    modelUser
} = require('@/models/collection')
const {
    InitiatingPartner,
    SignupPartner,
    CompanionQuery,
    CompanionDetails,
    Resreturn,
    Commentget
} = require('@/config/valiData')
const { Auth } = require('@/token/auth')
const mongoose = require('mongoose')
const moment = require('moment')
moment.locale('zh-cn')
const { looKup, looKupCompanion } = require('@/config/lookup')
moment.updateLocale('zh-cn', {
    relativeTime: {
        future: '%s内',
        past: '%s前',
        s: '刚刚',
        ss: '%d秒前',
        m: '1分钟',
        mm: '%d分钟',
        h: '1小时',
        hh: '%d小时',
        d: '1天',
        dd: '%d天',
        w: '1周',
        ww: '%d周',
        M: '1个月',
        MM: '%d个月',
        y: '1年',
        yy: '%d年'
    },
});



// 发起结伴
router.post('/initiating-partner', new Auth().m, async ctx => {
  const {
      description,
      image,
      city,
      full_address,
      companion_time,
      number_of_people
  } = ctx.request.body//接受前端传过来的值
  InitiatingPartner(
      description,
      image,
      city,
      full_address,
      companion_time,
      number_of_people
  )
  const companion_timestamp = moment(companion_time).unix()
  await modelCompanion.create({
      uid: ctx.auth.uid,
      description,
      image,
      city,
      full_address,
      companion_time,
      number_of_people,
      companion_timestamp
  })
  ctx.send()
})


// 报名结伴
router.post('/sign-up-partner', new Auth().m, async ctx => {
  const {
      signup_id,
      contact_inform,
      gender,
      introduce
  } = ctx.request.body
  SignupPartner(signup_id, contact_inform, gender, introduce)
  await modelSignup.create({
      user_uid: ctx.auth.uid,
      signup_id,
      contact_inform,
      gender,
      introduce
  })
  ctx.send()
})


// 获取结伴城市
router.get('/companion-city', async ctx => {
  const res = await modelCompanion.aggregate([
      {
          $group: { _id: "$city" }
      },
      {
          $project: { _id: 0, city: "$_id" }
      }
  ])
  res.unshift({ city: "推荐" })
  ctx.send('SUCCESS', 200, res)
})


// 首页筛选活动
router.get('/companion-query', async ctx => {
  const { city, keyword, page } = ctx.query
  CompanionQuery(city, keyword, page)
  // 本月月初和月末的时间戳
  const startOfMonth = moment().clone().startOf('month').unix()
  const endOfMonth = moment().clone().endOf('month').unix()
  // 下月月初和月末的时间戳
  const startOfNextMonth = moment().clone().add(1, 'month').startOf('month').unix()
  const endOfNextMonth = moment().clone().add(1, 'month').endOf('month').unix()
  var match = {}
  if (city === '推荐' && keyword === '全部') {
      match = {}
  } else if (city === '推荐' && keyword === '本月出发') {
      match = {
          companion_timestamp: {
              $gte: startOfMonth,
              $lte: endOfMonth
          }
      }
  } else if (city === '推荐' && keyword === '下月出发') {
      match = {
          companion_timestamp: {
              $gte: startOfNextMonth,
              $lte: endOfNextMonth
          }
      }
  } else if (city != '推荐' && keyword === '全部') {
      match = { city }
  } else if (city != '推荐' && keyword === '本月出发') {
      match = {
          city,
          companion_timestamp: {
              $gte: startOfMonth,
              $lte: endOfMonth
          }
      }
  } else if (city != '推荐' && keyword === '下月出发') {
      match = {
          city,
          companion_timestamp: {
              $gte: startOfNextMonth,
              $lte: endOfNextMonth
          }
      }
  }
  const res = await modelCompanion.aggregate([
      { $match: match },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * 6 },
      { $limit: 6 },
      looKupCompanion().model_user,
      looKupCompanion().model_signup,
      {
          $project: {
              _id: 1,
              description: 1,
              image: 1,
              city: 1,
              full_address: 1,
              companion_time: 1,
              number_of_people: 1,
              timestamp: 1,
              "author_data.nickname": 1,
              "author_data.avatarUrl": 1,
              signups: { $size: '$signups' }
          }
      }
  ])
  // 处理相对时间
  res.forEach(item => {
      const diff = moment().diff(item.timestamp * 1000, 'seconds')
      item.timestamp = diff < 60 ? `${diff}秒前` : moment(item.timestamp * 1000).fromNow()
  })
  ctx.send('SUCCESS', 200, res)
})



// 活动详情页
router.get('/companion-details', async ctx => {
  const { id } = ctx.query
  CompanionDetails(id)
  const res = await modelCompanion.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      looKupCompanion().model_signup,
      looKupCompanion().model_user,
      {
          $lookup: {//关联用户表，获取报名用户的头像昵称
              from: modelUser.collection.name,
              localField: 'signups.user_uid',
              foreignField: 'uid',
              as: 'user_info'
          }
      },
      {
          $project: {//指定输出的数据
              _id: 1,
              description: 1,
              image: 1,
              city: 1,
              full_address: 1,
              companion_time: 1,
              number_of_people: 1,
              timestamp: 1,
              "author_data.nickname": 1,
              "author_data.avatarUrl": 1,
              "signups": {
                  $map: {
                      input: "$signups",
                      as: "signup",
                      in: {
                          "gender": "$$signup.gender",
                          "avatarUrl": { $arrayElemAt: ["$user_info.avatarUrl", { $indexOfArray: ["$user_info.uid", "$$signup.user_uid"] }] },
                          "nickname": { $arrayElemAt: ["$user_info.nickname", { $indexOfArray: ["$user_info.uid", "$$signup.user_uid"] }] },
                      }
                  }
              }
          }
      }
  ])
  // 处理相对时间
  res.forEach(item => {
      const diff = moment().diff(item.timestamp * 1000, 'seconds')
      item.timestamp = diff < 60 ? `${diff}秒前` : moment(item.timestamp * 1000).fromNow()
  })
  ctx.send('SUCCESS', 200, res)
})

// 查询是否已报名
router.get('/signup-query', new Auth().m, async ctx => {
  const { id } = ctx.query
  CompanionDetails(id)
  const res_a = await modelCompanion.find({
      _id: id, uid: ctx.auth.uid
  })
  const res_b = await modelSignup.find({
      signup_id: id, user_uid: ctx.auth.uid
  })
  let queryRes = ''
  if (res_a.length > 0) {
      //用户自己发表的
      queryRes = '001'
  } else {
      if (res_b.length > 0) {
          queryRes = '002'//已报名
      } else {
          queryRes = '003'//未报名
      }
  }
  ctx.send('SUCCESS', 200, queryRes)
})

// 我参与的活动
router.get('/par-in-activities', new Auth().m, async ctx => {
  const { page } = ctx.query
  Resreturn(page)
  const res = await modelSignup.aggregate([
      { $match: { user_uid: ctx.auth.uid } },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * 6 },
      { $limit: 6 },
      looKupCompanion().model_companion,
      {
          $lookup: {//关联报名表，计算报名人数
              from: modelSignup.collection.name,
              localField: 'my_companion._id',
              foreignField: 'signup_id',
              as: 'signpCount'
          }
      },
      {
          $lookup: {//关联用户表，获取作者的头像，昵称
              from: modelUser.collection.name,
              localField: 'my_companion.uid',
              foreignField: 'uid',
              as: 'author_data'
          }
      },
      { $unwind: "$my_companion" },//展开活动表
      {
          $project: {
              _id: "$my_companion._id",
              description: "$my_companion.description",
              image: "$my_companion.image",
              city: "$my_companion.city",
              full_address: "$my_companion.full_address",
              companion_time: "$my_companion.companion_time",
              number_of_people: "$my_companion.number_of_people",
              timestamp: "$my_companion.timestamp",
              "author_data.nickname": 1,
              "author_data.avatarUrl": 1,
              count: { $size: '$signpCount' }//计算报名人数
          }
      }
  ])
  // 处理相对时间
  res.forEach(item => {
      const diff = moment().diff(item.timestamp * 1000, 'seconds')
      item.timestamp = diff < 60 ? `${diff}秒前` : moment(item.timestamp * 1000).fromNow()
  })
  ctx.send('SUCCESS', 200, res)
})

// 我发起的活动
router.get('/my-in-activities', new Auth().m, async ctx => {
  const { page } = ctx.query
  Resreturn(page)
  const res = await modelCompanion.aggregate([
      { $match: { uid: ctx.auth.uid } },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * 6 },
      { $limit: 6 },
      looKupCompanion().model_user,
      looKupCompanion().model_signup,
      {
          $project: {
              _id: 1,
              description: 1,
              image: 1,
              city: 1,
              full_address: 1,
              companion_time: 1,
              number_of_people: 1,
              timestamp: 1,
              "author_data.nickname": 1,
              "author_data.avatarUrl": 1,
              count: { $size: '$signups' }//计算报名人数
          }
      }
  ])
  // 处理相对时间
  res.forEach(item => {
      const diff = moment().diff(item.timestamp * 1000, 'seconds')
      item.timestamp = diff < 60 ? `${diff}秒前` : moment(item.timestamp * 1000).fromNow()
  })
  ctx.send('SUCCESS', 200, res)
})

// 管理成员
router.get('/managing-member', new Auth().m, async ctx => {
  const { id, page } = ctx.query
  Commentget(id, page)
  const res = await modelSignup.aggregate([
      { $match: { signup_id: new mongoose.Types.ObjectId(id) } },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * 6 },
      { $limit: 6 },
      {
          $lookup: {//关联用户表，获取报名用户头像，昵称
              from: modelUser.collection.name,
              localField: 'user_uid',
              foreignField: 'uid',
              as: 'author_data'
          }
      },
      {
          $project: {
              _id: 1,
              contact_inform: 1,
              gender: 1,
              introduce: 1,
              timestamp: 1,
              "author_data.nickname": 1,
              "author_data.avatarUrl": 1
          }
      }
  ])
  // 处理相对时间
  res.forEach(item => {
      const diff = moment().diff(item.timestamp * 1000, 'seconds')
      item.timestamp = diff < 60 ? `${diff}秒前` : moment(item.timestamp * 1000).fromNow()
  })
  ctx.send('SUCCESS', 200, res)
})



module.exports = router.routes()