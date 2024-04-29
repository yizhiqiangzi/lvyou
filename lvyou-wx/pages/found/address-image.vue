<template>
	<scroll-view scroll-y type="custom">
		<grid-view type="masonry" cross-axis-count="2">
			<view v-for="(item,index) in imageData" :key="index">
				<image lazy-load :src="item" class="fadeIn cover-image" 
				mode="widthFix"
				@click="previewImage(item)"
				></image>
			</view>
		</grid-view>
	</scroll-view>
	<view class="kong-view" v-if="exist">
		<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
		<text class="no-data">没有更多啦</text>
	</view>
	<view style="height: 200rpx;"></view>
</template>

<script setup>
	import {ref} from 'vue'
	import {onReachBottom,onLoad} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	const exist = ref(false)
	const imageData = ref([])//接收该页面数据
	const address = ref('')//查询的地址
	onLoad(async(event)=>{
		address.value = event.value
		const res = await requestApi('/addressImage',{page:1,address:address.value})
		exist.value = res.data.length > 0 ? false : true
		imageData.value = res.data
	})
	function previewImage(img){
		wx.previewImage({
		  current: img, // 当前显示图片的http链接
		  urls: imageData.value // 需要预览的图片http链接列表
		})
	}
	// 上拉加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		const res = await requestApi('/addressImage',{page:page.value,address:address.value})
		imageData.value = [...imageData.value,...res.data]
	})
</script>

<style scoped>
.cover-image{
	width: 100%;
	display: block;
}
</style>