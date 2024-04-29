<template>
	<view class="concern-view" v-if="userTravelData.length > 0" v-for="(item,index) in userTravelData" :key="index">
		<view class="concern-name concern-Padd global-display global-a-items">
			<image :src="item.author_data[0].avatarUrl" class="fadeIn" mode="aspectFill"></image>
			<view class="concern-nackname">
				<text>{{item.author_data[0].nickname}}</text>
				<text>{{item.time_stamp}}</text>
			</view>
		</view>
		<view class="card-view-b" v-if="item.fileType == 'image'">
			<view v-for="(item_a,index_a) in item.image.slice(0, 5)" 
			:key="index_a"
			@click="showImage(item.image,item_a)"
			>
				<image :src="item_a" mode="aspectFill" class="fadeIn"></image>
				<text v-if="item.image.length > 5" class="fadeIn">+{{item.image.length - 5}}</text>
			</view>
		</view>
		<view class="card-view-c" v-else @click="juMp(item._id,item.fileType)">
			<image :src="item.cover_image.url" mode="aspectFill"></image>
			<image src="/static/icon/video/video-bofang.svg" mode="widthFix"></image>
		</view>
		<!-- 地址 -->
		<view class="concern-address concern-Padd global-display global-a-items">
			<image src="/static/icon/concern/concern-address.png" mode="widthFix"></image>
			<text class="text-show">{{item.address}}</text>
		</view>
		<!-- 标题，内容 -->
		<view class="concern-content" @click="juMp(item._id,item.fileType)">
			<text>{{item.title}}</text>
			<text class="concern-details concern-Padd text-show">{{item.content}}</text>
		</view>
		<!-- 评论，点赞，收藏 -->
		<view class="concern-Data concern-Padd global-display global-a-items">
			<view @click="juMp(item._id,item.fileType)">
				<image :src="Pinglun" mode="widthFix"></image>
				<text>{{item.comments}}</text>
			</view>
			<view @click="giveAlike(index,item.isLiked,item._id)">
				<image :src="item.isLiked ? Yidianzan : Dianzan" mode="widthFix"></image>
				<text>{{item.likes}}</text>
			</view>
			<view @click="operCollection(index,item.isCollect,item._id)">
				<image :src="item.isCollect ? Yishowcang : Showcang" mode="widthFix"></image>
				<text>{{item.collections}}</text>
			</view>
		</view>
	</view>
<view style="height: 200rpx;"></view>
<!-- 如果没有数据 -->
<view class="kong-view" v-if="prompt">
	<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
	<text class="no-data" v-if="noData">这里没有数据</text>
	<text class="login-button" v-if="login" @click="goLogin">登录</text>
</view>
</template>

<script setup>
	import {ref,nextTick} from 'vue'
	import {onReachBottom,onLoad} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	import Dianzan from '@/static/icon/index/dianzan.svg'
	import Yidianzan from '@/static/icon/index/yidianzan.svg'
	import Pinglun from '@/static/icon/index/pinglun.svg'
	import Showcang from '@/static/icon/index/shoucang.svg'
	import Yishowcang from '@/static/icon/index/yishoucang.svg'
	// 存储用户游记数据
	const userTravelData = ref([])
	// 显示//隐藏提示,没有数据和登录
	const prompt = ref(false)
	const noData = ref(false)
	const login = ref(false)
	onLoad(()=>{
		uni.$on('loginSuccess',async data=>{
			// 监听登录成功后触发
			requestRes()
		})
		requestRes()
	})
	// 请求数据
	async function requestRes(){
		try{
			const userFauthor = await requestApi('/user-following-author',{page:1})
			console.log(userFauthor);
			userTravelData.value = userFauthor.data
			prompt.value = userFauthor.data.length > 0 ? false : true
			noData.value = userFauthor.data.length > 0 ? false : true
			login.value = false
		}catch(err){
			if(err == "401"){
				prompt.value = true
				noData.value = false
				login.value = true
			}
		}
	}
	// 预览图片
	function showImage(image,item_a){
		wx.previewImage({
		  current: item_a, // 当前显示图片的http链接
		  urls: image // 需要预览的图片http链接列表
		})
	}
	// 跳转详情页
	function juMp(_id,fileType){
		if(fileType == 'image'){
			wx.navigateTo({url:'/pages/details-page/details?_id=' + _id})
		}else{
			wx.navigateTo({url:'/pages/details-page/video?_id=' + _id})
		}
	}
	// 点赞和取消点赞
	async function giveAlike(index,isLiked,_id){
		if(isLiked){//取消点赞
			await requestApi('/cancel-like',{article_id:_id})
			userTravelData.value[index].isLiked = false
			userTravelData.value[index].likes--
		}else{//点赞
			await requestApi('/user-like',{article_id:_id})
			userTravelData.value[index].isLiked = true
			userTravelData.value[index].likes++
		}
	}
	// 收藏和取消收藏
	async function operCollection(index,isCollect,_id){
		if(isCollect){//取消收藏
			await requestApi('/cancel-collection',{article_id:_id})
			userTravelData.value[index].isCollect = false
			userTravelData.value[index].collections--
		}else{//收藏
			await requestApi('/collect-travel',{article_id:_id})
			userTravelData.value[index].isCollect = true
			userTravelData.value[index].collections++
		}
	}

	// 上拉加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		const userFauthor = await requestApi('/user-following-author',{page:page.value})
		userTravelData.value = [...userTravelData.value,...userFauthor.data]
	})
	// 登录
	function goLogin(){
		wx.navigateTo({ url: '/pages/Login-pop-up/login'});
	}
