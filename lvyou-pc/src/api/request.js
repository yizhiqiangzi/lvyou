import axios from 'axios';
import { Base64 } from 'js-base64';
import { ElMessage } from 'element-plus'
//'http://127.0.0.1:8900/apif'
const baseURL = 'http://127.0.0.1:8900/apif'
const http = axios.create({
	baseURL, // 设置请求的基础
	timeout: 10000, // 设置请求超时时间
});

// 图片上传url
export const imageUrl = baseURL + '/imageUpload'

// 对token加密
function encryptToken() {
	const { user_Token } = JSON.parse(localStorage.getItem('adminInfor'))//从本地缓存里取出token
	const auth = Base64.encode(user_Token + ':')//对token加密
	return 'Basic ' + auth
}

// 响应拦截器：是在axios请求发出之前
http.interceptors.request.use((config) => {
	// console.log(config.url);
	// if(config.url.startsWith('/ip')){
	// 	config.baseURL = LBS_URL;
	// }else{}
	// 设置请求头
	const token = localStorage.getItem('adminInfor')
	if (token) {
		config.headers.Authorization = encryptToken()
	}
	return config;
}, (error) => {
	console.log(error)
	return Promise.reject(error);
});

// 响应拦截器：是在axios请求发出之后
http.interceptors.response.use((response) => {
	// 处理响应数据
	// ...

	return response.data;
}, (error) => {
	console.log(error)
	// 处理响应错误
	if (error.response) {
		const status = error.response.status
		switch (status) {
			case 404:
				// console.error('接口不存在')
				break;
			case 401:
				console.error('没有权限')
				break;
			case 500:
				ElMessage('发生异常错误')
				break;
			case 501:
				ElMessage('发生异常错误')
				break;
			case 502:
				ElMessage('发生异常错误')
				break;
			case 400:
				console.error(error.response.data.msg)
				break;
			case 422:
				ElMessage(error.response.data.msg)
				break;
		}
	} else if (error.message == "timeout of 10000ms exceeded") {
		ElMessage('请求超时,检查网络环境')
	}
	return Promise.reject(error);
});

export default {
	get(url, params) {
		return http.get(url, { params });
	},

	post(url, data) {
		return http.post(url, data);
	},
};