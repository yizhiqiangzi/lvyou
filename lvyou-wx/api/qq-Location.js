import QQMapWX from '@/api/qqmap-wx-jssdk.js';
var qqmapsdk;
import {LBS_KEY} from '@/api/my-account.js'
// 实例化API核心类
qqmapsdk = new QQMapWX({
	key: LBS_KEY
});

// 开启定位
let getLocation = function(){
	return new Promise((resolve,reject)=>{
		wx.startLocationUpdate({
			type:'wgs84',
			success: (res) => {
				wx.onLocationChange(async(add)=>{
					wx.stopLocationUpdate()//关闭监听实时位置变化，前后台都停止消息接收
					const city = await addressCity(add.latitude,add.longitude)
					resolve(city)
				})
			},
			fail: (err) => {
				console.log('用户关闭定位')
				wx.offLocationChange()//取消监听实时地理位置变化事件
				resolve({city:'兰州市',latitude: 25.01503,longitude: 102.7437})
			}
		})
	})
}

function addressCity(latitude,longitude){
	return new Promise((resolve,reject)=>{
		qqmapsdk.reverseGeocoder({
			location: {latitude,longitude},
			success: (res)=>{
				const city = res.result.address_component.city
				const latLog = res.result.location
				console.log(res,'ddddddddd')
				resolve({city,latitude: latLog.lat,longitude: latLog.lng})
			},
			fail: (err) => {
				resolve({city:'兰州市',latitude: 25.01503,longitude: 102.7437})
			}
		})
	})
}

export {getLocation,addressCity}