<template>
	<page-container :show="popupShow" close-on-slide-down round 
	@afterleave="afterLeave"
	z-index="999"
	>
		<scroll-view class="popups" scroll-y type="custom" :show-scrollbar="false"
		enable-passive
		enhanced
		scroll-anchoring
		lower-threshold="100"
		@scrolltolower="scrollTolower">
		<view>
			<view class="Comment-users global-display" v-for="(item,index) in commentsData" :key="index">
				<image :src="item.comment_user[0].avatarUrl" mode="aspectFill"></image>
				<view class="Comment-content global-display global-f-direction">
					<view>{{item.comment_user[0].nickname}}</view>
					<view>{{item.content}}</view>
				</view>
				<view class="Comment-delete" v-if="item.isComment_user" @click="deleteComment(item._id,index)">删除</view>
			</view>
			<view class="no-message" v-if="commentsData.length === 0">等你来评论!</view>
		</view>
		<view style="height: 500rpx;"></view>
		</scroll-view>
		<!-- 评论框 -->
		<view class="traver-Custom-tag">
			<view @click.stop="" class="comment-View">
				<input 
					placeholder="我来讲两句"
					cursor-spacing="30"
					confirm-type="send"
					placeholder-class="place-class"
					v-model="message"
					@confirm="confirmInput"
				/>
				<view @click="confirmInput" class="SendAcomment">发送</view>
			</view>
		</view>
	</page-container>
</template>

<script setup>
	import { ref,watch,onBeforeMount,onBeforeUnmount,onUnmounted } from "vue";
	import {requestApi} from '@/api/request.js'
	import {onLoad,onUnload} from '@dcloudio/uni-app'
	// pinia
	import { dataSet } from "@/store/index.js";
	const store = dataSet();
	// 是否弹出评论区
	const popupShow = ref(false)
	const commentsData = ref([])
	// 该条游记id
	const articleId = ref('')
	// 存储评论内容
	const message = ref('')
	watch(store.commentBox,async(newVal)=>{
		const {_id,show} = newVal
		popupShow.value = show
		articleId.value = _id
		page.value = 1
		if(show){
			// 获取每个视频评论数据
			const res = await requestApi('/comments-data',{article_id:_id,page:1})
			commentsData.value = res.data
		}
	})
	// 离开后触发
	function afterLeave(){
		store.$patch({
		  commentBox: {
			  show:false,
			  _id:''
		  }
		})
	}
	// 评论视频
	async function confirmInput(){
		if(message.value == ''){return false}
		const res = await requestApi('/comment-travel',{article_id:articleId.value,comment_content:message.value},'POST')
		// 这里评论成功返回该条评论的内容
		commentsData.value.unshift(res.data)
		message.value = ''
	}
	// 删除自己的评论
	async function deleteComment(_id,index){
		await requestApi('/comments-delete',{comment_id:_id})
		commentsData.value.splice(index,1)
	}
	// 上啦加载
	const page = ref(1)
	async function scrollTolower(){
		page.value++
		const res = await requestApi('/comments-data',{article_id:articleId.value,page:page.value})
		commentsData.value = [...commentsData.value,...res.data]
	}
</script>

<style>
/* 评论区 */
.popups{
    height: 1200rpx;
    width: 100%;
    background-color: #FFFFFF;
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
.no-message{
	text-align: center;
	padding: 130rpx 0;
	font-size: 30rpx;
	color: cadetblue;
}
/* 评论框 */
.traver-Custom-tag{
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #f2f2f2;
	height: 200rpx;
}
.comment-View{
	padding: 20rpx 20rpx 0 20rpx;
	display: flex;
}
.traver-Custom-tag input{
	background: #ffffff;
	border-radius: 10rpx;
	padding: 13rpx 15rpx;
	flex: 1;
}
.place-class{
	font-size: 30rpx;
	color: #adadad;
}
.SendAcomment{
	background-color: gold;
	border-radius: 10rpx;
	width: 130rpx;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	margin-left: 30rpx;
}
</style>