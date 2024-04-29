const jwt = require('jsonwebtoken')
const {secretkey,expiresIn} = require('./tokentime').security
//生成token
function gentoken(uid,scope='admin'){
  return jwt.sign({uid,scope},secretkey,{expiresIn})   //用jwt.sign()这个方法可以生成一个token  第一个参数为uid,第二个为签名，第三个为有效时间
   
}

module.exports = {gentoken}