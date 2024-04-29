//入口启动文件，后面我们的接口会统一并到这个地方来

//1.下载koa的框架，路由等一些东西    ————————  npm install koa koa-json koa-bodyparser @koa/router @koa/cors mongoose

// koa: Koa 是一个基于 Node.js 的 Web 框架

// koa-json: 这是一个 Koa 中间件，用于将 JSON 格式的数据响应给客户端。

// koa-bodyparser: 该中间件用于解析请求体，将客户端发送的请求体解析为 JavaScript 对象，方便后续处理请求中的数据。

// @koa/router: 这是 Koa 官方提供的路由中间件，用于处理不同路由路径的请求，并将请求转发给相应的处理函数。

// @koa/cors: 用于处理跨域资源共享（CORS）的中间件，允许跨域请求来自不同的源，提高 Web 应用程序的灵活性和互联性。

// mongoose: Mongoose 用于在应用程序中与 MongoDB 数据库进行交互。它提供了一种简单、直观的方式来定义数据模型、查询和操作 MongoDB 数据库。

/**
 * 
 */

//引入一些重要模块
const koa = require('koa')
const app = new koa()
const json = require('koa-json')  //用于将http响应的数据转换为json格式
const bodyparser = require('koa-bodyparser') //解析http请求的消息体
const router = require('@koa/router')()  //直接实例化   前端的路由主要是哪一个页面，后端这儿的路由是哪一个接口
const cors = require('@koa/cors')  //允许跨域，不然前端连不上
const mongoose = require('mongoose')  //操作数据库

//引入第三方以及数据库的信息(前端要引入东西的话，一般是importent ,这儿是const)

const { addAliases } = require('module-alias')
//配置别名 ----先配置文件别名，再去查找文件
addAliases({
  '@': __dirname
})

const { BASE_URL } = require('@/config/Account') //数据库地址
const responseHandler = require('@/config/result')  //统一返回给前端的接口数据格式:中间件
const errorHandler = require('@/config/abnormal')  //捕获错误的中间件




app.use(cors())
app.use(json())
app.use(bodyparser())
app.use(responseHandler)  //因为我们导出的是常量，所以不要括号
app.use(errorHandler)  //因为我们导出的是常量，所以不要括号



//连接数据库（第一个参数是连接数据库的地址,第二个参数已废弃，不用填       是一个对象，可以传一些属性，具体查看mongose官网）
mongoose.connect(BASE_URL)
  .then(res => {
    console.log('数据库连接成功', res);
  })
  .catch(err => {
    console.log('数据库连接失败', err);
  })

//----------------接口小程序端--------------
const login = require('@/routes/user/index')     //登陆注册用户账号
const article = require('@/routes/article/index')   //游记
const home = require('@/routes/home/index')   //首页
const search = require('@/routes/search-travel/index')  //搜索游记
const found = require('@/routes/found/index')    //目的地
const companion = require('@/routes/companion/index')
const openai = require('@/routes/openai/index')
const baiduApi = require('@/routes/baiduApi/index')
//————————————————接口，后台管理端————————————————————————
const pcapi = require('@/routes/pc-admin/index')   //游记
const analysis = require('@/routes/pc-data-analysis/index')   //数据分析



router.use('/apif', login)  //将login注入到router方法中
router.use('/apif', article)  //将游记注入到router方法中
router.use('/apif', pcapi)  //后台注册
router.use('/apif', home)  //小程序首页注册
router.use('/apif', search)
router.use('/apif', found)
router.use('/apif', companion)
router.use('/apif', analysis)
router.use('/apif', openai)
router.use('/apif', baiduApi)



app.use(router.routes()).use(router.allowedMethods())  //use(router.allowedMethods())  用于处理http请求方法的支持情况
app.listen(8900)//注册端口，注意，如果有其他项目的话，不要写重起冲突

console.log('端口启动成功');
