//生成四位数的短信验证码
function generateCode() {
  var code = ''
  for (var i =0;i<4;i++){
    code+=Math.floor(Math.random()*10)
  }
  return code
}

module.exports = {generateCode}