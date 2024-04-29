// pinia
import { defineStore } from 'pinia';

export const dataSet = defineStore('mydata',{
	// 数据仓库
	state: () => ({
		//用户在定位页面手动选择城市后触发该字段
		address:null,
		// 弹出或隐藏公用评论框
		commentBox:{
			show:false,//显示或隐藏
			_id:''//传递的id值
		}
	}),
	actions: {

	},
})