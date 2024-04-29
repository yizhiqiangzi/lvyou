<template>
	<view class="content">
		<view class="all-content">
			<header>
				<view class="header-wrapper">
					<view class="header-text">
						<m-skeleton :loading="state.loading" width="300rpx" height="30rpx">
							<view @click="locationChange">
								<text class="iconfont icon-location w-icon"></text>
								{{ state.locationInfo.province }} {{ state.locationInfo.city }}
								{{ state.locationInfo.county }}
							</view>
						</m-skeleton>
					</view>
				</view>
			</header>
			<view class="main-wrapper">
				<view class="main-txt">
					<m-skeleton :loading="state.loading" width="150rpx" height="150rpx">
						<text class="txt-temperature">{{ state.resultData.observe.degree }}°</text>
					</m-skeleton>
					<m-skeleton :loading="state.loading" :left="10" width="60rpx" height="60rpx">
						<text class="txt-name">{{ state.resultData.observe.weather_short }}</text>
					</m-skeleton>
				</view>
				<view class="txt-other">
					<m-skeleton :loading="state.loading" width="500rpx" height="30rpx">
						<view style="display: flex;">
							<text class="txt-wind">{{state.resultData.observe.wind_direction_name}} {{ state.resultData.observe.wind_power }}级</text>
							<text class="txt-humidity">湿度 {{ state.resultData.observe.humidity }}%</text>
							<text class="txt-kpa">气压 {{ state.resultData.observe.pressure }}Hpa</text>
						</view>
					</m-skeleton>
				</view>
				<view class="txt-tips">
					<m-skeleton :loading="state.loading" width="500rpx" height="50rpx">
						<text
							class="txt-info">{{ state.resultData.tips.observe && state.resultData.tips.observe[0] }}</text>
					</m-skeleton>
				</view>
				<view class="weather-img">
					<m-skeleton :loading="state.loading" width="200rpx" height="200rpx">
						<image v-if="state.resultData.observe.weather_code"
							:src="`//mat1.gtimg.com/pingjs/ext2020/weather/pc/icon/currentweather/day/${state.resultData.observe.weather_code}.png`"
							mode=""></image>
					</m-skeleton>
				</view>
			</view>
			<view class="hours-wrapper">
				<m-skeleton :loading="state.loading" width="100%" height="150rpx" />
				<card-block v-if="!state.loading" title="逐小时预报">
					<view class="hours-list">
						<view class="hours-item" v-for="(item, index) in state.resultData.forecast_1h" :key="index">
							<view class="item-time">{{ formatTimeToHours(item.update_time) }}</view>
							<view class="item-icon">
								<image
									:src="`//mat1.gtimg.com/pingjs/ext2020/weather/pc/icon/weather/day/${item.weather_code}.png`"
									mode=""></image>
							</view>
							<view class="item-degree">{{ item.degree }}°</view>
						</view>
					</view>
				</card-block>
			</view>
			<view class="living-index-wrapper">
				<view class="living-item" v-for="(item, index) in state.livingArr" :key="index">
					<m-skeleton :isBlock="true" :loading="state.loading" width="100%" height="200rpx">
						<card-block>
							<view :class="item.icon"></view>
							<view class="info">{{ item.name }} {{ item.info }}</view>
						</card-block>
					</m-skeleton>
				</view>
			</view>
		</view>
		<w-picker mode="region"
			:defaultVal="[state.locationInfo.province, state.locationInfo.city, state.locationInfo.county]"
			:areaCode="state.areaCode" :hideArea="false" @cancel="locationCancel" @confirm="locationConfirm"
			themeColor="#659af8" ref="regionRef"></w-picker>
	</view>
</template>

