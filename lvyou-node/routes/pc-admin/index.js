const router = require('@koa/router')()
const {
    modelAdministrator,// 管理员账号
    modelDailyrecom,//每日推荐
    modelProvice,
    modelFourtravel   //四个推荐游记
} = require('@/models/collection-pc')
const {
    modelUser,      //用户表的模型
    modelArticle,   //游记表的模型
    modelConcern
} = require('@/models/collection')
const {
    Adminregister,//注册账号：管理员端
    ModifyuserInfor,  // 更新管理员头像，昵称
    Dailyrecom,  //上传每日推荐
    Resreturn,   //获取每日推荐
    CompanionDetails,   //删除每日推荐
    Uploadfourtravel,   // 提交四个推荐
    Modifyfourtravel,   //修改更新四个推荐
    Searchtravel            //// 搜索省市数据
} = require('@/config/valiData')
const { Auth } = require('@/token/auth')
const crypto = require('crypto')
const { gentoken } = require('@/token/jwt')
const moment = require('moment')
moment.locale('zh-cn')
const { upload, cosUpdate } = require('@/cos/cos')
// const { log } = require('console')
const fs = require('fs')
const { looKup, looKupRecommend } = require('@/config/lookup')

// 注册管理员账号————接口
router.post('/adminRegister', async ctx => {
    const { mobile, password } = ctx.request.body
    //校验，校验手机号格式，校验密码不能为空等等
    Adminregister(mobile, password)
    const res = await modelAdministrator.find({ mobile }).lean()
    if (res.length > 0) {
        ctx.send('账号已经存在', 422)
    } else {
        // 创建哈希对象————对帐号密码进行加密
        const hash = crypto.createHash('sha256').update(password)
        // 生成哈希值//19193174926————————w750941756
        const passwordHash = hash.digest('hex')
        await modelAdministrator.create({ mobile, password: passwordHash })
        ctx.send('注册成功', 200)
    }
})



// 登录
router.post('/adminLogin', async ctx => {
  const { mobile, password } = ctx.request.body
  Adminregister(mobile, password)
  // 创建哈希对象
  const hash = crypto.createHash('sha256').update(password)
  // 生成哈希值//19193174926————————w750941756
  const passwordHash = hash.digest('hex')
  const res = await modelAdministrator.find({
      mobile, password: passwordHash
  },
      { mobile: false }  //手机号不返回
  ).lean()
  if (res.length > 0) {
      const token = { user_Token: gentoken(res[0].admin_uid) }
      ctx.send('SUCCESS', 200, { ...res[0], ...token })
  } else {
      ctx.send('账号或者密码错误', 422)
  }
})

//图片上传upload.array('file', 6)
router.post('/imageUpload',upload.array('file', 6),  async ctx => {//upload.array('file', 6)    表示多图上传，第一个参数为文件类型，第二个参数为一次性可以上传几张
  // console.log(ctx.files);
  // await cosUpdate(ctx.files)
  
  const res = await cosUpdate(ctx.files)
  console.log(res);
  ctx.send('SUCCESS', 200, res)
})

// 更新管理员头像，昵称
router.post('/modifyUserInfor', new Auth().m, async ctx => {
  const { _id, avatarUrl, nickname } = ctx.request.body
  //校验
  ModifyuserInfor(_id, avatarUrl, nickname)
  await modelAdministrator.findByIdAndUpdate({ _id }, {
      avatarUrl, nickname
  })
  ctx.send()
})



// 上传每日推荐
router.post('/dailyRecom',  async ctx => {
  const { imageUrl, title, address, color } = ctx.request.body   //封面图，标题，地址，颜色
  // 校验
  Dailyrecom(imageUrl, title, address, color)
  //操作数据库
  await modelDailyrecom.create({ imageUrl, title, address, color })
  ctx.send()
})


// 导入省市到数据库
router.get('/insert-database', async ctx => {
  // return false
  const citydata = fs.readFileSync('F:/node/lvyou-node-v3/china.json', 'utf-8')
  const res = JSON.parse(citydata)
  await modelProvice.insertMany(res)
})



// 搜索省市数据
router.get('/china-data', async ctx => {
  const { keywords } = ctx.query
  Searchtravel(keywords)
  if (keywords.trim() === '') {//对于用户输入的空格进行处理
      ctx.send('SUCCESS', 200, [])
      return false
  }
  const regex = new RegExp(keywords, 'i')   //js自带的正则表达式
  // aggregate:聚合查询
  //$match用来查询
  //$or或者
  const res = await modelProvice.aggregate([
      {//第一个阶段：查询
          $match: {
              $or: [
                  { provinceName: regex },//匹配省
                  { 'citys.cityName': regex }//匹配市
              ]
          }
      },
      {
          $project: {//$project:可以指定返回前端哪些字段，可以在里面做逻辑处理
              _id: 0,//0表示不返回，1表示返回
              provinceName: 1,
              citys: {
                  $filter: {//用户筛选符合条件的城市
                      input: '$citys',//表示对哪个字段进行处理
                      as: 'city',//指定变量值
                      cond: {//进行逻辑处理
                          $or: [
                              //匹配市
                              { $regexMatch: { input: '$$city.cityName', regex } },
                              { $regexMatch: { input: '$provinceName', regex } }
                          ]
                          //$regexMatch:正则匹配
                      }
                  }
              }
          }
      }
  ])
  ctx.send('SUCCESS', 200, res)
})



