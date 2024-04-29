<template>
	<view class="search-view">
		<view class="search-input">
			<image src="/static/icon/found/sousuo-hei.png" mode="widthFix"></image>
			<input type="text" placeholder="搜索游记/景点" 
			@input="updateInput"
			@focus="focusInput"
			@confirm="onSearch"
			v-model="keywords"
			>
		</view>
		<view v-if="styleSwitch.categorySearch" class="tabswitch global-display global-j-around global-a-items">
			<view class="global-display global-f-direction global-a-items"
			v-for="(item,index) in tabData" :key="index"
			@click="onClickTab(index)"
			>
				<text :class="{ activeTab: tabIndex === index }">{{item}}</text>
				<text :class="{ activeBor: tabIndex === index }"></text>
			</view>
		</view>
	</view>
	<!-- 占位高度 -->
	<view class="search-height"></view>
	<!-- 搜索历史和热门城市 v-show="historyShow"-->
	<view class="search-padding" v-show="historyShow">
		<view v-if="historyData.length > 0">
			<view class="search-history global-display global-a-items global-j-content">
				<text>历史搜索</text>
				<image src="/static/icon/search/delete-search.png" mode="widthFix" @click="deleteHistory"></image>
			</view>
			<view class="history-data global-display global-a-items global-f-wrap">
				<text v-for="(item,index) in historyData" :key="index" @click="goSearch(item)">{{item}}</text>
			</view>
		</view>
		<!-- 热门城市 -->
		<view class="search-history global-display global-a-items global-j-content">
			<text>热门旅游城市</text>
		</view>
		<view class="Hot-city global-display global-a-items fadeIn" 
		v-for="(item,index) in hotCity" :key="index"
		@click="goSearch(item._id)">
			<image :src="item.image" mode="aspectFill"></image>
			<view>
				<text>{{item._id}}</text>
				<text>{{item.count}}人去过</text>
			</view>
		</view>
	</view>
	<!-- 显示实时搜索列表 -->
	<view class="search-list" v-show="listShow">
		<text class="text-show" v-for="(item,index) in searchList" :key="index" @click="goSearch(item)">{{item}}</text>
	</view>
	<!-- 展示搜索的作者 -->
	<view v-if="styleSwitch.author">
		<searchAuthorView :authorData="authorData"/>
	</view>
	<!-- 搜索结果展示 -->
	<view v-show="travelShow">
		<card :userTravels="userTravels"/>
	</view>
	<view style="height: 200rpx;"></view>
</template>

<script setup>
import { ref,reactive, onMounted } from "vue"
import {onReachBottom,onLoad} from '@dcloudio/uni-app'
// 防抖函数
import {debounceapi} from '@/api/debounceapi.js'
import {requestApi} from '@/api/request.js'
// 搜索的作者
import searchAuthorView from '@/pages/search-travel/components/search-author.vue'
// 瀑布流游记
import card from '@/pages/Common-components/card-flow.vue'
// 存储搜索历史数据
const historyData = ref([])
// 存储热门旅游城市
const hotCity = ref([])
// 存储实时搜索列表
const searchList = ref([])
// 隐藏 || 显示：搜索历史
const historyShow = ref(true)
// 隐藏 || 显示：搜索列表
const listShow = ref(false)
// 隐藏 || 显示：搜索出来的游记
const travelShow = ref(false)
// 搜索关键词
const keywords = ref('')
// 存储有热门城市或没有的样式切换
const styleSwitch = reactive({
	categorySearch:false,//是否展示搜索切换选项卡false
	topSearchHeight:'120rpx',
	author:false,//是否展示搜索的作者
})
// 输入时触发
const updateInput = debounceapi(async()=>{
	console.log('输入时触发');
	historyShow.value = keywords.value == '' ? true : false
	listShow.value = keywords.value == '' ? false : true
	travelShow.value = false
	//是否展示搜索的作者
	styleSwitch.author = false
	// 请求搜索列表
	const res = await requestApi('/search-travel',{keywords:keywords.value})
	searchList.value = res.data
})
// 暂存处理去重的搜索历史
const setKeywords = ref([])
// 搜索出的游记
const userTravels = ref([])
// 存储搜索出的作者数据
const authorData = ref([])
// 点击搜索列表去搜索数据
async function goSearch(item){
	keywords.value = item
	page.value = 1//再次搜索时要把页数置为1
	// 判断搜索作者还是游记
	if(tabIndex.value === 0){
		const res = await requestApi('/paging-search-result',{keywords:item,page:1})
		// console.log(res);
		userTravels.value = res.data
		travelShow.value = true
	}else{//搜索作者
		const resAuthor = await requestApi('/search-author',{keywords:item,page:1})
		console.log(resAuthor);
		styleSwitch.author = true
		authorData.value = resAuthor.data
	}
	// 展示搜索选项卡切换
	styleSwitch.categorySearch = true
	styleSwitch.topSearchHeight = '210rpx'
	historyShow.value = false
	listShow.value = false
	// 存储本地缓存：先去重
	setKeywords.value = wx.getStorageSync('searchKeywords') || []
	setKeywords.value.unshift(item)
	const newSetKeywords = Array.from(new Set(setKeywords.value))
	wx.setStorageSync('searchKeywords',newSetKeywords)//存
	// 页面上的搜索历史也要展示
	historyData.value.unshift(item)
	historyData.value = Array.from(new Set(historyData.value))
}
// 进入页面获取本地缓存的搜索历史和热门旅游城市
onMounted(async()=>{
	const res = wx.getStorageSync('searchKeywords')
	historyData.value = res || []
	const hotcity = await requestApi('/hot-city')
	hotCity.value = hotcity.data
})
// 清空搜索历史
function deleteHistory(){
	historyData.value = []
	wx.removeStorageSync('searchKeywords')
}
// 获取焦点时触发:如果输入框为空，则展示搜索历史部分，否则展示搜索列表
async function focusInput(){
	console.log('获取焦点时触发' + keywords.value);
	historyShow.value = keywords.value == '' ? true : false
	listShow.value = keywords.value == '' ? false : true
	travelShow.value = false
	styleSwitch.categorySearch = false
	styleSwitch.topSearchHeight = '120rpx'
	//是否展示搜索的作者
	styleSwitch.author = false
	if(keywords.value != ''){
		// 请求搜索列表
		const res = await requestApi('/search-travel',{keywords:keywords.value})
		searchList.value = res.data
	}
}
// 手动或回车按下搜索时触发
async function onSearch(){
	await goSearch(keywords.value)
}
// 点击tab选项卡，按游记或用户切换
const tabData = ref(['游记','作者'])
const tabIndex = ref(0)//存储选项卡选中哪个
async function onClickTab(event){
	tabIndex.value = event
	page.value = 1//再次搜索时要把页数置为1
	await goSearch(keywords.value)
	if(event === 0){//游记
		// 是否展示游记
		travelShow.value = true
		//是否展示搜索的作者
		styleSwitch.author = false
	}else{//作者
		// 是否展示游记
		travelShow.value = false
		//是否展示搜索的作者
		styleSwitch.author = true
	}
}