<script setup>
	// import $weatherApi from '@/api/weather';
	import {
		ref,
		reactive
	} from 'vue'
	// components
	import CardBlock from '@/components/CardBlock';
	import MSkeleton from '@/components/MSkeleton/index';
	import wPicker from '@/components/w-picker/w-picker.vue';
	import {
		getAreaCodeArr
	} from '@/components/w-picker/utils';
	import {
		onMounted
	} from 'vue';
	import {
		getLocationDetailApi,
		getWeatherApi
	} from '@/api/weather.js'

	const regionRef = ref()
	const state = reactive({
		contentHeight: {
			marginTop: `44px`
		},
		loading: true,
		areaCode: ['44', '4403', '440305'],
		locationInfo: {
			province: '广东省',
			city: '深圳市',
			county: '宝安区'
		},
		livingArr: [{
				icon: 'icon chuanyishushi',
				name: '穿衣',
				info: ''
			},
			{
				icon: 'icon yusan',
				name: '雨伞',
				info: ''
			},
			{
				icon: 'icon ganmao',
				name: '感冒',
				info: ''
			},
			{
				icon: 'icon xiche',
				name: '洗车',
				info: ''
			},
			{
				icon: 'icon yundong',
				name: '运动',
				info: ''
			},
			{
				icon: 'icon fangsai',
				name: '防晒',
				info: ''
			}
		],
		resultData: {
			forecast_1h: [],
			observe: {
				degree: 0,
				humidity: 0,
				precipitation: 0,
				pressure: 0,
				update_time: '',
				weather: '',
				weather_code: '',
				weather_short: '',
				wind_direction: '',
				wind_power: ''
			},
			tips: {
				observe: {}
			}
		},
		areaPickerInfo: {}

	})

	const getLocation = () => {
		uni.getLocation({
			// #ifdef MP-WEIXIN
			type: 'wgs84',
			// #endif
			async success(res) {
				const {
					latitude,
					longitude
				} = res;
				const result = await getLocationDetailApi({
					location: `${latitude},${longitude}`,
					key: 'XJLBZ-QFTHJ-ZODFA-KNR74-WGRCO-QEB56'
				});
				let {
					province,
					city,
					district
				} = result.result.address_component;
				state.areaCode = getAreaCodeArr(province, city, district);
				await getWeather(province, city, district);
				// that.$nextTick(() => {
				// 	state.loading = false;
				// })
			},
			fail() {
				uni.showModal({
					content: '检测到您没打开定位权限，是否去设置打开？',
					confirmText: '确认',
					cancelText: '取消',
					success: function(res) {
						if (res.confirm) {
							// #ifdef MP-WEIXIN
							wx.openSetting({
								success: res => {}
							});
							// #endif
							// #ifdef MP-ALIPAY
							my.openSetting({
								success: res => {}
							});
							// #endif
						}
					}
				});
			}
		});
	}

	const getWeather = async (province, city, district, district_id) => {
		try {
			state.loading = true;
			let result = await getWeatherApi({
				source: 'xw',
				weather_type: 'observe|alarm|air|forecast_1h|forecast_24h|index|limit|tips|rise',
				province: province,
				city: city,
				county: district
			});
			if (Object.keys(result.data.observe).length == 0) throw new Error();
			state.resultData = result.data;
			// 生活指数
			let indexs = Object.keys(state.resultData.index).map(key => state.resultData.index[key]);
			state.livingArr.forEach(item => {
				let findItem = indexs.find(it => it.name == item.name);
				if (findItem) {
					item.info = findItem.info;
				}
			});
			state.locationInfo.province = province;
			if (province == city) {
				state.locationInfo.city = '';
			} else {
				state.locationInfo.city = city;
			}
			state.locationInfo.county = district;
			state.loading = false;
		} catch (e) {
			//TODO handle the exception
			uni.showToast({
				title: '抱歉，暂无该地区天气',
				icon: 'none'
			});
			state.loading = false;
		}
	}
	const locationChange = () => {
		regionRef.value.show();
	}
	const locationConfirm = async (val) => {
		state.areaPickerInfo = val;
		let province = state.areaPickerInfo.checkArr[0];
		let city = state.areaPickerInfo.checkArr[1];
		let county = state.areaPickerInfo.checkArr[2];
		if (state.areaPickerInfo.checkArr[1] == '市辖区' || state.areaPickerInfo.checkArr[1] == '县') {
			city = province;
		}
		await getWeather(province, city, county);
	}
	const locationCancel = () => {
		state.areaPickerInfo = null;
	}
	const onConfirm = () => {}
	const formatTimeToHours = (time) => {
		let currentTime = time.substring(0, 10);
		let hours = currentTime.substr(-2);
		return hours + ':00';
		// return hours;
	}

	onMounted(() => {
		getLocation()
	})
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

				.item-icon{
					margin:10rpx 0rpx;

					image{
						width:88rpx;
						height:88rpx;
					}
				}

				.item-time{
					color:#8a9baf;
					font-size:30rpx;
				}

				.item-degree{
					font-size:35rpx;
				}
			}
		}
	}

	.living-index-wrapper{
		display:flex;
		padding:0rpx15rpx;
		flex-wrap:wrap;
		justify-content:space-between;

		.living-item{
			margin:30rpx0rpx;
			flex-basis:48%;

			.info{
				font-size:35rpx;
				color:black;
				text-align:center;
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