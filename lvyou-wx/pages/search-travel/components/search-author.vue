<template>
	<view class="search-author global-display global-a-items"
	v-for="(item,index) in authorData" :key="index">
		<view>
			<image :src="item.avatarUrl" mode="aspectFill"></image>
		</view>
		<view class="search-author-name">
			<text>{{item.nickname}}</text>
			<text>粉丝：{{item.numberOfFans}}</text>
		</view>
		<view :class="[item.concernedUser ? 'yiguanzhu' : 'weiguanzhu']"
		@click="attentionAuthor(item.concernedUser,item.uid,index)"
		>{{item.concernedUser ? '已关注' : '+ 关注'}}</view>
	</view>
	<!-- 如果没有数据 -->
	<view class="kong-view" v-if="authorData.length <= 0">
		<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
		<text class="no-data">没有更多啦</text>
	</view>
</template>

<script setup>
	import {requestApi} from '@/api/request.js'
	const props = defineProps({
		authorData: {type:Array,required:true}
	})
	// 关注和取消关注
	async function attentionAuthor(value,uid,index){
		if(value){//取消关注
			await requestApi('/unfollow-author',{im_concerned_uid:uid})
			props.authorData[index].concernedUser = false
		}else{//关注
			await requestApi('/follow-author',{im_concerned_uid:uid})
			props.authorData[index].concernedUser = true
		}
	}
</script>

<style scoped>
/* 搜索作者 */
.search-author{
	padding: 20rpx;
}
.search-author image{
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
}
.search-author view{
	font-size: 32rpx;
}
.search-author view:nth-child(2){
	flex: 1;
	padding: 0 20rpx;
}
.search-author view:nth-child(3){
	padding: 12rpx 0;
	width: 160rpx;
	text-align: center;
	border-radius: 8rpx;
}
.yiguanzhu{
	border: 2rpx solid #797979;
}
.weiguanzhu{
	background-color: #e8df4d;
}
.search-author-name text{
	padding: 4rpx 0;
}
.search-author-name text:nth-child(1){
	font-weight: bold;
}
.search-author-name text:nth-child(2){
	color: #797979;
	font-size: 30rpx !important;
}
</style>