// 获取每日推荐
router.get('/gainDailyRecom', new Auth().m, async ctx => {
  const { page } = ctx.query
  Resreturn(page)
  const res = await modelDailyrecom.find({}, { timestamp: false })
      .sort({ timestamp: -1 })  //倒叙查询
      .skip((page - 1) * 6)     //分页
      .limit(6)                 //分页限制
  // 获取数据总条数
  const count = await modelDailyrecom.countDocuments()
  const resData = { data: res, count }
  ctx.send('SUCCESS', 200, resData)
})

// 删除每日推荐
router.get('/deleteDailyRecom', new Auth().m, async ctx => {
  const { _id } = ctx.query   //根据_id来删除
  CompanionDetails(_id)
  await modelDailyrecom.deleteMany({ _id })
  ctx.send()
})



// 获取所有用户的游记：用作关联推荐
router.get('/allUserTravel',new Auth().m,  async ctx => {
  const { page } = ctx.query
  Resreturn(page)
  //连表查询作者名称————聚合查询
  const res = await modelArticle.aggregate([
      { $sort: { time_stamp: -1 } },//按创建时间倒序查询
      { $skip: (page - 1) * 10 },//跳过前面的10条，取后面的
      { $limit: 10 },//一次取10条
      looKup().model_user,//关联用户表
      {
          $project: {//1表示输出，0表示不输出
              "_id": 1,
              "title": 1,
              "address": 1,
              "time": 1,
              "author_data.nickname": 1
          }
      }
  ])
  // 获取游记总条数
  const count = await modelArticle.countDocuments()
  const resObj = { data: res, count }
  ctx.send('SUCCESS', 200, resObj)
})

// 提交四个推荐
router.post('/uploadFourTravel', new Auth().m, async ctx => {
  const { imageUrl, travel_id } = ctx.request.body   //接受前端传来的值
  // 校验
  Uploadfourtravel(imageUrl, travel_id)
  //存到数据库
  await modelFourtravel.create({ imageUrl, travel_id })
  // 给前端返回值
  ctx.send()
})

// 获取四个推荐游记
router.get('/gainRecomTravel', new Auth().m, async ctx => {
  const res = await modelFourtravel.aggregate([  //aggregate() 方法被用于执行一个聚合查询操作，从名为 modelFourtravel 的 MongoDB 集合中获取数据。通过聚合查询，可以根据需要对数据进行多个操作，以获取想要的结果。例如，可以使用 $match 运算符进行筛选，使用 $group 运算符进行分组，以及使用其他 MongoDB 聚合管道运算符对数据进行处理和转换。
      { $sort: { timestamp: -1 } },//排序,后来先到
      looKupRecommend().model_Article,
      looKupRecommend().model_reco_user,
      { $unwind: '$articleData' },
      { $unwind: '$userData' },
      {
          $project: {
              "_id": 1,
              "imageUrl": 1,
              "time": 1,
              "travel_id": 1,
              "articltTime": "$articleData.time",
              "nickname": "$userData.nickname"
          }
      }
  ])
  ctx.send('SUCCESS', 200, res)
})



// 修改更新四个游记
router.post('/modifyRecomTravel', new Auth().m, async ctx => {
  const { _id, imageUrl, travel_id } = ctx.request.body
  //校验
  Modifyfourtravel(_id, imageUrl, travel_id)
  await modelFourtravel.findByIdAndUpdate({ _id },
      { imageUrl, travel_id })
  ctx.send()
})


// 删除四个推荐游记
router.get('/deleteRecomTravel', new Auth().m, async ctx => {
  const { _id } = ctx.query
  CompanionDetails(_id)
  await modelFourtravel.deleteMany({ _id })
  ctx.send()
})


// 邮游记管理：获取全部游记
router.get('/travelManaGement', new Auth().m, async ctx => {
    const { page } = ctx.query
    Resreturn(page)
    const res = await modelArticle.aggregate([
        { $sort: { time_stamp: -1 } },//按创建时间倒序查询
        { $skip: (page - 1) * 10 },
        { $limit: 10 },
        looKup().model_user,
        {
            $project: {
                _id: 1,
                title: 1,
                content: 1,
                image: 1,
                videoUrl: 1,
                fileType: 1,
                city: 1,
                address: 1,
                province: 1,
                time: 1,
                cover_image: 1,
                "author_data.avatarUrl": 1,
                "author_data.nickname": 1,
            }
        }
    ])
    const count = await modelArticle.countDocuments()
    const resObj = { data: res, count }
    ctx.send('SUCCESS', 200, resObj)
})

// 用户管理：获取所有用户信息
router.get('/allUserInfor', new Auth().m, async ctx => {
    const { page } = ctx.query
    Resreturn(page)
    const res = await modelUser.aggregate([
        { $skip: (page - 1) * 10 },
        { $limit: 10 },
        {
            $lookup: {//关联游记表，获取游记总数
                from: modelArticle.collection.name,
                localField: 'uid',
                foreignField: 'author_uid',
                as: 'articleQuantity'
            }
        },
        {
            $lookup: {//关联关注表，获取粉丝数
                from: modelConcern.collection.name,
                localField: 'uid',
                foreignField: 'im_concerned_uid',
                as: 'concernQuantity'
            }
        },
        {
            $project: {
                _id: 1,
                avatarUrl: 1,
                nickname: 1,
                uid: 1,
                mobile: 1,
                //计算粉丝数量
                "concernQuantity": { $size: "$concernQuantity" },
                //计算发表文章数量
                "articleQuantity": { $size: "$articleQuantity" },
            }
        }
    ])
    const count = await modelUser.countDocuments()
    const resObj = { data: res, count }
    ctx.send('SUCCESS', 200, resObj)
})





module.exports = router.routes()