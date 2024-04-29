<template>
	<view class="card-view" >
		<view class="item-card fadeIn" v-for="(item,index) in userTravels"
		:key="index"
		@click="juMp(item._id,item.fileType)"
		>
			<image lazy-load :src="item.cover_image.url" class="cover-image fadeIn" mode="aspectFill"></image>
			<view class="cover-adress global-display global-a-items">
				<image src="/static/icon/index/address.png" mode="aspectFill"></image>
				<text class="text-show">{{item.address}}</text>
			</view>
		</view>
	</view>
	<!-- 如果没有数据 -->
	<view class="kong-view" v-if="userTravels.length <= 0">
		<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
		<text class="no-data">{{tip}}</text>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	defineProps({
		userTravels: {type:Array,required:true},
		tip:{type:String,required:true}
	})
	function juMp(_id,fileType){
		if(fileType == 'image'){
			wx.navigateTo({url:'/pages/details-page/details?_id=' + _id})
		}else{
			wx.navigateTo({url:'/pages/details-page/video?_id=' + _id})
		}
	}
</script>

<style scoped>
.card-view{
	display: grid; 
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 6rpx;
}
.item-card{
	height: 360rpx;
	position: relative;
}
.cover-image{
	width: 100%;
	height: 360rpx;
	display: block;
}
.cover-adress{
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 0 0 20rpx 20rpx;
	background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
}
.cover-adress image{
	width: 24rpx;
	height: 24rpx;
	display: block;
}
.cover-adress text{
	font-size: 20rpx;
	font-weight: bold;
	color: #ffffff;
	padding-left: 10rpx;
}
</style>