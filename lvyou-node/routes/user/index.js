//路由  前端叫路由，后端叫[接口]

const router = require('@koa/router')()

// const {modelUser} = require('../../models/collection')
//配置路径别名，  @/就可以找到，不必写../../这样   =>  在jsconfig.json文件中
const {modelUser} = require('@/models/collection')  //调用数据模型
//登录参数校验,发送验证码校验,小程序端：手机号，验证码登录校验————校验这三个值是否正确
const {Login,//登录参数校验
        Vercode,//发送验证码校验
        Mobileregistration,//小程序端：手机号，验证码登录校验————校验这三个值是否正确
        Uploadpassword,////小程序端，设置密码————校验密码
        Modifytheuser,  //编辑个人资料
    } = require('@/config/valiData')   
const {verCode,
  queryCode
} = require('@/alicode/index')
const {gentoken} = require('@/token/jwt')//生成token
const { Auth } = require('@/token/auth')
const crypto = require('crypto')       //对一些数据进行加密
const { model } = require('mongoose')

const moment = require('moment')//计算年龄




//小程序端，发送验证码   调用接口
router.get('/vercode',async ctx =>{
  const {phoneNumbers} = ctx.query
  //校验
  Vercode(phoneNumbers)
  // console.log(111);
  //调用之前封装好的阿里云短信验证码，来进行校验
  const res = await verCode(phoneNumbers)//发送验证码
  if(res.body.code == 'OK' && res.body.message == 'OK'){//表示发送成功
    ctx.send('SUCCESS',200,{bizId:res.body.bizId,message:'发送成功'})
  }else{
    ctx.send(res.body.message,422)
  }

})


//小程序端：手机号，验证码登录
router.post('/mobile-registration',async ctx=>{
  const {mobile,code,bizId} = ctx.request.body       //手机号，验证码，id
  //校验这三个值是否正确
  Mobileregistration(mobile,code,bizId)
  //验证验证码是否正确
  await queryCode(mobile,bizId,code)//注意顺序
  //判断用户之前是否已有账号
  const res = await modelUser.find({mobile},{ mobile: false, my_tags: false }).lean()
  console.log(res);
  if(res.length >0){//已有帐号
    // console.log(gentoken(res[0].uid));
    const token = {user_Token:gentoken(res[0].uid)}
    ctx.send('SUCCESS',200,{...res[0], ...token})
  }else{//没有账号
    const nickname = '用户_' + mobile.slice(-4)
    await modelUser.create({mobile,nickname})
    const userData = await modelUser.find({ mobile }, { mobile: false, my_tags: false }).lean()
    const token = { user_Token: gentoken(userData[0].uid) }
    ctx.send('SUCCESS', 200, { ...userData[0], ...token })
  }
})


//设置密码，修改密码
router.post('/upload-password',async ctx=>{
  const {mobile,code,bizId,password} = ctx.request.body
    //校验密码
    Uploadpassword(mobile,code,bizId,password)
    //更新密码——验证验证码是否正确
    await queryCode(mobile,bizId,code)//注意顺序
    //判断用户是否存在
    const res = await modelUser.find({mobile}).lean()
    if(res.length > 0){//用户信息存在
      //创建哈希对象————给密码进行加密处理
      const hash = crypto.createHash('sha256').update(password)
      //生成哈希值//w750941756
      const passwordHash = hash.digest('hex')  //对密码加密
      await modelUser.findOneAndUpdate({mobile},{password:passwordHash})//数据库查询到相关的手机号来更新密码
      ctx.send()
    }else{//用户信息不存在
      ctx.send('账号不存在',422)
    }
  })

//小程序端，手机号和密码登录
  router.post('/login',async ctx =>{//这个接口表示一个get请求的接口，第一个参数是接口名称，第二个参数ctx
    const {mobile,password} = ctx.request.body
    //校验
    Login(mobile,password)
    console.log(111);
    console.log(password);
    await verCode(mobile)
    // 把用户传来的密码进行哈希处理（加密）
    // 创建哈希对象————给密码进行加密处理
    const hash = crypto.createHash('sha256').update(password)
    //生成哈希值//w750941756
    const passwordHash = hash.digest('hex')  //对密码加密
    const res = await modelUser.find({mobile,password:passwordHash},{ mobile: false, my_tags: false }).lean()
    // console.log(res);
    if (res.length > 0) {//比对上了
      //将token返回给前端
      const token = {user_Token:gentoken(res[0].uid)}
      ctx.send('SUCCESS',200,{...res[0], ...token})
    }else{
      ctx.send('账号或密码错误',422)
    }
  })


  //编辑个人资料
  router.post('/modify-the-user',new Auth().m, async ctx=>{
    const {nickname,gender,birthday,city,avatarUrl,backdrop} = ctx.request.body
    //校验
    Modifytheuser(nickname,gender,birthday,city,avatarUrl,backdrop)
    //通过出生日期，计算年龄，最后存到数据库，包括这些也都更新到数据库
    //计算年龄——通过moment()模块
    const age = moment().diff(moment(birthday, 'YYYY-MM-DD'), 'years')
    // console.log(age);
    const res = await modelUser.findOneAndUpdate({uid:ctx.auth.uid},//更具uid进行更新
      {nickname,gender,birthday,city,avatarUrl,backdrop,age},
      //更新之后，我们要返回去，小程序拿到最新的数据，保存到本地，
      { new: true, select: 'nickname gender birthday city avatarUrl backdrop age' }//new: true表示返回最新结果，select表示需要返回哪些？
      )
      ctx.send('SUCCESS', 200, res)
  })



module.exports = router.routes()

