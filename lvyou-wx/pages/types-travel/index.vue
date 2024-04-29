<template>
	<card :userTravels="newUserTaavels"/>
	<view style="height: 200rpx;"></view>
</template>

<script setup>
	import { ref } from "vue";
	import {onReachBottom,onLoad} from '@dcloudio/uni-app'
	import {requestApi} from '@/api/request.js'
	import card from '@/pages/Common-components/card-flow.vue'
	const newUserTaavels = ref([])
	const travelQuery = ref({query:'',type:'',address:''})
	onLoad(async(event)=>{
		console.log(event);
		travelQuery.query = event.query
		travelQuery.type = event.type
		travelQuery.address = event.address
		wx.setNavigationBarTitle({title: event.query})
		await queryTravel()
	})
	async function queryTravel(page = 1){
		if(travelQuery.type == '001'){
			const res = await requestApi('/clAssifyTravels',{keywords:travelQuery.query,page})
			console.log(res);
			newUserTaavels.value = [...newUserTaavels.value,...res.data]
		}else{
			const res = await requestApi('/addressQueryTravels',
			{address:travelQuery.address,
			keywords:travelQuery.query,page})
			console.log(res);
			newUserTaavels.value = [...newUserTaavels.value,...res.data]
		}
	}
	// 上拉加载
	const page = ref(1)
	onReachBottom(async()=>{
		page.value++
		await queryTravel(page.value)
	})
</script>

<style>
</style>