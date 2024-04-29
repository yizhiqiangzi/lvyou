<template>
	<!-- tab切换 -->
<view class="nav-position">
	<view class="container">
		<scroll-view class="tabs" scroll-x :scroll-left="scrollLeft" enable-passive scroll-with-animation>
		  <view v-for="(item, index) in tabNav" :key="index"
		  class="tab" :data-index="index" @tap="handleTabTap">
			<view class="tab-text" :class="{ active: activeIndex === index }">{{ item.city }}</view>
			<view class="tab-underline" :class="{ activeBor: activeIndex === index }"></view>
		  </view>
		</scroll-view>
	</view>
	<!-- 筛选标签 -->
	<view class="activity-type global-display global-a-items">
		<text v-for="(item,index) in activityType" :key="index"
		@click="activityFun(item,index)"
		:class="index == select ? 'selectstyle' : ''"
		>{{item}}</text>
	</view>
</view>
<view class="nav-height"></view>
<!-- 发布人 -->
<view class="companion-view" v-for="(item,index) in companionData" :key="index" @click="juMp(item._id)">
	<view class="companion-name global-display global-a-items">
		<image :src="item.author_data[0].avatarUrl" class="fadeIn" mode="aspectFill"></image>
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
	<view class="companion-people">{{item.signups}}人已报名</view>
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
	import {ref,onMounted, watch,nextTick} from 'vue'
	import {onReachBottom} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	// 存储结伴城市
	const tabNav = ref([])
	// 存储结伴数据
	const companionData = ref([])
	// 是否有数据
	const exist = ref(false)
	// 筛选类型
	const activityType = ref(['全部','本月出发','下月出发','我的活动'])
	
	const scrollLeft = ref(0)
	const tabWidths = ref([])
	const activeIndex = ref(0)
	// 选择城市切换
	const cityWord = ref('推荐')
	// 点击tab切换滑动指定tab上
	async function handleTabTap(e) {
		const index = e.currentTarget.dataset.index;
		scrollLeft.value = tabWidths.value[index].left - uni.getSystemInfoSync().windowWidth / 2 + tabWidths.value[index].width / 2
		activeIndex.value = index;
		cityWord.value = tabNav.value[index].city
	}
	// 请求数据
	onMounted(async()=>{
		// 获取结伴城市
		const tabRes = await requestApi('/companion-city');
		tabNav.value = tabRes.data
		// 进入页面获取全部结伴数据
		const companionRes = await requestApi('/companion-query',
		{city:'推荐',keyword:'全部',page:1}
		);
		exist.value = companionRes.data.length > 0 ? false : true
		companionData.value = companionRes.data
		console.log(companionRes);
		await nextTick()//获取tab导航数据
		let query = uni.createSelectorQuery();
		query.selectAll('.tab').boundingClientRect(rects => {
		tabWidths.value = rects.map((item,index)=>{
			return {width:item.width,left:item.left}
		})
		}).exec()
	})
	//类型筛选
	const select = ref(0)
	// 存储选中值
	const keyWord = ref('全部')
	async function activityFun(val,index){
		if(index != 3){
			select.value = index
			keyWord.value = val
		}else{
			// 查询是否登录
			await requestApi('/check-login');
			wx.navigateTo({url:'/pages/companion/my-activities'})
		}
	}
	
	// 如果选中城市切换或类型，并且都不为空
	watch([keyWord,cityWord],async(newVal,oldVal)=>{
		page.value = 1
		const companionRes = await requestApi('/companion-query',
		{city:cityWord.value,keyword:keyWord.value,page:1}
		);
		exist.value = companionRes.data.length > 0 ? false : true
		companionData.value = companionRes.data
	})
	// 上啦加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		const companionRes = await requestApi('/companion-query',
		{city:cityWord.value,keyword:keyWord.value,page:page.value}
		);
		companionData.value = [...companionData.value,...companionRes.data]
	})
	// 预览图片
	function showImage(image,item_a){
		wx.previewImage({
		  current: item_a, // 当前显示图片的http链接
		  urls: image // 需要预览的图片http链接列表
		})
	}
	// 跳转详情
	async function juMp(_id){
		// 查询是否登录
		await requestApi('/check-login');
		wx.navigateTo({url:'/pages/companion/partner-details?_id=' + _id})
	}
	// 跳转发布活动
	function initPartner(){
		wx.navigateTo({url:'/pages/companion/Init-partner'})
	}
</script>

<style>
@import url('@/style/index.css');
.nav-height{
	height: 200rpx;
}
.activity-type {
	padding: 20rpx;
	background-color: #ffffff;
}
.activity-type text{
	margin-right: 20rpx;
	font-size: 26rpx;
	font-weight: bold;
	background-color: #f5f6f6;
	padding: 10rpx 20rpx;
	border-radius: 8rpx;
}
.activity-type text:last-child{
	margin-left: auto;
	margin-right: 0;
}
.selectstyle{
	background-color: #fceeae !important;
}

</style>