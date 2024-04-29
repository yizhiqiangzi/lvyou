<template>
    <div id="login-view">
        <div class="login-region">
            <div class="login-input login-title">在线旅游后台管理</div>
            <div class="login-input">
                <el-input placeholder="你的手机号" v-model="mobile" clearable/>
            </div>
            <div class="login-input">
                <el-input placeholder="你的密码" v-model="password" clearable show-password/>
            </div>
            <el-button type="success" :loading="loadIng" class="login-input" @click="goLogin">登录</el-button>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import request from '@/api/request.js'
    import { useRouter } from 'vue-router'
    const $router = useRouter()  // 这是路由跳转的
    const mobile = ref('')
    const password = ref('')
    const loadIng = ref(false)
    async function goLogin(){
        try {
            loadIng.value = true
            const res = await request.post('/adminLogin',{mobile:mobile.value,password:password.value})
            localStorage.setItem('menuid', JSON.stringify('1'))
            localStorage.setItem('adminInfor', JSON.stringify(res.data))
            loadIng.value = false
            $router.push('/index')
        } catch (error) {
            loadIng.value = false
        }
    }
</script>

<style>
#login-view{
    background-image: url('https://diancan-1252107261.cos.accelerate.myqcloud.com/lvyou/icon/login-pc-bei.jpg');
	background-position: center center;
	background-repeat: no-repeat;
	background-size: cover;
    min-height: 100vh;
}
.login-region{
    position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
    background-color: #ffffff;
    padding: 30px 100px;
    border-radius: 10px;
}
.login-input{
    margin: 20px 0;
    width: 350px;
}
.login-title{
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    background-color:inherit !important;
    color: #67c23a;
}
.login-region div{
    background-color: #f6f7f9;
}
</style>