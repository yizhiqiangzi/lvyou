//后台管理端
const mongoose = require('mongoose')
mongoose.pluralize(null)//去掉集合后面的s
const { Schema, model } = mongoose
const versionKey = { versionKey: false }
const moment = require('moment')
moment.locale('zh-cn')


// 管理员账号
const AdminSchema = new Schema({
  mobile: {//手机号
      type: String,
      unique: true,
      trim: true
  },
  password: {//密码
      type: String,
      trim: true,
      select: false,//私密，不会返回给前端
  },
  admin_uid: {//uid
      type: String,
      unique: true,
      default: () => new Date().getTime()
  },
  avatarUrl: {//头像·
      type: String,
      default: 'https://diancan-1252107261.cos.accelerate.myqcloud.com/lvyou/avatarurl.png'
  },
  nickname: {//昵称
      type: String,
      default: '用户admin',
      trim: true
  }
}, versionKey)




// 每日推荐
const DailyrecomSchema = new Schema({
  imageUrl: String,//封面图
  title: String,//标题
  address: String,//地址
  color: String,//输入框的背景颜色
  time: {
      type: String,
      default: () => moment().utcOffset(8).format('YYYY-MM-DD')
  },
  timestamp: {
      type: Number,
      default: () => moment().unix()
  }
}, versionKey)



// 中国省市数据
const ChcitySchema = new Schema({
  cityName: {
      type: String
  }//市
})
const ProvinceSchema = new Schema({
  provinceName: String,//省
  citys: {//省下辖的市
      type: [ChcitySchema]
  }
}, versionKey)


// 四个推荐游记表
const FourTravelSchema = new Schema({
  imageUrl: String,//封面图
  travel_id: {//关联游记表的_id————小程序通过id就能在数据库中查找到相应的游记
      type: mongoose.Types.ObjectId,//关联游记表的id
      ref: 'usertravel',//关联的是游记表
      require: true//必传
  },
  time: {//moment.js 库获取当前时间，
      type: String,
      default: () => moment().utcOffset(8).format('YYYY-MM-DD')
  },
  timestamp: {//使用 moment.js 库获取当前时间的 UNIX 时间戳（以秒为单位）。UNIX 时间戳是指自 1970 年 1 月 1 日 00:00:00 UTC 起至当前时间的秒数。因此，这个字段的默认值表示了文档创建时的时间戳。
      type: Number,
      default: () => moment().unix()
  }
}, versionKey)




//创建集合并导出去
module.exports = {
  modelAdministrator:model("administrator",AdminSchema),//管理员集合
  modelDailyrecom:model("dailyrecom",DailyrecomSchema),
  modelProvice: model("chinacity", ProvinceSchema),
  modelFourtravel: model('fourtravel', FourTravelSchema)
}
