<template>
	<view class="companion-view" v-for="(item,index) in managingData" :key="index">
		<view class="companion-name global-display global-a-items">
			<image :src="item.author_data[0].avatarUrl" class="fadeIn" mode="aspectFill"></image>
			<view>
				<text>{{item.author_data[0].nickname}}</text>
				<text>{{item.timestamp}}报名</text>
			</view>
		</view>
		<view class="companion-time global-display global-a-items managing-user">
			<text>联系方式：&nbsp;{{item.contact_inform}}</text>
		</view>
		<view class="companion-time global-display global-a-items managing-user">
			<text>性别：&nbsp;{{item.gender === 1 ? '男' : '女'}}</text>
		</view>
		<view class="companion-time global-display global-a-items managing-user">
			<text>介绍：&nbsp;{{item.introduce}}</text>
		</view>
	</view>
	<!-- 如果没有数据 -->
	<view class="kong-view" v-if="exist">
		<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
		<text class="no-data">你还没有任何相关活动</text>
	</view>
<view style="height: 200rpx;"></view>
</template>

<script setup>
import {ref} from 'vue'
import {onReachBottom,onLoad} from '@dcloudio/uni-app'
import {requestApi} from '@/api/request.js'

// 存储接收到的数据
const managingData = ref([])
const exist = ref(false)
const managingId = ref('')
onLoad(async(event)=>{ 
	const _id = event._id
	managingId.value = _id
	const res = await requestApi('/managing-member',{id:_id,page:1});
	console.log(res);
	managingData.value = res.data
	exist.value = res.data.length > 0 ? false : true
})
// 上啦加载
const page = ref(1)
onReachBottom(async()=>{
	page.value++
	const res = await requestApi('/managing-member',{id:managingId.value,page:page.value});
	managingData.value = [...managingData.value,...res.data]
})
</script>

<style>
@import url('@/style/index.css');
.managing-user{
	padding-top: 16rpx !important;
	padding-bottom: 0 !important;
}
</style>