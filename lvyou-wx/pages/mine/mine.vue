<template>
	<view class="mine-top fadeIn">
	  <image class="mine-top-back" :src="userInfor.backdrop" @click="editData" mode="aspectFill"></image>
	  <image class="mine-user-avatar" :src="userInfor.avatarUrl" @click="editData" mode="aspectFill"></image>
	  <view class="mine-user">
			<text class="user-nickname" @click="gotoLogin">{{userInfor.nickname}}</text>
			<!-- 点赞+关注+粉丝数 -->
			<view class="global-display">
				<view class="user-data global-display global-a-items" v-for="(item,index) in userData" :key="index">
					<text>{{item.num}}</text>
					<text>{{item.title}}</text>
				</view>
			</view>
			<!-- 年龄 -->
			<view class="age-view global-display global-a-items">
				<text v-if="userInfor.age != ''">{{userInfor.age}}岁</text>
				<text v-if="userInfor.city != ''">{{userInfor.city}}</text>
			</view>
			<!-- uid -->
			<view v-if="userInfor.uid" class="uid-view global-display global-a-items">
				<text>UID:&nbsp;&nbsp;</text>
				<text>{{userInfor.uid}}</text>
			</view>
			<!-- 导航 -->
			<view class="user-navigation global-display global-a-items">
				<text v-for="(item,index) in userTab" :key="index"
			@click="juMp(item.route,index)">{{item.title}}</text>
			</view>
	  </view>
	</view>
	<!-- 我的作品，收藏，喜欢 -->
	<div class="position-height"></div>
	<view class="container">
		<scroll-view class="tabs" scroll-x enable-passive scroll-with-animation>
		  <view v-for="(item, index) in tabNav" :key="index"
		  class="tab" :data-index="index" @tap="handleTabTap"
		  >
			<view class="tab-text" :class="{ active: tabIndex === index }">{{ item }}</view>
			<view class="tab-underline" :class="{ activeBor: tabIndex === index }"></view>
		  </view>
		</scroll-view>
	</view>
	<Mywork :userTravels="userTravels" :tip="tip"/>
	<view style="height: 300rpx;"></view>
</template>
 
