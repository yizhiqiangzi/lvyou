//// 接受前端传来的token:中间件
const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
const { secretkey } = require('./tokentime').security
const result = require('@/config/handle')

class Authuid{
  get m(){
    return async(ctx,next)=>{
      const token = basicAuth(ctx.req)
      if(!token || !token.name){
        var uid = null
      }else{
          try {
            var authcode = jwt.verify(token.name, secretkey)
            var uid = authcode.uid
          } catch (error) {
            var uid = null
          }
      }
      ctx.auth = {uid}
      await next()
    }
  }
}



module.exports = {Authuid}