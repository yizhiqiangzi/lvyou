//专门用作图片上传


const multer = require('@koa/multer');
const COS = require('cos-nodejs-sdk-v5');
const account = require('@/config/Account')

//（永久密钥）
const cos = new COS({
  SecretId: account.QQ_SECRETID, 
  SecretKey: account.QQ_SECRRTKEY,
  FileParallelLimit:6,  //同一个实例下上传的文件并发数，默认值6
  ChunkParallelLimit:6,    //同一个上传文件的分块并发数，默认值6
  Protocol:'https',       //发请求时用的协议
  UseAccelerate:true        //是否启用全球加速域名，
})
  

//上传图片到服务器端
const storage = multer.diskStorage({
  filename:(req,file,cb)=>{
    console.log(file);
    //对文件的名字进行重命名，防止文件名字重复
    let fileFormat = (file.originalname).split(".")
    let newCode = `${new Date().getTime()}${"."}${fileFormat[fileFormat.length - 1]}`   //毫秒级时间戳  .   数组最后一项长度减1
    cb(null,newCode)
  }
})

//将我们上面自定义的方法，传入下面这个方法中，这个方法也可以作为中间件
const upload = multer({storage})

//上传到腾讯云
const cosUpdate = (value) => {
  return new Promise((resolve, reject) => {
      const resFile = []
      const files = value.map(item => {
          return {
              Bucket: account.QQ_BUCKET, /* 填入您自己的存储桶，必须字段 */
              Region: account.QQ_REGION,  /* 存储桶所在地域，例如 ap-beijing，必须字段 */
              Key: `${account.QQ_FOLDER}${item.filename}`,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
              FilePath: item.path,
          }
      })
      cos.uploadFiles({ files })
          .then(res => {
            // console.log(res.files);
              res.files.forEach(item => resFile.push(`https://${item.data.Location}`))
              resolve(resFile)
          })
          .catch(err => {
            // console.log(err);
              reject(err)
          })
  })
}




module.exports = {
  upload,
  cosUpdate
}