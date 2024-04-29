<template>
<view class="card-view" >
	<!-- 左边 -->
	<template v-for="(items, index) in [leftItems, rightItems]" :key="index">
	<view v-if="index === 0 || index === 1">
		<view class="item-card fadeIn" v-for="(item,index) in items" :key="index" @click="juMp(item._id)">
			<view class="cover-drawing">
				<image :src="item.cover_image.url" class="cover-image" mode="widthFix"></image>
				<view class="cover-adress global-display global-a-items">
					<image src="/static/icon/index/address.png" mode="widthFix"></image>
					<text class="text-show">{{item.address}}</text>
				</view>
			</view>
			<p class="cart-Title-text text-show">{{item.title}}</p>
			<view class="global-display global-j-content">
				<view class="card-name global-display global-a-items" v-for="(item_a,index_a) in item.author_data" :key="index">
					<image :src="item_a.avatarUrl" mode="aspectFill" class="avatarUrl"></image>
					<text>{{item_a.nickname}}</text>
				</view>
				<view class="card-name global-display global-a-items">
					<image src="/static/icon/index/page-zan.png" class="page-zan"></image>
					<text>{{item.likes}}</text>
				</view>
			</view>
		</view>
	</view>
	</template>
</view>
<view class="kong-view" v-if="exist">
	<image src="/static/icon/index/kong-zhuang-tai.png" mode="widthFix"></image>
	<text>没有更多啦</text>
</view>
</template>

<script setup>
import { ref,onMounted,reactive,watch, } from 'vue'
const props = defineProps({
	userTravels: {type:Array,required:true}
})

// 左侧和右侧的数据列表
let leftItems = ref([]);
let rightItems = ref([]);
// 左侧和右侧的高度
let leftHeight = ref(0);
let rightHeight = ref(0);

const exist = ref(false)
watch(props,(newValue,oldValue)=>{
	// 将初始图片列表按照高度均衡地分配到左右两侧
	const {userTravels} = newValue
	leftItems.value = [];
	rightItems.value = [];
	leftHeight.value = 0;
	rightHeight.value = 0;
	if(userTravels.length > 0){
		userTravels.forEach(item => {
		  if (leftHeight.value <= rightHeight.value) {
		    leftItems.value.push(item);
		    leftHeight.value += item.cover_image.height;
		  } else {
		    rightItems.value.push(item);
		    rightHeight.value += item.cover_image.height;
		  }
		});
		// console.log(userTravels);
	}
	exist.value = leftItems.value.length > 0 ? false : true
})

function juMp(_id){
	
}
</script>

<style scoped>
/* ----------- */
.card-view{
	padding: 0 10rpx;
	display: grid; 
	grid-template-columns: repeat(2, 1fr);
}
.item-card{
	padding: 10rpx;
	box-sizing: border-box !important;
}
.data-left {
    grid-column: 1 / 2;
}
.data-right {
	grid-column: 2 / 3;
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
.cart-Title-text{
	font-size: 28rpx;
	font-weight: bold;
	padding-top: 14rpx;
	line-height:1.4;
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