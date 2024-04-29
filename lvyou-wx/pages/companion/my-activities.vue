<template>
<!-- tab切换 -->
<view class="nav-position">
	<view class="container">
		<scroll-view class="tabs" scroll-x enable-passive scroll-with-animation>
		  <view v-for="(item, index) in tabNav" :key="index"
		  class="tab" :data-index="index" @click="onClickTab(index)">
			<view class="tab-text" :class="{ active: activeIndex === index }">{{ item.name }}</view>
			<view class="tab-underline" :class="{ activeBor: activeIndex === index }"></view>
		  </view>
		</scroll-view>
	</view>
</view>
<view class="top-height"></view>
<!-- 发布者 -->
<view class="companion-view" v-for="(item,index) in activityData" :key="index" @click="juMp(item._id)">
	<view class="companion-name global-display global-a-items">
		<image :src="item.author_data[0].avatarUrl" mode="aspectFill"></image>
		<view>
			<text>{{item.author_data[0].nickname}}</text>
			<text>{{item.timestamp}}</text>
		</view>
	</view>
	<view class="companion-title text-show">{{item.description}}</view>
	<view class="companion-time global-display global-a-items">
		<image src="/static/icon/concern/time.png" mode="widthFix"></image>
		<text>时间：&nbsp;{{item.companion_time}}</text>
	</view>
	<view class="companion-time global-display global-a-items">
		<image src="/static/icon/concern/address.png" mode="widthFix"></image>
		<text>地点：&nbsp;{{item.city}} {{item.full_address}}</text>
	</view>
	<view class="companion-image">
		<image v-for="(item_a,index_a) in item.image" :key="index_a"
		:src="item_a" @click.stop="showImage(item.image,item_a)" 
		class="fadeIn" mode="aspectFill">
		</image>
	</view>
	<view class="companion-people">{{item.count}}人已报名</view>
</view>
<!-- 如果没有数据 -->
<view class="kong-view" v-if="exist">
	<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
	<text class="no-data">没有更多了</text>
</view>
<view style="height: 200rpx;"></view>
<view class="sign-up other-up" @click="initPartner">发布活动</view>
</template>

<script setup>
	import {ref,onMounted} from 'vue'
	import {onReachBottom,onShow,onLoad} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	const tabNav = ref([
		{
			api:'/par-in-activities',
			name:'我参与的'
		},
		{
			api:'/my-in-activities',
			name:'我发起的'
		},
	])
	// 存储请求的数据
	const activityData = ref([])
	// 是否有数据
	const exist = ref(false)
	// 获取数据
	onLoad(async()=>{
		await requestData(tabNav.value[0].api)
	})
	async function requestData(api){
		page.value = 1//再次查询时要把页数置为1
		const res = await requestApi(api,{page:1})
		console.log(res);
		activityData.value = res.data
		exist.value = res.data.length > 0 ? false : true
	}
	// 预览图片
	function showImage(image,item_a){
		wx.previewImage({
		  current: item_a, // 当前显示图片的http链接
		  urls: image // 需要预览的图片http链接列表
		})
	}
	// 跳转详情
	function juMp(_id){
		wx.navigateTo({url:'/pages/companion/partner-details?_id=' + _id})
	};
	// 点击我参与的或者我发起的
	const tabIndex = ref(0)
	const activeIndex = ref(0)
	async function onClickTab(index){
		tabIndex.value = index
		activeIndex.value = index
		await requestData(tabNav.value[index].api)
	}
	// 上啦加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		const companionRes = await requestApi(tabNav.value[tabIndex.value].api,{page:page.value})
		activityData.value = [...activityData.value,...companionRes.data]
	})
	// 跳转发布活动
	function initPartner(){
		wx.navigateTo({url:'/pages/companion/Init-partner'})
	}
</script>

<style>
@import url('@/style/index.css');
.co-title-tab{
	font-weight: bold;
	font-size: 32rpx;
}
.co-tab-view .van-tabs__line{
	width: 60rpx; height: 10rpx;
}
.top-height{
	height: 100rpx;
}
</style>