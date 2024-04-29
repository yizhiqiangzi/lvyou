<template>
	<view class="found-top">
		<image class="top-img" :src="cityImage" mode="aspectFill"></image>
		<view class="search-view" :style="[styleOpacity]">
			<view class="buttonTop"></view>
			<view class="search-input" @click="seacrhPage">
				<image :src="styleOpacity.opacity === 1 ? '/static/icon/found/sousuo-bai.png' : '/static/icon/found/sousuo-hei.png'" mode="widthFix"></image>
				<input type="text" placeholder="搜索目的地" placeholder-class="input-color" disabled>
			</view>
		</view>
		<view class="select-address global-display global-a-items" @click="selectCity">
			<text>{{address}}</text>
			<image src="/static/icon/found/xuanze-jiantou.png" mode="widthFix"></image>
		</view>
		<view class="select-address address-img" @click="addressImage">关于{{address}}的相册></view>
	</view>
	<!-- 天气 -->
	<!-- 当地玩法 -->
	<text class="cityplay">当地玩法</text>
	<view class="cityplay-grid fadeIn">
		<view v-for="(item,index) in localPlay" :key="index" @click="topnavIgtion(item.categories)">
			<image :src="item.image" mode="aspectFill"></image>
			<text>{{item.categories}}</text>
		</view>
	</view>
	<!-- 当地攻略 -->
	<text class="cityplay">当地游记</text>
	<!-- 瀑布流 -->
	<card :userTravels="userTravels"/>
	<view style="height: 200rpx;"></view>
</template>

<script setup>
	import {reactive, ref,nextTick,watch,onMounted} from 'vue'
	import {onReachBottom,onPageScroll,onLoad} from '@dcloudio/uni-app'
	import {MenuButton} from '@/api/MenuButton.js'
	import {requestApi} from '@/api/request.js'
	import Recomment from '@/pages/index/components/recomment.vue'
	import card from '@/pages/Common-components/card-flow.vue'
	// pinia
	import { dataSet } from "@/store/index.js";
	const store = dataSet();
	// 定位
	import {getLocation} from '@/api/qq-Location.js'
	// 搜索框透明度和颜色
	let styleOpacity = reactive({
		backgroundColor: "none",
		opacity:1
	})
	let styleColor = reactive({
		inputBack:"rgba(255, 255, 255, 0.2)",
		inputColor:"#ffffff"
	})
	// 滚动监听
	onPageScroll((event)=>{
		if(event.scrollTop <= 100){
			styleOpacity.opacity = 1
			styleOpacity.backgroundColor = 'none'
			styleColor.inputBack = "rgba(255, 255, 255, 0.2)"
			styleColor.inputColor = "#ffffff"
		}else{
			styleOpacity.opacity = event.scrollTop / 140
			styleOpacity.backgroundColor = '#FFFFFF'
			styleColor.inputBack = '#f6f7f8'
			styleColor.inputColor = "#666666"
		}
	})
	// 存储定位选择的地址
	const address = ref('定位中...')
	// 存储当地玩法
	const localPlay = ref([])
	// 存储用户游记
	const userTravels = ref([])
	// 骨架屏
	const skeLeton = ref(true)
	// 顶部图片
	const cityImage = ref('')
	watch(()=>store.address,async(newVal)=>{
		console.log(newVal);
		const cityValue = wx.getStorageSync('location')
		if(cityValue){
			address.value = cityValue
		}else{
			const city = await getLocation()//定位
			address.value = city.city
			wx.setStorageSync('location',city.city)//存
		}
		address.value = newVal ? newVal : address.value
		//当地玩法和当地游记
		const gameplay = await requestApi('/local-gameplay')
		localPlay.value = gameplay.data
		await getUserTravel(address.value)
	},{immediate:true})
	// 获取游记
	async function getUserTravel(val){
		const travel = await requestApi('/local-travel',{page:1,address:val})
		console.log(travel);
		cityImage.value = travel.data.length > 0
		 ? travel.data[0].cover_image.url
		 : 'https://meituan.thexxdd.cn/lvyou/assets/found-search-back-887c7b56.jpg'
		userTravels.value = travel.data
	}
	// 上拉加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		const user_travels = await requestApi('/local-travel',{page:page.value,address:address.value})
		userTravels.value = [...userTravels.value,...user_travels.data]
	})
	// 选择城市
	function selectCity(){
		wx.navigateTo({url:'/pages/search-city/city'})
	}
	// 跳转搜索
	function seacrhPage(){
		wx.navigateTo({url:'/pages/search-travel/search'})
	}
	// 查看图集
	function addressImage(){
		wx.navigateTo({url:'/pages/found/address-image?value=' + address.value})
	}
	// 当地玩法
	function topnavIgtion(value){
		wx.navigateTo({url:`/pages/types-travel/index?type=002&query=${value}&address=${address.value}`})
	}
