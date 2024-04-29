<template>
	<view>
		<movable-area class="movable-area">
			<movable-view class="movable-view" :x="x" :y="y" direction="all" @click="toPage">
				<image src="/static/gpt/logo-a.png"></image>
			</movable-view>
		</movable-area>
	</view>
</template>
 
<script>
	export default {
		data() {
			return {
				x: 320,		//x坐标
				y: 520,		//y坐标
			}
		},
			
		methods:{
			
			toPage(){
				uni.navigateTo({
					url:'/pages/xh-gpt/index'
				})
			}
		}
	}
</script>
 
<style lang="scss">
	$all_width: 96rpx;
	$all_height:96rpx;
 
	.movable-area {
		height: 100vh;
		width: 750rpx;
		top: 0;
		position: fixed;
		pointer-events: none;		//此处要加，鼠标事件可以渗透
		z-index: 999;
		.movable-view {
			width: $all_width;
			height: $all_height;
			pointer-events: auto;	//恢复鼠标事件
			image {
				width: $all_width;
				height: $all_height;
			}
		}
	}
</style>