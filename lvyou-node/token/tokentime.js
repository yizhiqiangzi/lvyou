//专门存放token的有效期
module.exports = {
  security: {
    //签名，
    secretkey: 'abcgtuvh',
    // 有效期
    expiresIn: 60 * 60 * 24 * 300
}
}