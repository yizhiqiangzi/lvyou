<template>
<scroll-view
:style="{height: exist ? 0 : 'inherit'}"
scroll-y type="custom"
scroll-anchoring
scroll-with-animation
enable-passive
enhanced
:show-scrollbar="false"
>
<view class="card-view">
<grid-view type="masonry" cross-axis-count="2"> 
	<view class="item-card fadeIn" v-for="(item,index) in userTravels" :key="index" @click="juMp(item._id,item.fileType)">
		<view class="cover-drawing">
			<image lazy-load :src="item.cover_image.url" 
			v-if="item.cover_image.width / item.cover_image.height < 0.8" 
			class="cover-image image-Height fadeIn" mode="aspectFill">
			</image>
			<image lazy-load :src="item.cover_image.url"
			v-else class="cover-image fadeIn" mode="widthFix">
			</image>
			<view class="cover-adress global-display global-a-items">
				<image src="/static/icon/index/address.png" mode="widthFix"></image>
				<text class="text-show">{{item.address}}</text>
			</view>
			<image v-if="item.fileType == 'video'" class="duanshipin" src="/static/icon/index/duanshipin.png" mode="widthFix"></image>
		</view>
		<p class="cart-Title-text text-show">{{item.title}}</p>
		<view class="global-display global-j-content">
			<view class="card-name global-display global-a-items" v-for="(item_a,index_a) in item.author_data" :key="index">
				<image lazy-load :src="item_a.avatarUrl" mode="aspectFill" class="avatarUrl"></image>
				<text>{{item_a.nickname}}</text>
			</view>
			<view class="card-name global-display global-a-items">
				<image src="/static/icon/index/page-zan.png" class="page-zan"></image>
				<text>{{item.likes}}</text>
			</view>
		</view>
	</view>
</grid-view>
</view>
</scroll-view>
<view class="kong-view" v-if="exist">
	<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
	<text class="no-data">没有更多啦</text>
</view>
</template>

<script setup>
import { ref,onMounted,reactive,watch } from 'vue'
const props = defineProps({
	userTravels: {type:Array,required:true}
})
const exist = ref(false)
watch(props,(newVal)=>{
	// console.log(newVal);
	exist.value = newVal.userTravels.length > 0 ? false : true
})
/* 
宽高比等于1，不加宽高度，宽高比小于等于0.7，宽高为172,216；

 */

function juMp(_id,fileType){
	const pageRouter = getCurrentPages()
	// 如果是点击详情页里的推荐，则不再做路由跳转,短视频除外
	if(pageRouter[pageRouter.length - 1].route == 'pages/details-page/details'){
		if(fileType == 'video'){
			wx.navigateTo({url:'/pages/details-page/video?_id=' + _id})
		}else{
			uni.$emit('detailspage',{_id})
		}
	}else{
		if(fileType == 'image'){
			wx.navigateTo({url:'/pages/details-page/details?_id=' + _id})
		}else{
			wx.navigateTo({url:'/pages/details-page/video?_id=' + _id})
		}
	}
}
</script>

<style scoped>
/* ----------- */
.card-view{
	padding: 0 10rpx;
}
.item-card{
	padding: 10rpx;
	box-sizing: border-box !important;
}
.cover-drawing{
	position: relative;
	border-radius: 20rpx;
	overflow: hidden;
}
.cover-image{
	width: 100%;
	display: block;
}
.image-Height{
	height: 432rpx;
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
.duanshipin{
	display: block;
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 35rpx;
}
.cart-Title-text{
	font-size: 28rpx;
	font-weight: bold;
	padding-top: 14rpx;
	line-height:1.4;
	-webkit-line-clamp: 2 !important;
}
.card-name{
	padding: 14rpx 0;
}
.avatarUrl{
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
}
.page-zan{
	width: 30rpx;
	height: 30rpx;
}
.card-name text{
	padding-left: 12rpx;
	font-size: 26rpx;
	color: #717375;
}
</style>