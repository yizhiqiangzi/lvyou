//统一返回给前端的接口数据格式
const responseHandler = async(ctx,next)=>{//中间件必须要有这两个参数ctx,next，一个表示上下文，一个表示下一步
    ctx.send = (msg='SUCCESS',code=200,data=null,error=null,extra=null)=>{
      ctx.body = {
        msg,//表示成功与否
        data,//返给前端的数据
        error,//错误说明
        extra,//额外说明
      }
      ctx.status = code
    }
    await next()
}

module.exports = responseHandler