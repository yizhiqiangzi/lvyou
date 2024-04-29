<template>

	<!-- 自定义顶部导航栏 -->
	<view class="nav_bar_custom">
		<!-- 顶部占位 -->
		<view class="top_height"></view>

		<view class="nav_content">
			<image src="/static/gpt/logo-a.png" mode="widthFix" @click="back"></image>
			<view class="nav_text">
				<text>AI助手</text>
				<text>你的智能助手,帮助你获取知识</text>
			</view>
		</view>
	</view>

	<!-- 占位高度 -->
	<view :style="{height:MenuButton().seViewHeight}"></view>
	<!-- 进入页面的默认文本 -->
	<view class="Sent_information backdrop your-element">{{greetSb}}</view>

	<view class="Sent_information backdrop widthAuto your-element">
		<view class="nav_content problem_top">
			<image src="/static/gpt/wenwo.png" mode="widthFix"></image>
			<text>你可以这样问我</text>
		</view>
		<view class="Default_problem" v-for="(item,index) in problemData" :key="index" @click="selectText(item)">
			{{item}}
		</view>
	</view>

	<!-- 用户和ai的对话区域 -->
	<template v-for="item in textArr">
		<!-- 用户： -->
		<view v-show="item.type === 'user'">
			<view class="user_backdrop userTitle">
				<view>
					<image src="/static/gpt/avatar.png" mode="widthFix" ></image>
				</view>
				<view>用户</view>
			</view>
			<view class="Sent_information backdrop" style="border: 1px solid #798189;color: #3875f6;font-weight: bold" >
				<view class="ai_content">
					<text user-select>{{ item.text }}</text>
					<image src="/static/gpt/fuzhi.png" mode="widthFix"></image>
				</view>
			</view>
		</view>
		<!-- ai： -->
		<view v-show="item.type === 'AI'">
			<view class="user_backdrop" >
				<view>
					<image src="/static/gpt/logo-a.png" mode="widthFix"></image>
				</view>
				<view style="font-weight: bold">星火AI</view>
			</view>
			<view class="Sent_information backdrop" style="border: 1px solid #3875f6;font-weight: bold">
				<view class="loading" v-show="item.loading">
					<view class="loader"></view>
					<view>AI正在思考中</view>
				</view>
				<view class="ai_content">
					<view user-select>{{ item.text }}</view>
					<image src="/static/gpt/fuzhi.png" mode="widthFix"></image>
				</view>
			</view>
		</view>
	</template>
	

	<!-- 底部输入框 -->
	<view class="Input_field">
		<view>
			<image src="/static/gpt/qingkong.png" mode="aspectFit" @click="clearMessage"></image>
		</view>
		<input auto-focus ref="inputFocus" placeholder="你可以问题任何问题" maxlength="-1" cursor-spacing="40" confirm-type="send" auto-blur v-model="question"
			@confirm="sendMessage">
		<view>
			<image src="/static/gpt/fasong.png" mode="aspectFit" @click="sendMessage"></image>
		</view>
	</view>
	<view style="height: 400rpx;"></view>
</template>

<script setup>
import { ref } from 'vue';
import { MenuButton } from '@/api/MenuButton.js';  
import { requestApi } from '../../api/request';

const greetSb = ref('你好，我是你的人工智能大模型，现在的我能够学习和理解人类的语言，进行多轮对话，回答问题，高效帮助人们获取信息，知识和灵感~快和我聊聊吧！如果你不确定从哪里开始，可以试试这样问我:');
const problemData = ref([
    '给我一份关于数字经济的毕业论文大纲',
    '帮我推荐几个送给女朋友的生日礼物',
    '帮我推荐几款好用的国货口红',
    '我要在夏天去云南旅游，有什么美食推荐吗',
    '帮我推荐几款流行的家装风格'
]);

const text = ref('');
</script>

<script>
import { ref } from 'vue';

// 将 getAIResponse 函数移动到这里


export default {
    data() {
        return {
            aiResponse: '',
            question: '',
			textArr: [],
			loading: false
        }
    },
    methods: {
		back(){
			uni.navigateBack()
		},
        sendMessage() {
			console.log(this.question,'ddd')
            const question = this.question;
			if(!this.textArr.length || !this.textArr.at(-1).loading){
				this.textArr.push({
					text: question,
					type: 'user'
				})
				this.question = "" //当次回答后清空输入框
				// 现在可以访问到 getAIResponse 函数了
				this.getAIResponse(question);
			}else{
			 uni.showToast({
			     title: '当前AI正在回复中',
			     icon: 'none'
			 });
			}
        } ,
		getAIResponse(question) {
			this.loading = true
			this.textArr.push({
				text: '',
				type: 'AI',
				loading: true
			})
			console.log(question,'question');
		    try {
		        uni.request({
		            url: `http://localhost:8900/apif/openai`,
					data:{
						question
					},
		            method: 'GET',
		            success:(res) =>{
		                if (res.statusCode === 200) {
							console.log(res,'响应');
							this.textArr.at(-1).text = res.data.data
							this.textArr.at(-1).loading = false
							// scrollTo(0,document.body.scrollHeight)
		                } else {
		                    uni.showToast({
		                        title: '获取回复失败',
		                        icon: 'none'
		                    });
							this.textArr.pop()
		                }
						this.loading = false
		            },
		            fail:(error) => {
		                uni.showToast({
		                    title: '网络错误',
		                    icon: 'none'
		                });
						this.loading = false
						this.textArr.pop()
		            }
		        });
		    } catch (error) {
		        uni.showToast({
		            title: '网络错误',
		            icon: 'none'
		        });
				this.loading = false
		    }
		}
    },
	
}
</script>


