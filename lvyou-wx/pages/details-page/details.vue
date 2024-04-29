<template>
<share-element key="yourkey" transition-on-gesture> 
	<!-- 作者 -->
	<view class="details-top">
		<view class="buttonTop"></view>
		<view class="author-view global-display global-a-items"
		v-for="(item,index) in articleData.author_data" :key="index">
			<image src="/static/icon/index/fanhui.png" mode="widthFix" @click="retuRnPage"></image>
			<image :src="item.avatarUrl" mode="aspectFill"></image>
			<view class="author-name">
				<text>{{item.nickname}}</text>
				<text>{{articleData.time}}发布</text>
			</view>
			<view class="concern-author" @click="attentionAuthor(articleData.isConcerned,item.uid)">{{articleData.isConcerned ? '已关注' : '+ 关注'}}</view>
		</view>
	</view>
	<!-- 站位高度 -->
	<view class="zhanHeight"></view>
	<!-- 轮播 -->
	<view>
	<swiper class="swiper-view" indicator-dots indicator-active-color="#ffffff" circular>
		<block v-for="(item,index) in articleData.image" :key="index">
		<swiper-item class="swiper-item">
			<image class="fadeIn" :src="item" mode="aspectFill"></image>
		</swiper-item>
		</block>
	</swiper>
	</view>
	<!-- 城市 -->
	<view v-if="Object.keys(articleData).length > 0" class="article-city global-display global-a-items">
		<text v-if="articleData.city != articleData.address" @click="chooseCity(articleData.city)">{{articleData.city}}</text>
		<text @click="chooseCity(articleData.address)">{{articleData.address}}</text>
	</view>
	<!-- 文章 -->
	<view class="author-essay">
		<text>{{articleData.title}}</text>
		<text>{{articleData.content}}</text>
	</view>
	<!-- 相关推荐 -->
	<view v-show="userTravels.length > 0">
		<text class="rec-the-same">相关推荐</text>
		<card :userTravels="userTravels"/>
		<view class="View-more" v-if="userTravels.length >= 6" @click="loadMore">{{moreRecommend}}</view>
	</view>
	<view style="height: 200px;"></view>
	<!-- 底部：点赞，评价数，收藏 -->
	<view class="bottom-oper global-display global-a-items global-j-content">
		<view class="bottom-oper-feel">
			<input hold-keyboard placeholder="谈谈感受" disabled @click="geComment"/>
		</view>
		<view class="oper-number global-display">
			<view class="global-display global-a-items global-f-direction" v-for="(item,index) in bottomOper" :key="index" @click="operatingState(index)">
				<image :src="item.status ? item.selectedIconPath : item.iconPath" mode="widthFix"></image>
				<text>{{item.text}}</text>
			</view>
		</view>
	</view>
</share-element>
<!-- 弹出评论区 -->
<commentsSection/>
</template>

<script setup>
import { ref,onMounted, reactive } from "vue"
import {onReachBottom,onPageScroll,onLoad,onUnload} from '@dcloudio/uni-app'
import {MenuButton} from '@/api/MenuButton.js'
import Dianzan from '@/static/icon/index/dianzan.svg'
import Yidianzan from '@/static/icon/index/yidianzan.svg'
import Pinglun from '@/static/icon/index/pinglun.svg'
import Showcang from '@/static/icon/index/shoucang.svg'
import Yishowcang from '@/static/icon/index/yishoucang.svg'
import {requestApi} from '@/api/request.js'
import card from '@/pages/Common-components/card-flow.vue'
// pinia
import { dataSet } from "@/store/index.js";
const store = dataSet();
import commentsSection from '@/pages/Common-components/comments-section.vue'

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
// 评论内容
const message = ref('')
// 存储文章详情
const articleData = ref({})
// 存储评论数据
const commentsData = ref([])
// 存储游记对象_id
const articleId = ref('')
//存储相关推荐游记数据
const userTravels = ref([])
// 请求接口:获取游记详情
onLoad(async(event)=>{
	// 接收路由动态id
	articleId.value = event._id
	uni.$on('loginSuccess',async data=>{
		// 监听登录成功后触发
		await detailsTravel()
	})
	await detailsTravel()
})
async function detailsTravel(){
	// 游记详情
	const article_data = await requestApi('/article-data',{article_id:articleId.value})
	// 文章数据----
	articleData.value = article_data.data[0]
	// 获取点赞，评论，收藏数量,是否点赞，收藏-----
	const {likes,comments,collections,isLike,isCollecTions} = article_data.data[0]
	bottomOper.value[0].text = likes
	bottomOper.value[0].status = isLike
	bottomOper.value[1].text = comments
	bottomOper.value[2].text = collections
	bottomOper.value[2].status = isCollecTions
	// 相关推荐游记
	const user_travels = await requestApi('/rec-the-same',{article_id:articleId.value,page:1})
	userTravels.value = user_travels.data
}
// 拉起评论区获取数据
function geComment(){
	store.$patch({
	  commentBox: {
		  show:true,
		  _id:articleId.value
	  }
	})
}
// 关注和取消关注作者
async function attentionAuthor(isConcerned,uid){
	if(isConcerned){//取消关注
		await requestApi('/unfollow-author',{im_concerned_uid:uid})
		articleData.value.isConcerned = false
	}else{//关注
		await requestApi('/follow-author',{im_concerned_uid:uid})
		articleData.value.isConcerned = true
	}
}