</script>

<style>
.concern-view{
	border-bottom: 2rpx solid #e3e4e7;
	padding: 0 20rpx;
}
.concern-Padd{
	margin: 20rpx 0;
}
.concern-name image{
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
}
.concern-nackname{
	padding-left: 20rpx;
}
.concern-nackname text:nth-child(1){
	font-weight: bold;
}
.concern-nackname text:nth-child(2){
	font-size: 24rpx;
	padding-top: 6rpx;
	color: #717375;
}
.card-view-b{
	display: grid;
	grid-template-rows: repeat(2, 1fr); /* 设置两行，每行占据 1/2 */
	/* grid-template-columns: repeat(3, 1fr); */
	grid-template-columns: 40% calc(30% - 6rpx) calc(30% - 6rpx); /* 设置三列，第一列占据 40%，后面两列每列占据 30%（包括间距） */
	grid-gap: 6rpx; /* 设置元素之间的间距 */
}
/* 设置第一列的第一个子元素占据两行 */
.card-view-b view:first-child {
	grid-row: 1 / span 2;
	grid-column: 1;
	height: calc(2 * 200rpx + 6rpx);
}
.card-view-b view{
	height: 200rpx;
	position: relative;
	overflow: hidden;
	border-radius: 6rpx;
}
.card-view-b image{
	width: 100%;
	height: 100%;
}
.card-view-b view:last-child text{
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: #ffffff;
	font-weight: bold;
	font-size: 48rpx;
	background-color: rgb(0, 0, 0, 0.3);
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
/* 视频 */
.card-view-c{
	height: 350rpx;
	width: 100%;
	position: relative;
}
.card-view-c image:nth-child(1){
	height: 350rpx;
	width: 100%;
	display: block;
	border-radius: 10rpx;
}
.card-view-c image:nth-child(2){
	position: absolute;
	width: 55rpx;
	bottom: 0;
	left: 50%;
	top: 50%;
	transform: translateX(-50%) translateY(-50%);
}
.concern-address{
	background-color: #fdf4c4;
	font-size: 26rpx;
	font-weight: bold;
	display: inline-flex;
	padding: 10rpx 20rpx;
	border-radius: 80rpx;
}
.concern-address image{
	width: 28rpx;
	height: 28rpx;
	display: block;
	margin-right: 6rpx;
}
.concern-content text:nth-child(1){
	font-weight: bold;
}
.concern-details {
	-webkit-line-clamp: 2 !important;
	line-height: 1.5;
}
/* 点赞，收藏，评论数 */
.concern-Data view:nth-child(1){
	flex: 1;
}
.concern-Data view:nth-child(2){
	padding: 0 60rpx;
}
.concern-Data image{
	width: 50rpx;
	height: 50rpx;
	display: block;
}
.concern-Data text{
	font-size: 26rpx;
	display: block;
	align-self: flex-start;
	color: #717375;
}
.concern-Data view{
	display: flex;
}
/* 推荐关注 */
.rec-Attention{
	padding: 40rpx 0;
}
.rec-Attention-p{
	font-size: 36rpx;
	font-weight: bold;
	padding: 0 20rpx 20rpx 20rpx;
}

.Interested-in view{
	background-color: #f9f9f9;
	padding: 40rpx;
	margin: 0 6rpx;
	border-radius: 14rpx;
}
.Interested-in image{
	width: 110rpx;
	height: 110rpx;
	border-radius: 50%;
	display: block;
}
.Interested-in text{
	margin: 10rpx 0;
	font-size: 28rpx;
	font-weight: bold;
	width: 140rpx;
	text-align: center;
}
.Interested-in text{
	font-size: 26rpx;
	font-weight: bold;
	background-color: #f9f0bf;
	border-radius: 80rpx;
	width: 120rpx;
	height: 30rpx;
	line-height: 50rpx;
	text-align: center;
}
.disable{
	pointer-events:none;
	background: none !important;
	border: 2rpx solid gainsboro;
	color: gainsboro;
	box-sizing: border-box;
}
</style>