// 上啦加载瀑布流游记和作者
const page = ref(1)
onReachBottom(async()=>{
	if(!styleSwitch.categorySearch)return false
	page.value++
	if(tabIndex.value === 0){//游记
		const res = await requestApi('/paging-search-result',{page:page.value,keywords:keywords.value})
		userTravels.value = [...userTravels.value,...res.data]
	}else if(tabIndex.value === 1){//作者
		const resAuthor = await requestApi('/search-author',{page:page.value,keywords:keywords.value})
		authorData.value = [...authorData.value,...resAuthor.data]
	}
})
// 登陆成功被触发重新请求作者数据，
onLoad(()=>{
	uni.$on('loginSuccess',async data=>{
		// 监听登录成功后触发
		await goSearch(keywords.value)
	})
})
</script>

<style scoped>
.search-view{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 99;
	background-color: #ffffff;
}
.search-input{
	background-color: #f2f2f2;
	border-radius: 10rpx;
	margin: 20rpx;
	display: flex;
	flex-direction: row;
	flex: 1;
	position: relative;
}
.search-input input{
	height: 70rpx;
	width: 100%;
	font-size: 28rpx;
	padding-left: 80rpx;
	padding-right: 20rpx;
}
.search-input image{
	width: 28rpx;
	position: absolute;
	left: 30rpx;
	align-self: center;
}
.search-height{
	height: v-bind('styleSwitch.topSearchHeight');
}
/* tab切换 */
.tabswitch{
	padding: 20rpx 0;
}
.tabswitch text:nth-child(1){
	font-size: 30rpx;
}
.tabswitch text:nth-child(2){
	width: 50rpx;
	height: 8rpx;
	margin-top: 10rpx;
	border-radius: 4rpx;
}
.activeTab{
	color: #000;
}
.activeBor{
	background-color: #f8e254;
}
.search-padding{
	padding: 20rpx;
}
/* 搜索历史和热门城市 */
.search-history{
	margin-bottom: 10rpx;
}
.search-history image{
	width: 30rpx;
	height: 30rpx;
	display: block;
}
.search-history text{
	font-weight: bold;
	font-size: 32rpx;
}
.history-data{
	margin: 20rpx 0;
}
.history-data text{
	background-color: #f9f9f9;
	border-radius: 80rpx;
	padding: 12rpx 20rpx;
	margin: 0 20rpx 20rpx 0;
	font-size: 30rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: calc(7 * 40rpx + 2 * 1rpx); /* 显示7个字符 */
}
.Hot-city{
	padding: 10rpx 0;
	box-sizing: border-box;
}
.Hot-city image{
	width: 120rpx;
	height: 120rpx;
	border-radius: 8rpx;
	display: block;
}
.Hot-city view{
	flex: 1;
	padding-left: 20rpx;
}
.Hot-city text{
	padding: 6rpx 0;
}
.Hot-city text:nth-child(2){
	color: #bdbdbd;
}
/* 触发实时搜索展示 */
.search-list{
	padding: 0 20rpx;
}
.search-list text{
	border-bottom: 2rpx solid #e3e4e7;
	/* padding: 12px 0; */
	height: 80rpx;
	line-height: 80rpx;
}
</style>