//因为我们后面用到阿里云，腾讯云短信等等，所以我们把这些第三方的账号还有密钥放到这儿，其他页面要的话再引入

//导出
module.exports = {
  //数据库地址
  BASE_URL: '',

  // 阿里云短信验证码
  ALI_KEYID: '',
  ALI_KEYSECRET: '',
  ALI_SIGNNAME: '',
  ALI_CODE: '',

  //百度ai关键词
  BAIDU_CLIENT_ID: '',   //API Key
  BAIDU_CLIENT_SECRET: '',  //Secret Key

  //腾讯云对象存储
  QQ_SECRETID: '',
  QQ_SECRRTKEY: '',
  QQ_BUCKET: '',  //存储桶
  QQ_REGION: '',       //存储桶所属区域
  QQ_FOLDER: '',            //存储的文件夹

  // 讯飞星火
  API_SECRET: "",
  API_KEY: '',
  APPID:"",

  // 百度地图
  BAIDU_AK:''
}
