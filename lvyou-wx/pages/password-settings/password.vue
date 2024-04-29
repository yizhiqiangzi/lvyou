<template>
	<view class="password-view">
		<view class="global-display global-a-items">
			<text>手机号</text>
			<input type="text" v-model="mobile" placeholder="请填写手机号">
		</view>
		<view class="global-display global-a-items">
			<text>验证码</text>
			<input type="text" v-model="code" placeholder="请输入验证码">
			<button size="mini" :disabled="codeDisabled" @click="sendCode">{{codeName}}</button>
		</view>
	</view>
	<view class="password-view">
		<view class="global-display global-a-items">
			<text>新密码</text>
			<input type="safe-password" password v-model="password" placeholder="6-20位大小写字母+数字组成">
		</view>
		<view class="global-display global-a-items">
			<text>确认密码</text>
			<input type="safe-password" password v-model="newPassword" placeholder="再次输入新密码">
		</view>
	</view>
	<!-- 提示 -->
	<view class="password-tips">{{errNewpassword}}</view>
	<button @click="subMit" :loading="loading" :disabled="subDisabled" class="sum-mit">提交</button>
</template>

<script setup>
	import { ref,watchEffect } from 'vue';
	import {requestApi} from '@/api/request.js'
	const mobile = ref('')//手机号
	const code = ref('')//验证码
	const password = ref('')//密码
	const newPassword = ref('')//确认密码
	/* -------发送验证码-------- */
	const codeDisabled = ref(false);
	const countdownTime = ref(60);//倒计时时间
	const codeName = ref('发送验证码')
	const bizId = ref('')//验证码id
	// 发送验证码
	async function sendCode(){
		// 调用发送验证码接口
		const res = await requestApi('/vercode',{phoneNumbers:mobile.value})
		bizId.value = res.data.bizId
		// 倒计时开始
		codeDisabled.value = true
		var timer = setInterval(()=>{
			if(countdownTime.value > 1){
				countdownTime.value--
				codeName.value = `${countdownTime.value}秒后重新获取`
			}else{
				clearInterval(timer);
				codeDisabled.value = false
				countdownTime.value = 60
				codeName.value = '发送验证码'
			}
		},1000)
	}
	// 校验表
	const errNewpassword = ref('')
	const subDisabled = ref(false)
	watchEffect(()=>{
		// 验证密码是否一致
		if (password.value === newPassword.value) {
		    errNewpassword.value = ''
			subDisabled.value = false
		} else {
			errNewpassword.value = '两次输入的密码不一致'
			subDisabled.value = true
		}
	})
	// loading
	const loading = ref(false)
	// 提交更新
	async function subMit(){
		try{
			loading.value = true
			await requestApi('/upload-password',{
				mobile:mobile.value,
				code:code.value,
				bizId:bizId.value,
				password:password.value
			},'POST')
			loading.value = false
			uni.navigateBack({delta: 1})
		}catch(e){
			loading.value = false
		}
	}
</script>

<style>
page{
	background-color: #f6f7f9;
}
.password-view{
	margin: 10rpx 20rpx 60rpx 20rpx;
	background-color: #ffffff;
	padding: 0 20rpx;
}
.password-view view{
	padding: 20rpx 0;
}
.password-view text{
	width: 150rpx;
	font-size: 32rpx;
}
.password-view input{
	flex: 1;
	padding: 0 10rpx;
}
.password-view button{
	background-color: #f9dc53;
	border: none;
}
.sum-mit{
	background-color: #f9dc53;
	width: 400rpx;
	margin-top: 40rpx;
	border: none;
}
.password-tips{
	padding-left: 20rpx;
	font-size: 30rpx;
	color: red;
}
</style>