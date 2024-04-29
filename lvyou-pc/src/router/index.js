import {createRouter,createWebHashHistory} from "vue-router"

const routes = [
	{//登录界面
		path:'/',
		name:'login',
		component:()=>import('@/page/login/login.vue')
	},
	{
		path:'/index',
		name:'index',
		component:()=>import('@/page/index/index.vue'),
		redirect:'/daily-recom',
		// 二级路由
		children:[
			{//数据分析
				path:'/analysis',
				name:'analysis',
				component:()=>import('@/page/data-analysis/index.vue')
			},
			{//每日推荐
				path:'/daily-recom',
				name:'daily-recom',
				component:()=>import('@/page/daily-recom/index.vue')
			},
			{//上传每日推荐
				path:'/daily-recom-upload',
				name:'daily-recom-upload',
				component:()=>import('@/page/daily-recom/upload.vue')
			},
			{//导航设置
				path:'/nav-settings',
				name:'nav-settings',
				component:()=>import('@/page/nav-settings/index.vue')
			},
			{//推荐游记
				path:'/reco-travel',
				name:'reco-travel',
				component:()=>import('@/page/reco-travel/index.vue')
			},
			{//选择游记
				path:'/reco-travel-upload',
				name:'reco-travel-upload',
				component:()=>import('@/page/reco-travel/upload.vue')
			},
			{//游记管理
				path:'/travel-manag',
				name:'travel-manag',
				component:()=>import('@/page/travel-manag/index.vue')
			},
			{//用户管理
				path:'/user-manag',
				name:'user-manag',
				component:()=>import('@/page/user-manag/index.vue')
			},
			{//后台设置
				path:'/back-setting',
				name:'back-setting',
				component:()=>import('@/page/back-setting/index.vue')
			}
		]
	}
]

const router = createRouter({
  // 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes
})

export default router