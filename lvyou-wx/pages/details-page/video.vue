<template>
<view class="search-video">
	<view class="buttonTop"></view>
	<view class="global-display global-a-items">
		<image class="video-fanhui" src="/static/icon/login-pop-up/fanhui.png" mode="widthFix" @click="fanHui"></image>
		<view class="search-input" @click="juMp">
			<image src="/static/icon/found/sousuo-bai.png" mode="widthFix"></image>
			<input type="text" placeholder="搜索景点/游记" placeholder-class="input-color" disabled>
		</view>
	</view>
</view>
<!-- :id="`myVideo${index}`" -->
<swiper vertical duration="300" easing-function="default" @change="changeSwiper">
	<swiper-item v-for="(item,index) in articleData" :key="index">
	<view style="position: relative;">
		<view>
		<video 
			:id="`myVideo${index}`"
			 loop
			 :controls="false"
			 enable-play-gesture
			 :show-center-play-btn="false"
			 :object-fit="(item.videoUrl.width / item.videoUrl.height) <= 0.6 ? 'cover' : 'contain'"
			 class="video-style"
			 :src="item.videoUrl.url"
			 @play="playFun"
			 @pause="pauseFun"
		 ></video>
		 </view>
		<!-- 左下角 -->
		<view class="video-infor">
			<view class="video-infor-author">@{{item.author_data[0].nickname}}</view>
			<view class="video-infor-content text-show">
			{{item.content}}
			</view>
			<view class="global-display global-a-items">
				<image src="/static/icon/search/search-address.png" mode="widthFix"></image>
				<view>{{item.address}}</view>
			</view>
		</view>
		<!-- 右下角 -->
		<view class="video-right">
			<view class="video-right-author">
				<image :src="item.author_data[0].avatarUrl" mode="aspectFill"></image>
				<image v-if="!item.isConcerned" src="/static/icon/video/guanzhu.png"
				mode="widthFix"
				@click="attentionAuthor(item.author_data[0].uid,index)"
				></image>
			</view>
			<!-- 点赞 -->
			<view class="video-right-like">
				<image :src="item.isLike ? Yidianzan : Dianzan" mode="widthFix"
				@click="operLike(item.isLike,index,item._id)"
				></image>
				<view>{{item.likes}}</view>
			</view>
			<!-- 评论 -->
			<view class="video-right-like">
				<image :src="Pinglun" mode="widthFix" @click="geComment(item._id)"></image>
				<view>{{item.comments}}</view>
			</view>
			<!-- 收藏 -->
			<view class="video-right-like">
				<image :src="item.isCollecTions ? Yishowcang : Showcang" 
				mode="widthFix"
				@click="operCollecTions(item.isCollecTions,index,item._id)"
				></image>
				<view>{{item.collections}}</view>
			</view>
		</view>
		<!-- 视频中间播放按钮 -->
		<view class="bofang-video" @click="videoPlay(index)" v-show="startVideo">
			<image src="/static/icon/video/video-bofang.svg" mode="widthFix"></image>
		</view>
	</view>
	</swiper-item>
</swiper>
<commentsSection />
</template>

