// var COS = require('cos-wx-sdk-v5');
import COS from 'cos-wx-sdk-v5'
import {
	SECRETID,
	SECRETKEY,
	BUCKET,
	REGION,
	FOLDER
} from '@/api/my-account.js'

let Https = 'https://'

var cos = new COS({
    SecretId: SECRETID,
    SecretKey: SECRETKEY,
	Protocol:'https:',
	UseAccelerate:true,
	SimpleUploadMethod: 'putObject',
});
// 上传cos
let upLoadCos = function(value){
	const resFile = []
	return new Promise(async(resolve,reject)=>{
		const files = value.map((item)=>{
			const fileFormat = (item.tempFilePath).split(".");
			const newFileName = `${Date.now()}-${Math.floor(Math.random(0,1) * 10000000)}${"."}${fileFormat[fileFormat.length - 1]}`;
			return{
				Bucket:BUCKET,
				Region:REGION,
				Key: `${FOLDER}${newFileName}`,
				FilePath: item.tempFilePath, 
			}
		})
		console.log(files);
		cos.uploadFiles({files},(err, data)=>{
			if(err){
				wx.hideLoading()
				reject(err)
			}else{
				data.files.forEach(item=>resFile.push(`${Https}${item.data.Location}`))
				resolve(resFile)
				wx.hideLoading()
			}
		})
	})
}

export {upLoadCos}