<style>
	/* 页面背景色 */
	page {
		background-color: #f6f8fe;
	}

	/* 固定顶部自定义导航栏 */
	.nav_bar_custom {
		height: v-bind('MenuButton().seViewHeight');
		position: fixed;
		top: 0;
		left: 0; /* 使用 MenuButton 返回的 left 属性 */
		width: 100%; /* 使用 MenuButton 返回的 width 属性 */
		background: linear-gradient(to bottom, #b3cffa, #f6f8fe);
		z-index: 999;
	}

	/* 固定顶部自定义导航栏左边的图标*/
	.nav_bar_custom image {
		width: 50rpx;
		margin: 0 20rpx;
	}

	/* 顶部导航栏距离手机顶部的高度 */
	.top_height {
		height: v-bind('MenuButton().top');
	}

	/* 公用的flex布局 */
	.nav_content {
		display: flex;
		align-items: center;
	}

	/* 顶部导航栏里的两段文本上下排列 */
	.nav_text {
		display: flex;
		flex-direction: column;
	}

	/* 顶部导航栏里的第一段文本样式 */
	.nav_text text:nth-child(1) {
		font-size: 28rpx;
		font-weight: bold;
	}

	/* 顶部导航栏里的第二段文本样式 */
	.nav_text text:nth-child(2) {
		font-size: 25rpx;
		color: #798189;
	}

	/* 公用样式：主要用于聊天区的文字内容区域 */
	.Sent_information {
		padding: 10rpx;
		margin: 20rpx;
		line-height: 1.5;
		border-radius: 10rpx;
		/* width: fit-content; */
		font-size: 29rpx;
	}

	/* 没有消息时的两段文本提示动画 */
	@keyframes fadeInFromTop {
		0% {
			opacity: 0;
			transform: translateY(30px);
		}

		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.your-element {
		animation-name: fadeInFromTop;
		animation-duration: 0.7s;
		animation-timing-function: ease-in;
		animation-fill-mode: forwards;
	}

	.widthAuto {
		width: auto;
	}

	/* 没有消息时的第二段文本样式 */
	.problem_top image {
		width: 35rpx;
		display: block;
		margin-right: 10rpx;
	}

	.problem_top text {
		font-weight: bold;
	}

	.Default_problem {
		border: 1rpx solid #e8f0fc;
		border-radius: 40rpx;
		padding: 15rpx 0;
		text-align: center;
		margin: 20rpx 0;
		color: #3875f6;
		font-weight: bold;
	}

	/* 公用样式 */
	.backdrop {
		background-color: #fefefe;
	}

	/* 用户发送的消息样式 */
	.user_backdrop {
		color: #555d92;
		display: flex;
		margin: 20rpx;
	}
	.userTitle {
		display: flex;
		justify-content: flex-end;
	}
	/* 用户发送消息时自带头像样式 */
	.user_backdrop image {
		width: 38rpx;
		display: block;
		border-radius: 50%;
	}

	.user_backdrop view:nth-child(1) {
		height: 48rpx;
		margin-right: 10rpx;
		display: flex;
		align-items: center;
	}

	/* 用户发送消息的文本 */
	.user_backdrop view:nth-child(2) {
		line-height: 1.5;
		align-self: center;
	}

	/* ai未回复时的loading加载 */
	.loading {
		display: flex;
		align-items: center;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.loader {
		border: 5rpx solid #f3f3f3;
		border-top: 5rpx solid #3498db;
		border-radius: 50%;
		width: 40rpx;
		height: 40rpx;
		animation: spin 1s linear infinite;
		margin-right: 10rpx;
	}

	/* ai回复的内容区域样式 */
	.ai_content {
		display: flex;
		flex-direction: column;
	}

	.ai_content text {
		border-bottom: 1px solid #f3f3f4;
		padding-bottom: 10rpx;
	}

	.ai_content image {
		width: 29rpx;
		align-self: flex-end;
		margin-top: 10rpx;
	}

	/* 固定在底部的输入框样式 */
	.Input_field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		border-top: 1px solid #eee;
		padding-top: 10rpx;
		padding-bottom: 70rpx;
		background-color: #f6f8fe;
	}

	/* 固定在底部的输入框input样式 */
	.Input_field input {
		width: 100%;
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;

	}

	/* 固定在底部的输入框左右两边清空和发送样式 */
	.Input_field view {
		height: 80rpx;
		width: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 10rpx;
	}

	.Input_field image {
		height: 50rpx;
		width: 50rpx;
		display: block;
	}
</style>