<script setup>
	import { ref,nextTick } from "vue";
	import {MenuButton} from '@/api/MenuButton.js'
	import commentsSection from '@/pages/Common-components/comments-section.vue'
	import Dianzan from '@/static/icon/video/weidianzan.png'
	import Yidianzan from '@/static/icon/video/yidianzan.png'
	import Pinglun from '@/static/icon/video/pinglun.png'
	import Showcang from '@/static/icon/video/weishoucang.png'
	import Yishowcang from '@/static/icon/video/yishoucang.png'
	import {requestApi} from '@/api/request.js'
	import {onLoad,onShow,onUnload} from '@dcloudio/uni-app'
	// pinia
	import { dataSet } from "@/store/index.js";
	const store = dataSet();
	// 宽高比，小于等于0.5，cover
	// 存储点赞，评论，收藏状态
	const bottomOper = ref([
		{
			"text": 0,//数量
			"status":false,//状态
			"iconPath": Dianzan,//未点赞图标
			"selectedIconPath": Yidianzan//已点赞图标
		},
		{
			"text": 0,
			"status":false,
			"iconPath": Pinglun,
			"selectedIconPath": Pinglun
		},
		{
			"text": 0,
			"status":false,
			"iconPath": Showcang,
			"selectedIconPath": Yishowcang
		}
	])

	// 存储文章详情
	const articleData = ref([])
	// 存储游记对象_id
	const articleId = ref('')
	// 请求接口:获取游记详情
	onLoad(async(event)=>{
		// 接收路由动态id,上个页面传来
		articleId.value = event._id
		uni.$on('loginSuccess',async data=>{
			// 监听登录成功后触发
			await detailsTravel()
		})
		await detailsTravel()
		setTimeout(()=>{
			wx.createVideoContext("myVideo0").play()
		},300)
	})

	async function detailsTravel(){
		apiPage.value = 1
		// 游记详情：初次进入第一个
		const article_data = await requestApi('/article-data',{article_id:articleId.value})
		// console.log(article_data);
		// 文章数据----
		articleData.value = article_data.data
		
		// 获取相关推荐视频
		const user_travels_video = await requestApi('/rec-the-video',{article_id:articleId.value,page:1})
		// console.log(user_travels_video);
		articleData.value = [...articleData.value,...user_travels_video.data]
	}
	
	// 关注作者
	async function attentionAuthor(authorUid,index){
		await requestApi('/follow-author',{im_concerned_uid:authorUid})
		articleData.value[index].isConcerned = true
	}
	// 点赞,取消点赞
	async function operLike(status,index,articleId){
		if(status){//取消点赞
			await requestApi('/cancel-like',{article_id:articleId})
			articleData.value[index].isLike = false
			articleData.value[index].likes--
		}else{//点赞
			await requestApi('/user-like',{article_id:articleId})
			articleData.value[index].isLike = true
			articleData.value[index].likes++
		}
	}
	// 收藏，取消收藏
	async function operCollecTions(status,index,articleId){
		if(status){//取消点赞
			await requestApi('/cancel-collection',{article_id:articleId})
			articleData.value[index].isCollecTions = false
			articleData.value[index].collections--
		}else{
			await requestApi('/collect-travel',{article_id:articleId})
			articleData.value[index].isCollecTions = true
			articleData.value[index].collections++
		}
	}
	// 滑块滑动,视频切换播放
	const myvideo = ref('myVideo0')
	const apiPage = ref(1)
	async function changeSwiper(event){
		wx.createVideoContext(myvideo.value).pause()
		myvideo.value = `myVideo${event.detail.current}`
		wx.createVideoContext(myvideo.value).play()
		//如果小于三条视频就不再请求，当是3的倍数时继续请求
		const pageCount = event.detail.current + 1
		if(articleData.value.length >= 3){
			if(pageCount % 3 === 0){
				apiPage.value++
				const user_travels_video = await requestApi('/rec-the-video',{article_id:articleId.value,page:apiPage.value})
				articleData.value = [...articleData.value,...user_travels_video.data]
			}
		}
	}
	// 继续播放触发
	const startVideo = ref(false)
	function playFun(){
		startVideo.value = false
	}
	// 暂停播放触发
	function pauseFun(){
		startVideo.value = true
	}
	// 点击播放按钮继续播放
	function videoPlay(index){
		wx.createVideoContext(`myVideo${index}`).play()
	}
	// 拉起评论区获取数据
	function geComment(_id){
		store.$patch({
		  commentBox: {show:true,_id}
		})
	}
	// 跳转搜索
	function juMp(){
		wx.navigateTo({
			url:'/pages/search-travel/search'
		})
	}
	// 返回上一页
	function fanHui(){
		wx.navigateBack({
		  delta: 1
		})
	}
</script>

<style>
page{
	background-color: black;
	overflow: hidden;
}
.search-video{
	position: fixed;
	top: 0;
	left: 0;
	right: v-bind('MenuButton().width');
	z-index: 99;
}
.video-fanhui{
	width: 35rpx;
	display: block;
	margin-left: 20rpx;
}
.buttonTop{
	height: v-bind('MenuButton().top');
}
.search-input{
	border-radius: 20rpx;
	margin-left: 20rpx;
	display: flex;
	flex-direction: row;
	flex: 1;
	position: relative;
	height: v-bind('MenuButton().height');
	width: v-bind('MenuButton().left');
	background-color: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(5rpx);
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
	color: #ffffff;
	font-size: 28rpx;
}
swiper{
	height: 100vh;
	position: relative;
}
.video-style{
	width: 100%;
	height: 100vh;
}
.video-infor{
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	color: #ffffff;
	padding: 10rpx 135rpx 120rpx 30rpx;
	background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)); 
}
.video-infor image{
	width: 30rpx;
	display: block;
	margin-right: 8rpx;
}
.video-infor-author{
	font-weight: bold;
	font-size: 32rpx;
}
.video-infor-content{
	margin: 10rpx 0;
	line-height: 1.4;
	-webkit-line-clamp: 2;
}
.video-right{
	position: absolute;
	right: 30rpx;
	bottom: 230rpx;
	color: #ffffff;
}
.video-right-author{
	position: relative;
	width: 100rpx;
	height: 112rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.video-right-author image:nth-child(1){
	width: 100rpx;
	height: 100rpx;
	border: 4rpx solid #ffffff;
	border-radius: 50%;
	box-sizing: border-box;
}
.video-right-author image:nth-child(2){
	width: 35rpx;
	position: absolute;
	bottom: 0;
}
.video-right-like{
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 40rpx;
}
.video-right-like image{
	width: 67rpx;
}
.video-right-like text{
	padding-top: 10rpx;
}
.bofang-video{
	width: 110rpx;
	height: 110rpx;
	position: absolute;
	bottom: 0;
	left: 50%;
	top: 50%;
	transform: translateX(-50%) translateY(-50%);
}
.bofang-video image{
	width: 110rpx;
	height: 110rpx;
	z-index: 999;
}
</style>