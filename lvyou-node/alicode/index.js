// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
const {default:Esc20170525,SendSmsRequest,QuerySendDetailsRequest} = require('@alicloud/dysmsapi20170525') ;  //SendSmsRequest调用发送验证码，QuerySendDetailsRequest验证验证码是否正确
const {Config} = require ('@alicloud/openapi-client');
const {RuntimeOptions} = require ('@alicloud/tea-util');
const account = require('@/config/Account')
const {generateCode} = require('./gencode')
const result = require('@/config/handle')
const moment = require('moment')    //时间的第三方模块npm install moment————用来处理日期
moment.locale('zh-cn')   //表示在中国使用

//阿里云短信验证码
let config = new Config({
     // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
     accessKeyId: '',
     // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
     accessKeySecret: '',
})

const client = new Esc20170525(config)
const runtime = new RuntimeOptions({})

//发送验证码
const verCode = async function(phoneNumbers){
  let sendSmsRequest = new SendSmsRequest({
    phoneNumbers: phoneNumbers,
    signName: account.ALI_SIGNNAME,
    templateCode: account.ALI_CODE,
    templateParam: `{"code":${generateCode()}}`,
  });
  try {
    // 复制代码运行请自行打印 API 的返回值
    const res = await client.sendSmsWithOptions(sendSmsRequest, runtime);
    // console.log(res);
    return res
  } catch (error) {
    //出错的话，直接抛给前端，阻断代码运行
    console.log(error);
    throw new result('发送验证码失败',500,error)
  }    
}

//验证验证码是否正确
const queryCode = async function(phoneNumber,bizId,code){//手机号码，回执id，验证码，
  const sendDate = moment().format('YYYYMMDD')//调用它就可以获取当天的日期
  let querySendDetailsRequest = new QuerySendDetailsRequest({
      phoneNumber,
      sendDate,
      pageSize: 10,
      currentPage: 1,
      bizId,
  });
  try {
     const res =  await client.querySendDetailsWithOptions(querySendDetailsRequest, runtime);
    //  console.log(res);
     if(res.body.code === 'OK'){//这个表示接口请求成功
        if(res.body.smsSendDetailDTOs.smsSendDetailDTO.length === 0){//等于0的话，表示前端验证码查询不到,会给前端送以下值
          throw {message:'手机号没有发送过验证码',code:422}
        }else{
          const str = res.body.smsSendDetailDTOs.smsSendDetailDTO[0].content
          const nums = str.match(/\d+/g).map(Number)
          // console.log(nums);
          if(code == nums[0]){
            return 'SUCCESS'
          }else{
            throw {message:'验证码不正确',code:422}
          }
        }
     }else{//不等于ok
      throw {message:res.body.message,code:422}

     }
  }catch (error){
    // console.log(error);
    //调用一个中间件，去返回给前端
    throw new result (
      error.message ? error.message:'发生未知错误',
      error.code ? error.code : 500,
      error.message ? null:error,
    )
  }

}

module.exports = {
  verCode,
  queryCode
}