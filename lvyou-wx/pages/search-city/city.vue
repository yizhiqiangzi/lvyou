<template>
	<view class="search-view">
		<view class="search-input">
			<image src="/static/icon/found/sousuo-hei.png" mode="widthFix"></image>
			<input type="text" placeholder="搜索城市/省份" 
			@input="updateInput"
			@focus="focusInput"
			v-model="keywords"
			>
		</view>
	</view>
	<!-- 占位高度 -->
	<view class="search-height"></view>
	<!-- 左边国家和右边城市 -->
	<view v-show="searchShow" class="global-display">
		<view class="country-left global-display global-f-direction">
			<text v-for="(item,index) in recoCountry" :key="index"
			:class="[tabIndex === index ? 'activeTab' : '']"
			@click="onChange(item.type,index)">{{item.country}}</text>
		</view>
		<view class="right-city">
			<view v-if="show">
				<view class="gps-city">
					<text>GPS定位</text>
					<text @click="chooseCity(address)">{{address}}</text>
				</view>
				<!-- 推荐下展示的城市 -->
				<view v-for="(item,index) in recoCity" :key="index">
					<text class="recoType" v-if="item.data.length > 0">{{item.title}}</text>
					<view class="recommend-city fadeIn">
						<view v-for="(item_a,index_a) in item.data" :key="index_a" @click="chooseCity(item_a._id)">
							<image :src="item_a.image" mode="aspectFill"></image>
							<text class="text-show">{{item_a._id}}</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 每个国家下的城市数据 -->
			<view  v-if="!show" class="recommend-city fadeIn">
				<view v-for="(item,index) in countryCity" :key="index" @click="chooseCity(item.city)">
					<image :src="item.image" mode="aspectFill"></image>
					<text class="text-show">{{item.city}}</text>
				</view>
			</view>
		</view>
	</view>
	<!-- 展示搜索列表 -->
	<view v-show="!searchShow">
		<view class="search-City" v-for="(item,index) in searchList" :key="index">
			<text @click="chooseCity(item.provinceName)">{{item.provinceName}}</text>
			<text v-for="(item_a,index_a) in item.citys" :key="index"
			@click="chooseCity(item_a.cityName)">{{item_a.cityName}}</text>
		</view>
	</view>
</template>

<script setup>
	import { ref,onMounted } from 'vue';
	import {requestApi} from '@/api/request.js'
	import {MenuButton} from '@/api/MenuButton.js'
	// 定位
	import {getLocation} from '@/api/qq-Location.js'
	// 防抖函数
	import {debounceapi} from '@/api/debounceapi.js'
	// pinia
	import { dataSet } from "@/store/index.js";
	const store = dataSet();
	const active = ref(0)
	// 定位
	const address = ref('定位中')
	// 存储左边的国家数据
	const recoCountry = ref([])
	// 存储右边推荐下的城市数据
	const recoCity = ref([
		{
			title:'本月热门',
			data:[]
		},
		{
			title:'自由行必去',
			data:[]
		},
		{
			title:'热度飙升',
			data:[]
		}
	])
	// 显示||隐藏：推荐下和国家下数据
	const show = ref(true)
	// 请求数据:左边国家，右边城市
	onMounted(async()=>{
		// 获取缓存的定位
		const cityValue = wx.getStorageSync('location')
		if(cityValue){
			address.value = cityValue
		}else{
			const city = await getLocation()//定位
			address.value = city.city
			wx.setStorageSync('location',city.city)//存
		}
		const leftData = await requestApi('/country-class')
		const rightData = await requestApi('/choose-address',{type:'AAA'})
		recoCountry.value = leftData.data
		console.log(recoCountry.value);
		recoCity.value[0].data = rightData.data.currentMonth
		recoCity.value[1].data = rightData.data.freedom
		recoCity.value[2].data = rightData.data.heatCity
	})
	// 每个国家下的数据
	const countryCity = ref([])
	// 切换国家
	const tabIndex = ref(0)
	async function onChange(type,index){
		tabIndex.value = index
		const rightData = await requestApi('/choose-address',{type})
		if(type == 'AAA'){
			recoCity.value[0].data = rightData.data.currentMonth
			recoCity.value[1].data = rightData.data.freedom
			recoCity.value[2].data = rightData.data.heatCity
			show.value = true
		}else{
			countryCity.value = rightData.data
			show.value = false
		}
	}
	// ----------------搜索部分----------------------
	// 显示||隐藏：搜索结果
	const searchShow = ref(true)
	// 搜索关键词
	const keywords = ref('')
	// 存储实时搜索列表
	const searchList = ref([])
	// 输入时触发
	const updateInput = debounceapi(async()=>{
		searchShow.value = keywords.value == '' ? true : false
		// 请求搜索列表
		const res = await requestApi('/china-data',{keywords:keywords.value})
		// console.log(res)
		searchList.value = res.data
	})
	// 获取焦点时触发:如果输入框为空，则保持默认状态，否则显示搜索结果部分
	async function focusInput(){
		searchShow.value = keywords.value == '' ? true : false
	}
	// 输入框清空按钮
	// function clearEvent(){
	// 	keywords.value == ''
	// 	searchShow.value = true
	// }
	// 选择城市到pinia到定位页面
	function chooseCity(city){
		store.$patch({address: city})
		uni.navigateBack({delta: 1})
	}
</script>

<style scoped>
.search-view{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 99;
	background-color: #ffffff;
}
.search-input{
	background-color: #f2f2f2;
	border-radius: 10rpx;
	margin: 20rpx;
	display: flex;
	flex-direction: row;
	flex: 1;
	position: relative;
}
.search-input input{
	height: 70rpx;
	width: 100%;
	font-size: 28rpx;
	padding-left: 80rpx;
	padding-right: 20rpx;
}
.search-input image{
	width: 28rpx;
	position: absolute;
	left: 30rpx;
	align-self: center;
}
.search-height{
	height: 120rpx;
}
.country-left{
	position: fixed;
	left: 0;
	width: 140rpx;
	overflow: hidden;
}
.country-left text{
	font-size: 32rpx;
	padding: 30rpx 0 30rpx 20rpx;
	background-color: #f7f8fa;
}
.activeTab{
	background-color: #ffffff !important;
	color: #efab3d;
}
.right-city{
	padding: 20rpx;
	flex: 1;
	margin-left: 140rpx;
}
.gps-city text:nth-child(1){
	font-weight: bold;
	font-size: 32rpx;
}
.gps-city text:nth-child(2){
	background-color: #f7f7f7;
	display: inline-block;
	border-radius: 10rpx;
	padding: 16rpx 40rpx;
	margin-top: 20rpx;
	font-size: 32rpx;
}
.recoType{
	font-size: 32rpx;
	font-weight: bold;
	padding: 20rpx 0;
}
.recommend-city{
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 10rpx;
}
.recommend-city image{
	width: 100%;
	height: 160rpx;
	object-fit: cover;
}
.recommend-city view{
	position: relative;
	border-radius: 20rpx;
	overflow: hidden;
	height: 160rpx;
	line-height: 50rpx;
}
.recommend-city text{
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	text-align: center;
	color: #ffffff;
	padding: 10rpx 0;
	font-size: 28rpx;
	background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
}
/* 触发实时搜索展示 */
.search-City{
	padding: 0 20rpx;
}
.search-City text{
	border-bottom: 2rpx solid #e3e4e7;
	height: 80rpx;
	line-height: 80rpx;
}
.search-City text:nth-child(1){
	font-weight: bold;
	color: goldenrod;
}
</style>