</script>

<style>
page{
	background-color: #fcfcfd;
}
.found-top{
	position: relative;
	height: 550rpx;
}
.top-img{
	height: 550rpx;
	width: 100%;
	position: relative;
}
.top-img::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.2);
}
.search-view{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 99;
	height: v-bind('MenuButton().seViewHeight');
}
.buttonTop{
	height: v-bind('MenuButton().top');
}
.search-input{
	background: v-bind('styleColor.inputBack');
	border-radius: 50rpx;
	margin-left: 20rpx;
	display: flex;
	flex-direction: row;
	flex: 1;
	position: relative;
	height: v-bind('MenuButton().height');
	width: v-bind('MenuButton().left');
}
.search-input input{
	width: 100%;
	font-size: 30rpx;
	padding-left: 80rpx;
	height: v-bind('MenuButton().height');
}
.search-input image{
	width: 28rpx;
	position: absolute;
	left: 30rpx;
	align-self: center;
}
.input-color{
	color: v-bind('styleColor.inputColor');
}
.select-address{
	position: absolute;
	left: 20rpx;
	bottom: 200rpx;
}
.select-address text{
	font-size: 50rpx;
	font-weight: bold;
	color: #ffffff;
	padding-right: 20rpx;
}
.select-address image{
	width: 25rpx;
}
.address-img{
	right: 20rpx;
	left: inherit;
	bottom: 20rpx;
	background-color: #f9dc53;
	border-radius: 40rpx;
	font-size: 25rpx;
	padding: 5rpx 15rpx;
}
/* 天气 */
.weather-view{
	margin: 20rpx;
	overflow: hidden;
	border-radius: 15rpx;
	box-shadow: 4rpx 20rpx 40rpx rgba(217, 217, 217, .3);
}
.weather-view text{
	font-size: 28rpx;
}
.temperature{
	background-color: #f0f4fd;
	padding: 20rpx;
}
.temperature image{
	width: 40rpx;
}
.temperature view:nth-child(3){
	margin-left: 80rpx;
}
.temperature-left{
	flex: 1;
}
.temperature-left text:nth-child(1){
	font-weight: bold;
	font-size: 40rpx;
	padding-bottom: 10rpx;
}
.temperature-right image{
	margin-bottom: 5rpx;
}
.temperature-right text{
	color: #999999;
}
.suitable{
	padding: 20rpx;
}
.suitable text:nth-child(1){
	color: #999999;
	padding-bottom: 15rpx;
}
.suitable text:nth-child(2){
	font-weight: bold;
}
/* 当地玩法 */
.cityplay{
	padding: 40rpx 20rpx 20rpx 20rpx;
	font-size: 32rpx;
	font-weight: bold;
}
.cityplay-grid{
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 10rpx;
	margin: 0 20rpx;
}
.cityplay-grid view{
	height: 170rpx;
	position: relative;
	border-radius: 15rpx;
	overflow: hidden;
}
.cityplay-grid image{
	width: 100%;
	height: 170rpx;
}
.cityplay-grid text{
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 35rpx 16rpx 10rpx 16rpx;
	font-size: 28rpx;
	color: #ffffff;
	background: linear-gradient(to bottom, rgba(76, 133, 74, 0), rgba(76, 133, 74, 1));
}
</style>