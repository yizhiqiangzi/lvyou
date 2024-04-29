//专门处理图片信息——比如大小啊啥的

//因为图片传的是https格式，而我们不能用，所以要转换为

const axios = require('axios')
const sizeOf = require('image-size')

const imageInfor = function (imgUrl) {//前端出来的图片imgUrl，是https型，要转换为arraybuffer
    return new Promise(async (resolve, reject) => {
        try {
            const res = await axios.get(imgUrl, { responseType: 'arraybuffer' })
            // console.log(res);
            const buffer = Buffer.from(res.data, 'binary')
            const size = sizeOf(buffer)
            // console.log(size);
            resolve({ width: size.width, height: size.height })
        } catch (error) {
            reject(error)
            // console.log(error);
        }
    })
}

module.exports = imageInfor