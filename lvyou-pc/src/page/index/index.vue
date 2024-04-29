<template>
    <div id="nav-left">
        <div class="merchant-style global-display global-a-items">
            <img :src="merchantName.avatUrl" alt="">
            <p>{{ merchantName.name }}</p>
        </div>
        <el-menu active-text-color="#fa9d3b" :default-active="menuId" @select="selectActive">
            <div v-for="(item,index) in menuNavData" :key="index">
            <router-link :to="{path:item.router}">
                <el-menu-item :index="item.id">
                    <el-icon :size="20"><component :is="item.icon"></component></el-icon>
                    <span>{{item.title}}</span>
                </el-menu-item>
            </router-link>
            </div>
        </el-menu>
        <div class="exit-login">
            <el-button type="info" @click="exitLogin">退出登录</el-button>
        </div>
    </div>
    <router-view></router-view>
</template>

<script setup>
    import { reactive, ref, shallowRef,onMounted } from 'vue'
    import {Star,Position,Pointer,Files,User,DataAnalysis,Setting} from '@element-plus/icons-vue'
    import Logo from '@/assets/logo.jpg'
    import { useRouter } from 'vue-router'
    import emitter from '@/api/event.js'
    const $router = useRouter()  // 这是路由跳转的
    const arrAy = [
        {
            id:'1',
            icon:Star,
            title:'每日推荐',
            router:'index',
            Subclass:[]//是否有二级三级等等菜单
        },
        {
            id:'2',
            icon:Pointer,
            title:'推荐游记',
            router:'reco-travel',
            Subclass:[]
        },
        {
            id:'3',
            icon:Files,
            title:'游记管理',
            router:'travel-manag',
            Subclass:[]
        },
        {
            id:'4',
            icon:User,
            title:'用户管理',
            router:'user-manag',
            Subclass:[]
        },
        {
            id:'5',
            icon:DataAnalysis,
            title:'数据分析',
            router:'analysis',
            Subclass:[]
        },
        {
            id:'6',
            icon:Setting,
            title:'后台设置',
            router:'back-setting',
            Subclass:[]
        }
    ]
    const menuNavData = shallowRef(arrAy)
    const merchantName = reactive({name:'马蜂窝',avatUrl:Logo})
    // 菜单激活回调
    function selectActive(index){
        localStorage.setItem('menuid',JSON.stringify(index))
    }
    const menuId = ref('1')
    onMounted(()=>{
        menuId.value = JSON.parse(localStorage.getItem('menuid'))
        adminInfor()
    })
    function adminInfor(){
        const {avatarUrl,nickname} = JSON.parse(localStorage.getItem('adminInfor'))
        merchantName.name = nickname
        merchantName.avatUrl = avatarUrl
    }
    // 退出登录
    function exitLogin(){
        localStorage.removeItem('adminInfor')
        $router.push('/')
    }
    // 修改管理员信息触发
    emitter.on('upload-Admin-Success', () => {
	    adminInfor()
	});
</script>

<style>
#nav-left{
    left: 0;
    top: 0;
    position: fixed;
    height: 100vh;
    background-color: #fff;
    width: 220px;
    z-index: 999;
}
#nav-left span{
    font-size: 18px;
    padding-left: 10px;
}
.merchant-style{
    justify-content: center;
    padding: 50px 0;
	flex-direction: column;
}
.merchant-style img{
    width: 80px;
	height: 80px;
	border-radius: 50%;
	object-fit: cover;
	margin-bottom: 10px;
}
.merchant-style p{
    font-size: 18px;
    font-weight: bold;
}
/* 退出登录 */
.exit-login{
    position: fixed;
    bottom: 0;
    left: 0;
    width: 220px;
    text-align: center;
    height: 100px;
    line-height: 100px;
    z-index: 999;
    border-top: 1px solid #f2f2f2;
	background: #ffffff;
}
</style>