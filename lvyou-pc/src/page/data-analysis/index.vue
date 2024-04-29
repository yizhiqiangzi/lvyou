<template>
    <div id="Content-page">
		<Paging :pagData="[{name:'数据分析',router:'/analysis'}]" />
		<!-- <div ref="main" style="width: 600px;height:400px;"></div> -->
		<!-- 头部 -->
		<div class="global-a-grid">
			<div class="top-data" v-for="(item,index) in topData" :key="index">
				<p>{{item.quantity}}</p>
				<p>{{item.type}}</p>
			</div>
		</div>
		<!-- 旅游十大人气目的地 -->
		<div class="Top-ten-popularity">
			<div class="below-below">
				<p class="Top-ten-title">十大人气旅游目的地</p>
				<div id="popularity"></div>
			</div>
			<div class="below-below">
				<p class="Top-ten-title">用户性别占比</p>
				<div id="gender"></div>
			</div>
		</div>
		<!-- 最感兴趣旅游城市 -->
		<div class="below-data">
			<!-- 最感兴趣旅游城市 -->
			<div class="below-below">
				<p class="Top-ten-title">八大最感兴趣旅游城市排名</p>
				<div class="below-title global-display global-j-content global-a-items">
					<p>城市</p>
					<p>人气</p>
				</div>
				<div class="below-city global-display global-j-content global-a-items"
				v-for="(item,index) in tableData" :key="index">
					<div class="heat-image global-display global-a-items">
						<img :src="item.cover_image.url">
						<p>{{item.city}}</p>
					</div>
					<div>{{item.count}}</div>
				</div>
			</div>
			<!-- 词云图 -->
			<div class="below-below">
				<p class="Top-ten-title">词云图(用户兴趣标签)</p>
				<div id="wordcloud"></div>
			</div>
		</div>
		<!-- 高度 -->
		<div style="height: 200px;"></div>
	</div>
</template>

<script setup>
	import { ref,onMounted,onBeforeUnmount } from 'vue';
	// 顶部导航组件
	import Paging from '@/page/component/Paging-component.vue'
	import { Column,WordCloud,Pie } from '@antv/g2plot';
	import request from '@/api/request.js'
	// 顶部
	const topData = ref([])
	// 最感兴趣热门城市
	const tableData = ref([])
	// 各canvas实例
	const PIEPLOT = ref(null)
	const COLUMNPLOT = ref(null)
	const WORDCLOUD = ref(null)
	onMounted(async()=>{
		// 1,顶部游记和用户数据
		const Aa = await request.get('/userAnalysis')
		const {userCount,newUserCount,travelsCount,theSameDayTCount} = Aa.data
		topData.value = [
			{
				type:'累计注册用户',
				quantity:userCount
			},
			{
				type:'昨日新增用户',
				quantity:newUserCount
			},
			{
				type:'发布游记数量',
				quantity:travelsCount
			},
			{
				type:'今日发布游记',
				quantity:theSameDayTCount
			}
		]
		// 2,旅游十大人气目的地
		const Ab = await request.get('/hot-city')
		console.log(Ab);
		// 3，性别占比
		const Ae = await request.get('/getGenderRatio')
		const piePlot = new Pie('gender', {
		  appendPadding: 40,
		  data:Ae.data,
		  angleField: 'count',
		  colorField: '_id',
		  radius: 0.9,
		  color: ['#af9bff', '#ffca0a'],
		  label: {
		    type: 'inner',
		    offset: '-30%',
		    content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
		    style: {
		      fontSize: 14,
		      textAlign: 'center'
		    },
		  },
		  interactions: [{ type: 'element-active' }],
		});
		piePlot.render();
		PIEPLOT.value = piePlot
		// 3，最感兴趣旅游城市排名
		const Ac = await request.get('/cityOfInterest')
		tableData.value = Ac.data
		const columnPlot = new Column('popularity', {
		  data:Ab.data,
		  xField: '_id',
		  yField: 'count',
		  padding:30,
		  maxColumnWidth:20,
		  label: {
		    // 可手动配置 label 数据标签位置
		    position: 'middle', // 'top', 'bottom', 'middle',
		    // 配置样式
		    style: {
		      fill: '#FFFFFF',
		      opacity: 0.6,
		    },
		  },
		  xAxis: {
		    label: {
		      autoHide: true,
		      autoRotate: false,
		    },
		  },
		  meta: {
		    _id: {
		      alias: '城市',
		    },
		    count: {
		      alias: '人气',
		    },
		  },
		});
		columnPlot.render();
		COLUMNPLOT.value = columnPlot
		// 4，词云图
		const Ad = await request.get('/wordCloud')
		const wordCloud = new WordCloud('wordcloud', {
		  data:Ad.data,
		  spiral:'rectangular',
		  wordField: 'city',
		  weightField: 'count',
		  colorField: 'city',
		  wordStyle: {
			rotation: 0,
		  }
		});
		wordCloud.render();
		WORDCLOUD.value = wordCloud
	})
	
	// 销毁canvas
	onBeforeUnmount(()=>{
		PIEPLOT.value.destroy();
		COLUMNPLOT.value.destroy();
		WORDCLOUD.value.destroy();
	})
</script>

<style scoped>
.top-data{
	background-color: #ffffff;
	border-radius: 5px;
	padding: 20px 15px;
}
.top-data p:nth-child(1){
	font-size: 25px;
	font-weight: bold;
	padding-bottom: 10px;
}
.top-data p:nth-child(2){
	color: #999;
}
.Top-ten-popularity{
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-template-columns: 60% calc(40% - 10px);
	grid-gap: 10px;
	margin: 10px 0;
}
.Top-ten-title{
	font-weight: bold;
	font-size: 18px;
	padding: 10px;
}
.below-data{
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-gap: 10px;
}
.below-below{
	background-color: #ffffff;
	border-radius: 5px;
}
.below-title{
	padding: 10px;
	color: #999;
}
.below-city{
	padding: 10px;
	border-bottom: 1px solid #f2f2f2;
}
.heat-image img{
	width: 35px;
	height: 35px;
	border-radius: 5px;
	display: block;
	margin-right: 10px;
	object-fit: cover;
}
</style>