<script setup>
	import { ref,onMounted, reactive,toRefs,onUnmounted } from 'vue'
	import {onReachBottom,onShow,onLoad} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	// 我的作品，收藏，喜欢组件
	import Mywork from '@/pages/Common-components/my-work.vue'
	// 点赞|关注|粉丝数
	const userData = ref([
		{
			num:0,
			title:'获赞'
		},
		{
			num:0,
			title:'关注'
		},
		{
			num:0,
			title:'粉丝'
		},
	])
	// 我的资料导航
	const userTab = ref([
		{
			title:'编辑资料',
			route:'/pages/personal-data/personal',
		},
		{
			title:'密码设置',
			route:'/pages/password-settings/password',
		}
	])
	// 存储用户基本信息
	const userInfor = reactive({
		avatarUrl:'',
		backdrop:'',
		nickname:'',
		age:'',
		city:'',
		uid:''
	})
	// 存储我的作品，收藏，喜欢
	const userTravels = ref([])
	onLoad(async()=>{
		uni.$on('loginSuccess',async data=>{
			// 监听登录成功后触发
			await myData()
		})
		uni.$on('uploadUserdata',async data=>{
			// 监听修改个人信息成功后触发
			getUserInfor()
		})
		await myData()
	})
	// 骨架屏
	const skeLeton = ref(true)
	// 用于判断是否登录
	const loginNot = ref(true)
	async function myData(){
	try{
		page.value = 1//再次查询时要把页数置为1
		tabIndex.value = 0
		// 查询我收到的点赞，关注，粉丝数量
		const myRelated = await requestApi('/my-related');
		// 查询我发布的游记
		const myTravel = await requestApi('/myTravEls',{page:1});
		console.log(myTravel);
		userTravels.value = myTravel.data
		const {concernCount,fansCount,likeCount} = myRelated.data
		// console.log(myRelated.data);
		userData.value[0].num = likeCount
		userData.value[1].num = concernCount
		userData.value[2].num = fansCount
		loginNot.value = true
		skeLeton.value = false
		getUserInfor()
	}catch(err){
		console.log(err);
		if(err == '401'){
			// 未登录，给默认头像，昵称，点击可再次触发登录
			loginNot.value = false
			userInfor.backdrop = 'https://diancan-1252107261.cos.accelerate.myqcloud.com/lvyou/1681234407965-700945.jpg'
			userInfor.avatarUrl = 'https://diancan-1252107261.cos.accelerate.myqcloud.com/lvyou/1681234402293-9911580.jpg'
			userInfor.nickname = '点击登录'
		}
		skeLeton.value = false
	}
	}
	// 获取或修改个人信息
	function getUserInfor(){
		const {avatarUrl,backdrop,nickname,uid,age,city} = uni.getStorageSync('userInfor')
		userInfor.avatarUrl = avatarUrl;
		userInfor.backdrop = backdrop;
		userInfor.nickname = nickname;
		userInfor.uid = uid;
		userInfor.age = age;
		userInfor.city = city;
	};
	const tabNav = ref(['作品','收藏','喜欢'])
	// 存储我的作品收藏点赞接口
	const apiRe = ref(['/myTravEls','/myCollEction','/myLikeArticle'])
	//存储选项卡选中哪个
	const tabIndex = ref(0)
	// 存储提示
	const tipData = ref(['你还没有发布作品','快去收藏游记吧','你还没有喜欢的游记'])
	const tip = ref('你还没有发布作品')
	// 查询我的作品收藏点赞
	async function handleTabTap(e) {
		const index = e.currentTarget.dataset.index;
		tabIndex.value = index
		tip.value = tipData.value[tabIndex.value]
		page.value = 1//再次查询时要把页数置为1
		if(index === 0){//作品
			const myTravel = await requestApi(apiRe.value[0],{page:1});
			userTravels.value = myTravel.data
		}else if(index === 1){//收藏
			const myTravel = await requestApi(apiRe.value[1],{page:1});
			userTravels.value = myTravel.data
		}else{//喜欢
			const myTravel = await requestApi(apiRe.value[2],{page:1});
			userTravels.value = myTravel.data
		}
	}
	// 上拉加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		const API = apiRe.value[tabIndex.value]
		const user_travels = await requestApi(API,{page:page.value})
		userTravels.value = [...userTravels.value,...user_travels.data]
	})
	// 再次掉起登录
	function gotoLogin(){
		// if(!loginNot.value){
		// 	wx.navigateTo({ url: '/pages/Login-pop-up/login'});
		// }
		wx.navigateTo({url:'/pages/Login-pop-up/login'})
	}
	// 更新资料
	function editData(){
		if(!loginNot.value){
			wx.navigateTo({ url: '/pages/Login-pop-up/login'});
			return false
		}
		wx.navigateTo({ url: '/pages/personal-data/personal'});
	}
	// 导航路由
	function juMp(router,index){
		if(!loginNot.value){
			wx.navigateTo({ url: '/pages/Login-pop-up/login'});
			return false
		}
		wx.navigateTo({ url: router});
	}
	
</script>

<style>
.mine-top{
	height: 500rpx;
	position: relative;
}
.mine-top-back{
	width: 100%;
	height: 500rpx;
}
.mine-user{
	position: absolute;
	top: 400rpx;
	left: 0;
	right: 0;
	background-color:#fefefe;
	border-top-left-radius: 40rpx;
	border-top-right-radius: 40rpx;
	padding: 100rpx 40rpx 0 40rpx;
}
.mine-user-avatar{
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	border: 8rpx solid #ffffff;
	position: absolute;
	bottom: 40rpx;
	left: 40rpx;
	right: 0;
	z-index: 999;
	display: inline-block;
	box-sizing: border-box;
	box-shadow: 10rpx 40rpx 40rpx rgba(217, 217, 217, .9);
}
.user-nickname{
	font-size: 40rpx;
	font-weight: bold;
}
.user-data{
	padding: 20rpx 20rpx 20rpx 0;
}
.user-data text:nth-child(1){
	font-weight: bold;
	padding-right: 10rpx;
}
.user-data text:nth-child(2){
	color: #8f9092;
	font-size: 28rpx;
}
.age-view text{
	font-size: 28rpx;
	background-color: #f3f3f4;
	border-radius: 6rpx;
	padding: 4rpx 10rpx;
	color:#74757b;
	margin: 0 10rpx 20rpx 0;
}
.uid-view text{
	color: #8f9092;
	font-size: 28rpx;
}
.user-navigation{
	text-align: center;
	margin-top: 20rpx;
}
.user-navigation text{
	background-color: #f3f3f4;
	font-size: 28rpx;
	flex: 1;
	padding: 20rpx 0;
	font-weight: bold;
	border-radius: 8rpx;
}
.user-navigation text:nth-child(2){
	margin-left: 10rpx;
}
.user-navigation text:nth-child(1){
	margin-right: 10rpx;
}
.position-height{
	height: 340rpx;
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
</style>