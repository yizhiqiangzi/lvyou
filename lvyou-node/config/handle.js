
//参数校验，捕获已知错误
class result extends Error{//用于一些参数的校验  //继承node.js自带的一些模块（构造函数）,不用引入
  constructor(msg,code,error=null){//这个回调函数主要是给前端返回的一些参数
    super()  //调用父类，父类为Error
    this.msg = msg
    this.code = code
    this.error = error
  }
}

module.exports = result