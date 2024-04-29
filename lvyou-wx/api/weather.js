import {
	requestApi
} from "./request"



/** 获取定位详情
 */
export const getLocationDetailApi = (data) => {
	let url = `https://apis.map.qq.com/ws/geocoder/v1`
	return requestApi(url, data)
}
/** 获取天气
 * @param {Object} province 省
 * @param {Object} city  市
 * @param {Object} county 县
 */
export const getWeatherApi = (data) => {
	let url = `https://wis.qq.com/weather/common`
	return requestApi(url, data)
}
