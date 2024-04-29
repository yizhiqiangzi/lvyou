<template>
	<view class="content">
		<view class="all-content">
			<header>
				<view class="header-wrapper">
					<view class="header-text">
						<m-skeleton :loading="loading" width="300rpx" height="30rpx">
							<view @tap="locationChange">
								<text class="iconfont icon-location w-icon"></text>
								<!-- {{ locationInfo.province }} {{ locationInfo.city }} {{ locationInfo.county }} -->
							</view>
						</m-skeleton>
					</view>
				</view>
			</header>
			<view class="main-wrapper">
				<view class="main-txt">
					<m-skeleton :loading="loading" width="150rpx" height="150rpx">
						<text class="txt-temperature"><!-- {{ resultData.observe.degree }} -->温度°</text>
					</m-skeleton>
					<m-skeleton :loading="loading" :left="10" width="60rpx" height="60rpx">
						<text class="txt-name"><!-- {{ resultData.observe.weather_short }} --></text>
					</m-skeleton>
				</view>
				<view class="txt-other">
					<m-skeleton :loading="loading" width="500rpx" height="30rpx">
						<text class="txt-wind">东北风 <!-- {{ resultData.observe.wind_power }} -->级</text>
						<text class="txt-humidity">湿度 <!-- {{ resultData.observe.humidity }} -->%</text>
						<text class="txt-kpa">气压 <!-- {{ resultData.observe.pressure }} -->Hpa</text>
					</m-skeleton>
				</view>
				<view class="txt-tips">
					<m-skeleton :loading="loading" width="500rpx" height="50rpx">
						<text class="txt-info"><!-- {{ resultData.tips.observe && resultData.tips.observe[0] }} --></text>
					</m-skeleton>
				</view>
				<view class="weather-img">
					<m-skeleton :loading="loading" width="200rpx" height="200rpx">
						<!-- <image
							v-if="resultData.observe.weather_code"
							:src="`//mat1.gtimg.com/pingjs/ext2020/weather/pc/icon/currentweather/day/${resultData.observe.weather_code}.png`"
							mode=""
						></image> -->
					</m-skeleton>
				</view>
			</view>
			<view class="hours-wrapper">
				<m-skeleton :loading="loading" width="100%" height="150rpx" />
				<!-- <card-block v-if="!loading" title="逐小时预报">
					<view class="hours-list">
						<view class="hours-item" v-for="(item, index) in resultData.forecast_1h" :key="index">
							<view class="item-time">{{ formatTimeToHours(item.update_time) }}</view>
							<view class="item-icon"><image :src="`//mat1.gtimg.com/pingjs/ext2020/weather/pc/icon/weather/day/${item.weather_code}.png`" mode=""></image></view>
							<view class="item-degree">{{ item.degree }}°</view>
						</view>
					</view>
				</card-block> -->
			</view>
			<view class="living-index-wrapper">
				<!-- <view class="living-item" v-for="(item, index) in livingArr" :key="index">
					<m-skeleton :isBlock="true" :loading="loading" width="100%" height="200rpx">
						<card-block>
							<view :class="item.icon"></view>
							<view class="info">{{ item.name }} {{ item.info }}</view>
						</card-block>
					</m-skeleton>
				</view> -->
			</view>
		</view>
		<!-- <w-picker
			mode="region"
			:defaultVal="[locationInfo.province, locationInfo.city, locationInfo.county]"
			:areaCode="areaCode"
			:hideArea="false"
			@cancel="locationCancel"
			@confirm="locationConfirm"
			themeColor="#659af8"
			ref="region"
		></w-picker> -->
	</view>
</template>

<script>

</script>

<style scoped lang="scss">
page {
	background: #f6f9fe;
}
.header-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10rpx 5rpx;
	background-color: #659af8;
	.header-text {
		font-size: 30rpx;
		color: #fff;
	}
}
.main-wrapper {
	height: 600rpx;
	padding: 0rpx 55rpx;
	background-color: #659af8;
	color: #ffffff;
	position: relative;
	.main-txt {
		.txt-temperature {
			font-size: 108rpx;
		}
		.txt-name {
			// padding-left: 10rpx;
		}
	}
	.txt-other {
		margin: 25rpx 0rpx;
		font-size: 30rpx;
		text:not(:last-child) {
			margin-right: 15rpx;
		}
	}
	.txt-tips {
		position: relative;
		padding-left: 5rpx;
		.txt-info:before {
			content: '';
			float: left;
			transform: translateY(25%);
			margin-right: 13rpx;
			height: 30rpx;
			width: 30rpx;
			background: #fff;
			border-radius: 50%;
			// padding-left: 13rpx;
		}
	}
	.weather-img {
		position: absolute;
		bottom: 25rpx;
		right: 20rpx;
		image {
			width: 230rpx;
			height: 230rpx;
		}
	}
}
.hours-wrapper {
	margin: 15rpx 0rpx;
	padding: 0rpx 15rpx;
	.hours-list {
		display: flex;
		overflow-x: auto;
		// 隐藏滚动条样式
		&::-webkit-scrollbar {
			display: none;
		}
		.hours-item {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: center;
			&:not(:last-child) {
				margin-right: 55rpx;
			}
			.item-icon {
				margin: 10rpx 0rpx;
				image {
					width: 88rpx;
					height: 88rpx;
				}
			}
			.item-time {
				color: #8a9baf;
				font-size: 30rpx;
			}
			.item-degree {
				font-size: 35rpx;
			}
		}
	}
}
.living-index-wrapper {
	display: flex;
	padding: 0rpx 15rpx;
	flex-wrap: wrap;
	justify-content: space-between;
	.living-item {
		margin: 30rpx 0rpx;
		flex-basis: 48%;
		.info {
			font-size: 35rpx;
			color: black;
			text-align: center;
		}
	}
	$imgUrl: url('http://mat1.gtimg.com/pingjs/ext2020/weather/2017/images/sprites/sprite-7d98dbada9.png');
	.icon {
		height: 34px;
		width: 34px;
		display: block;
		margin: 0 auto 22rpx;
		background-image: $imgUrl;
		&.chuanyishushi {
			background-position: -80px -37px;
		}
		&.yusan {
			background-position: 0 -154px;
		}
		&.ganmao {
			background-position: -74px -154px;
		}
		&.xiche {
			background-position: -154px -111px;
		}
		&.yundong {
			background-position: -37px -43px;
		}
		&.fangsai {
			background-position: 0 -43px;
		}
	}
}
.w-icon {
	color: #ffffff;
	margin-right: 10rpx;
}
</style>
