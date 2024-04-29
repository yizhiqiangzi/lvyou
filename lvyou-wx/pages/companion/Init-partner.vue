<template>
	<text class="init-title">描述</text>
	<view class="init-textarea">
		<textarea v-model="message" auto-focu placeholder="说出你的结伴旅行计划吧,比如时间安排,出行方式,旅途亮点等" />
	</view>
	<text class="init-title">上传图片</text>
	<view class="init-uploader">
		<view v-for="(item,index) in fileList" :key="index">
			<image :src="item.tempFilePath" mode="aspectFill"></image>
			<image @click="beforeDelete(index)" src="/static/icon/companion/shanchu.png" mode="widthFix"></image>
		</view>
		<view @click="uploadImage" v-if="fileList.length < 4">
			<image src="/static/icon/companion/shangchuan.png" mode="aspectFill"></image>
		</view>
	</view>
	<view class="personal-view global-display global-a-items">
		<text>目的地</text>
		<input type="text" disabled placeholder="请选择目的地" v-model="poiname" @click="chooseLocation">
		<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
	</view>
	<view class="personal-view global-display global-a-items">
		<text>结伴时间</text>
		<picker @change="pickerChangeDate" mode="date" :start="startDate" :end="endDate">
			<input type="text" disabled placeholder="请选择结伴时间" v-model="startTime">
		</picker>
		<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
	</view>
	<view class="personal-view global-display global-a-items">
		<text>希望人数</text>
		<picker @change="pickerChangePeople" :range="[1,2,3,4,5,6,7,8,9]">
			<input type="text" disabled placeholder="请选择希望人数" v-model="numberOfPeople">
		</picker>
		<image src="/static/icon/personal-Data/jiantou-you.png" mode="widthFix"></image>
	</view>
	<button @click="subMit" :disabled="disabled" class="sum-mit">提交</button>
	<!-- 地图选点 -->
</template>

<script setup>
	import {ref,watchEffect} from 'vue'
	import moment from 'moment'
	moment.locale('zh-cn');
	import {requestApi} from '@/api/request.js'
	import {upLoadCos} from '@/api/cos.js'
	import {addressCity} from '@/api/qq-Location.js'
	
	const message = ref('')
	// 暂存展示的图片
	const fileList = ref([]);
	// 上传图片
	async function uploadImage(){
		wx.chooseMedia({
		  count: 3,
		  mediaType: ['image'],
		  sizeType:['compressed'],
		  sourceType: ['album', 'camera'],
		  success:async(res)=> {
			res.tempFiles.forEach(item=>{
				fileList.value.push(item)
			})
		  }
		})
	}
	// 删除指定的图片
	function beforeDelete(index){
		fileList.value.splice(index,1)
	}
	// 选中的市和位置
	const cityname = ref('')
	const poiname = ref('')
	// 选择目的地
	function chooseLocation(){
		wx.chooseLocation({
			success:async(res)=> {
				const cityData = await addressCity(res.latitude,res.longitude)
				cityname.value = cityData.city
				poiname.value = res.name
			},
			fail:(err)=>{
				console.log(err);
			}
		})
	}
	// 选择结伴时间
	const startTime = ref('')
	const currentMonth = moment().format('YYYY-MM-DD')//当前年
	const nextMonth = moment().add(1, 'month').endOf('month').format('YYYY-MM-DD');
	const startDate = ref(currentMonth)
	const endDate = ref(nextMonth)
	function pickerChangeDate(event){
		startTime.value = event.detail.value
	}
	// 选择人数
	const numberOfPeople = ref(null)
	function pickerChangePeople(event){
		numberOfPeople.value = Number(event.detail.value) + 1
	}
	// 监听必填值是否填写完毕
	const disabled = ref(true)
	watchEffect(()=>{
		const hasData = message.value && fileList.value.length > 0 && cityname.value && poiname.value && startTime.value && numberOfPeople.value > 0;
		disabled.value = hasData ? false : true
	})
	// 发布
	async function subMit(){
		wx.showLoading({title: '提交中',mask:true})
		await requestApi('/check-login');
		const upLoadRes = await upLoadCos(fileList.value)
		await requestApi('/initiating-partner',
			{
				description:message.value,
				image:upLoadRes,
				city:cityname.value,
				full_address:poiname.value,
				companion_time:startTime.value,
				number_of_people:numberOfPeople.value
			},'POST'
		)
		wx.navigateTo({url:'/pages/companion/my-activities'})
	}
</script>

<style>
@import url('@/style/index.css');
.init-title{
	margin: 20rpx;
	font-weight: bold;
	font-size: 32rpx;
}
.init-textarea{
	background-color: #f9f9f9;
	font-size: 30rpx;
	border-radius: 8rpx;
	margin: 20rpx;
	padding: 5rpx;
}
.init-textarea textarea{
	width: 100%;
}
.init-uploader{
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-gap: 6rpx;
	margin: 20rpx;
}
.init-uploader view{
	height: 170rpx;
	overflow: hidden;
	position: relative;
}
.init-uploader image:nth-child(1){
	width: 100%;
	height: 170rpx;
}
.init-uploader image:nth-child(2){
	position: absolute;
	width: 40rpx;
	top: -8rpx;
	right: -8rpx;
}
.personal-view text{
	width: 150rpx;
	font-size: 32rpx;
}
.personal-view image{
	width: 30rpx;
}
.personal-view{
	border-bottom: 2rpx solid #f2f2f2;
	padding: 30rpx 0;
	margin: 0 20rpx;
}
.personal-view input,picker{
	flex: 1;
}
.sum-mit{
	background-color: #f9dc53;
	width: 400rpx;
	margin-top: 40rpx;
	border: none;
}
</style>