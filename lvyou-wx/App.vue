<script setup>
	import { onLaunch } from "@dcloudio/uni-app";
	onLaunch(() => {
	  // 获取胶囊按钮的坐标
	  let get_Menu = uni.getStorageSync('MenuButton')
	  if(!get_Menu){
	    const res = uni.getMenuButtonBoundingClientRect()
	    uni.setStorageSync('MenuButton',res)//存
	  }
	});
</script>

<style>
	text{
	  font-size: 26rpx;
	  display: block;
	}
	button::after{
		border: none;
	}
	cover-view{
		line-height: initial;
	}
	.global-display{
	  display: flex;
	}
	.global-f-wrap{
	  flex-wrap: wrap;
	}
	.global-f-direction{
	  flex-direction: column;
	}
	.global-j-content{
	  justify-content: space-between;
	}
	.global-j-around{
	  justify-content: space-around;
	}
	.global-j-end{
	  justify-content: end;
	}
	.global-a-items{
	  align-items: center;
	}
	.text-show{
		display: -webkit-box;
		text-overflow: ellipsis;
		overflow: hidden;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}
	.fadeIn {
	  opacity: 0;
	  animation: fadeIn 0.3s ease forwards;
	}
	
	@keyframes fadeIn {
	  from {
	    opacity: 0;
	  }
	  to {
	    opacity: 1;
	  }
	}
	.kong-view{
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 100rpx;
	}
	.no-data{
		color: #969799;
	}
	.login-button{
		background-color: #f8d957;
		text-align: center;
		display: inline-block;
		padding: 15rpx 90rpx;
		margin: 20rpx 0;
		border-radius: 10rpx;
	}
	.kong-view image {
		width: 150rpx;
		display: block;
		margin-bottom: 15rpx;
	}
	/* 骨架屏 */
	.skeleton-view{
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #FFFFFF;
		z-index: 999;
		overflow: hidden;
		padding: 20rpx;
	}
	.skeleton-global{
		background-color: #f2f3f5; /* 修改为你需要的背景色 */
		position: relative;
		overflow: hidden;
		border-radius: 16rpx;
	}
	.skeleton-global::before {
		content: "";
		display: block;
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(to right, transparent 0%, #e6e6e6 50%, transparent 100%);
		animation: loading 1s infinite;
	}
	@keyframes loading {
		from {
		left: -100%;
		}
		to {
		left: 100%;
		}
	}
	/* 阿里字体 */
	@font-face {
		font-family: 'myfont';
		src: url("/static/font/nFq0osqEm9qr.woff2") format("woff2"),
		url("/static/font/nFq0osqEm9qr.woff") format("woff");
	}
	/* 评论框公用 */
	.Custom-tag{
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background-color: rgba(0, 0, 0, 0.3);
		z-index: 99;
		display: flex;
		align-items: flex-end;
	}
	.Custom-tag view{
		background-color: #ffffff;
		height: 200rpx;
		width: 100%;
		padding: 10rpx;
		z-index: 999;
	}
</style>