// 点赞,取消点赞,收藏，取消收藏
async function operatingState(index){
	if(index === 0){//操作点赞
		if(bottomOper.value[0].status){//取消点赞
			await requestApi('/cancel-like',{article_id:articleId.value})
			bottomOper.value[0].status = false
			bottomOper.value[0].text--
		}else{//点赞
			await requestApi('/user-like',{article_id:articleId.value})
			bottomOper.value[0].status = true
			bottomOper.value[0].text++
		}
	}else if(index === 2){//操作收藏
		if(bottomOper.value[2].status){//取消收藏
			await requestApi('/cancel-collection',{article_id:articleId.value})
			bottomOper.value[2].status = false
			bottomOper.value[2].text--
		}else{//收藏
			await requestApi('/collect-travel',{article_id:articleId.value})
			bottomOper.value[2].status = true
			bottomOper.value[2].text++
		}
	}else if(index === 1){
		geComment()
	}
}

// 上啦加载更多推荐
const moreRecommend = ref('查看更多')
const rec_page = ref(1)
async function loadMore(){
	rec_page.value++
	const user_travels = await requestApi('/rec-the-same',{article_id:articleId.value,page:rec_page.value})
	userTravels.value = [...userTravels.value,...user_travels.data]
	if(user_travels.data.length <= 0){
		moreRecommend.value = '没有更多了'
	}
}
// 选择城市到pinia到定位页面
function chooseCity(city){
	store.$patch({
	  address: city
	})
	wx.switchTab({url:'/pages/found/found'})
}
// 返回上一页
function retuRnPage(){
	wx.navigateBack({
		delta:1
	})
}
// 监听如果点击了详情页里的推荐
uni.$on('detailspage',async value=>{
	const {_id} = value
	articleId.value = _id
	await detailsTravel()
	wx.pageScrollTo({scrollTop: 0})
})
</script>

<style scoped>
.details-top{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 99;
	height: v-bind('MenuButton().seViewHeight');
	background-color: #ffffff;
}
.zhanHeight{
	height: v-bind('MenuButton().seViewHeight');
}
.buttonTop{
	height: v-bind('MenuButton().top');
}
.occupy-space{
	height: v-bind('MenuButton().seViewHeight');
}
.custom-indicator {
    position: absolute;
    right: 10rpx;
    bottom: 20rpx;
    padding: 4rpx 20rpx;
    font-size: 24rpx;
    background: rgba(0, 0, 0, 0.6);
	border-radius: 6rpx;
	color: #ffffff;
}
.author-view{
	margin-left: 20rpx;
	width: v-bind('MenuButton().left');
	height: v-bind('MenuButton().height');
	/* background-color: #9f9f9f; */
}
.author-view image:nth-child(1){
	width: 35rpx;
	display: block;
	margin-right: 20rpx;
}
.author-view image:nth-child(2){
	width: v-bind('MenuButton().height');
	height: v-bind('MenuButton().height');
	border-radius: 50%;
	object-fit: cover;
}
.author-name{
	flex: 1;
	padding: 0 20rpx;
}
.concern-author{
	background-color: gold;
	padding: 8rpx 15rpx;
	border-radius: 10rpx;
	font-size: 26rpx;
}
/* 轮播 */
.swiper-view{
	height: 700rpx;
}
.swiper-item image{
	height: 700rpx;
	width: 100%;
}
/* 所在城市 */
.article-city{
	padding-top: 20rpx;
}
.article-city text{
	background-color: gold;
	margin-left: 20rpx;
	border-radius: 80rpx;
	font-size: 20rpx;
	font-weight: bold;
	padding: 10rpx 16rpx;
}
.author-essay{
	margin: 40rpx 20rpx;
}
.author-essay text:nth-child(1){
	font-weight: bold;
	font-size: 40rpx;
	padding-bottom: 40rpx;
}
.author-essay text:nth-child(2){
	line-height: 1.5;
	font-size: 30rpx;
}
.bottom-oper{
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #ffffff;
	height: 140rpx;
	font-size: 28rpx;
	color: #9f9f9f;
	border-top: 2rpx solid #f5f5f5;
	padding-bottom: 68rpx;
}
.bottom-oper-feel{
	background-color: #f5f7f9;
	padding: 16rpx;
	flex: 1;
	margin-left: 40rpx;
	border-radius: 80rpx;
}
.oper-number image{
	width: 50rpx;
	height: 50rpx;
}
.oper-number view{
	padding: 0 30rpx;
}
/* 评论区 */
.popups{
    height: 900rpx;
    overflow-y: hidden;
    width: 100%;
    background-color: #ffffff;
  }
.Comment-users{
	padding: 40rpx 20rpx;
}
.Comment-users image{
	width: 60rpx;
	height: 60rpx;
	border-radius: 8rpx;
}
.Comment-content{
	flex: 1;
	padding: 0 16rpx;
}
.Comment-content text:nth-child(1){
	color: #8c8c8c;
	padding-bottom: 6rpx;
}
.Comment-delete{
	color: #627095;
}
.View-more{
	color: #1989fa; 
	text-align: center;
	font-size: 24rpx;
}
.no-message{
	color: #8c8c8c !important;
	padding-top: 100rpx;
}
.rec-the-same{
	margin: 20rpx;
	font-size: 36rpx;
	font-weight: bold;
}
</style>