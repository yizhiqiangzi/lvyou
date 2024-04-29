<template>
	<!-- 推荐 -->
	<!-- <p class="recommend">推荐</p> -->
	<view class="Mainstream-view global-display global-a-items" v-if="newestTravel.length > 0">
	  <!-- 左边 -->
		<view class="Mainstream-left" 
		@click="juMP(newestTravel[int].travel_id,newestTravel[int].fileType)">
	    <image class="Mainstream-left-image fadeIn" 
		:src="newestTravel[int].imageUrl"
		mode="aspectFill"
		></image>
	    <view class="Mainstream-bottom">
	      <p class="m-title text-show">{{newestTravel[int].title}}</p>
	      <view class="global-display global-a-items">
		  <image :src="newestTravel[int].avatarUrl" mode="aspectFill"></image>
	      <p class="m-name">{{newestTravel[int].nickname}}</p>
			<p class="m-name text-show dis-flex">我在&nbsp;{{newestTravel[int].address}}</p>
	      </view>
	    </view>
	  </view>
		<!-- 右边 -->
	  <view class="Mainstream-right global-display global-f-direction">
		<image v-for="(item,index) in newestTravel" :key="index" :src="item.imageUrl"
		mode="aspectFill"
		:class="{img_border:index == int}"
		 @click="recoMmend(index)"
		></image>
	  </view>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	defineProps({newestTravel:Array})
	// 切换推荐
	const int = ref(0)
	function recoMmend(index){
		int.value = index
	}
	// 推荐跳转
	function juMP(_id,fileType){
		if(fileType == 'image'){
			wx.navigateTo({url:'/pages/details-page/details?_id=' + _id})
		}else{
			wx.navigateTo({url:'/pages/details-page/video?_id=' + _id})
		}
	}
</script>

<style scoped>
.recommend{
  font-size: 34rpx;
  font-weight: bold;
  margin: 20rpx;
}
.Mainstream-view{
  margin: 0 20rpx 20rpx 20rpx;
  height: 400rpx;
  border-radius: 10rpx;
  background-color: #7d89b9;
  overflow: hidden;
}
.Mainstream-left{
  position: relative;
  flex: 1;
  height: 400rpx;
}
.Mainstream-left-image{
  width: 100%;
  height: 400rpx;
  object-fit: cover;
}
.Mainstream-bottom{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: #ffffff;
  padding: 0 0 20rpx 20rpx;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8));
}
.Mainstream-bottom image{
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  object-fit: cover;
}
.m-title{
  margin-bottom: 20rpx;
  font-size: 32rpx;
  font-weight: bold;
}
.m-name{
  padding-left: 16rpx;
  font-size: 24rpx;
}
.dis-flex{
	flex: 1;
}
.Mainstream-right{
	gap: 16rpx;
	margin: 0 16rpx;
}
.Mainstream-right image{
	display: block;
	width: 120rpx;
	height: 80rpx;
	object-fit: cover;
	border-radius: 6rpx;
}
.img_border{
	border: 4rpx solid yellow;
	box-sizing: border-box;
}
</style>