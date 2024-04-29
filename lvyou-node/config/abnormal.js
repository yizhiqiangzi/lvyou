//捕获错误的中间件
const result = require('./handle')

const errorHandler = async(ctx,next)=>{
  try {
    await next() //若正确，直接往下一步走
  } catch(error){
    console.log('出错');
    console.log(error.message);
    //查看是否调用 捕获已知错误的中间件
    const isres = error instanceof result
      if(isres){//调用result类，已知错误
          ctx.body = {
            msg:error.msg,
            error:error.error,

          }
          ctx.status = error.code
      }else{//异常的位置错误
        ctx.body = {
          msg:'服务器的异常错误',
          error:error.message,

        }
        ctx.status = 500
      }
  }
}

module.exports = errorHandler