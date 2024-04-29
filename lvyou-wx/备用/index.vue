<template>
<view class="top-search">
	<view class="search-view" :style="[styleOpacity]">
		<view class="buttonTop"></view>
		<view class="search-input">
			<image src="/static/tab/sousuo.svg" mode="widthFix"></image>
			<input type="text" placeholder="搜索目的地/景点/攻略" placeholder-class="input-color" disabled>
		</view>
	</view>
	<view class="occupy-space"></view>
	<!-- 旅游分类 -->
	<view class="grid-view">
		<view class="global-display global-f-direction global-a-items" v-for="(item,index) in gridArr" :key="index">
			<image :src="item.icon" mode="widthFix"></image>
			<text>{{item.text}}</text>
		</view>
	</view>
</view>
	<!-- tab导航 -->
	<view class="container">
		<scroll-view class="tabs" scroll-x :scroll-left="scrollLeft" enable-passive scroll-with-animation>
		  <view v-for="(item, index) in tabNav" :key="index"
		  class="tab" :data-index="index" @tap="handleTabTap"
		  >
			<view class="tab-text" :class="{ active: activeIndex === index }">{{ item.name }}</view>
			<view class="tab-underline" :class="{ activeBor: activeIndex === index }"></view>
		  </view>
		</scroll-view>
	</view>
	<!-- 推荐 -->
	<Recomment v-show="keyWords == '001'" :newestTravel="newestTravel"/>
	<!-- 瀑布流 -->
	<card :userTravels="userTravels"/>
	<view style="height: 200rpx;"></view>
</template>

<script setup>
	import {onMounted, reactive, ref,nextTick} from 'vue'
	import {onReachBottom,onPageScroll,onLoad} from '@dcloudio/uni-app'
	import {MenuButton} from '@/api/MenuButton.js'
	import {requestApi} from '@/api/request.js'
	import Recomment from '@/pages/index/components/recomment.vue'
	import card from '@/pages/Common-components/card-flow.vue'
	// 宫格:游记类型
	const gridArr = ref([])
	// 推荐四个最新的游记
	const newestTravel = ref([])
	// tab游记分类切换
	const tabNav = ref([])
	// 瀑布流：用户游记
	const userTravels = ref([])
	const activeIndex = ref(0)
	const scrollLeft = ref(0)
	const tabWidths = ref([])
	// 点击tab切换分类游记
	const keyWords = ref('001')
	// 点击tab切换滑动指定tab上
	async function handleTabTap(e) {
		const index = e.currentTarget.dataset.index;
		scrollLeft.value = tabWidths.value[index].left - uni.getSystemInfoSync().windowWidth / 2 + tabWidths.value[index].width / 2
		activeIndex.value = index;
		const query = tabNav.value[index].key
		keyWords.value = query
		page.value = 1
		const user_travels = await requestApi('/user_travels',
		{keywords:query,page:1})
		userTravels.value = user_travels.data
	}
	
	onLoad(async()=>{
	  const four_travel = await requestApi('/recomm_travel')
	  const tabArr = await requestApi('/travelogue_class')
	  const user_travels = await requestApi('/user_travels',{keywords:'001',page:1})
	  const {category_nav,recomm_travel} = four_travel.data
	  category_nav[5].text = '结伴'
	  gridArr.value = category_nav
	  newestTravel.value = recomm_travel
	  tabNav.value = tabArr.data
	  userTravels.value = user_travels.data
	  await nextTick()//获取tab导航数据
	  let query = uni.createSelectorQuery();
	  query.selectAll('.tab').boundingClientRect(rects => {
	  tabWidths.value = rects.map((item,index)=>{
		  return {width:item.width,left:item.left}
	  })
	  }).exec()
	})
	
	// 上拉加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		const user_travels = await requestApi('/user_travels',
		{keywords:keyWords.value,page:page.value})
		userTravels.value = [...userTravels.value,...user_travels.data]
	})
	// 搜索框透明度和颜色
	let styleOpacity = reactive({
		backgroundColor: "none",
		opacity:1
	})
	let styleColor = reactive({
		inputBack:"#FFFFFF"
	})
	// 滚动监听
	onPageScroll((event)=>{
		if(event.scrollTop <= 100){
			styleOpacity.opacity = 1
			styleOpacity.backgroundColor = 'none'
			styleColor.inputBack = '#FFFFFF'
		}else{
			styleOpacity.opacity = event.scrollTop / 140
			styleOpacity.backgroundColor = '#FFFFFF'
			styleColor.inputBack = '#f4f4f4'
		}
	})
</script>

<style scoped>
.top-search{
	background-color: #f8e254;
	border-radius: 100% 100% 100% 100% / 0% 0% 15% 15%;
}
.search-view{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 99;
	height: v-bind('MenuButton().seViewHeight');
}
.occupy-space{
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
	color: #b2b2b2;
	padding-left: 80rpx;
	height: v-bind('MenuButton().height');
}
.search-input image{
	width: 35rpx;
	height: 35rpx;
	position: absolute;
	left: 30rpx;
	align-self: center;
}
.input-color{
	color: #666666;
}
.grid-view image{
	width: 50rpx;
	height: 50rpx;
	display: block;
	margin-bottom: 10rpx;
}
.grid-view{
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	grid-gap: 50rpx;
	padding: 30rpx 10rpx;
}
/* tab滑动导航栏 */
.tabs {
	white-space: nowrap;
	width: 100%;
}
.tab {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx;
	font-size: 30rpx;
	font-weight: bold;
	color: #999;
}
.active{
  color: #000;
}
.tab-underline {
	width: 50rpx;
	height: 8rpx;
	margin-top: 10rpx;
	border-radius: 4rpx;
}
.activeBor{
	background-color: #f8e254;
}
.tabs .tab:nth-child(2) .tab-text{
	color: #91c36f !important;
	font-family: 'Lobster', cursive;
}
</style>
