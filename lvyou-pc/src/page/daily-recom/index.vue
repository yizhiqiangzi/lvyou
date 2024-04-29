<template>
    <div id="Content-page">
        <Paging :pagData="[{name:'每日推荐',router:'/index'}]" />
        <div class="content-main">
            <div class="global-display subbuttom"><el-button type="success" class="subbuttom" @click="juMp">上传推荐</el-button></div>
            <div class="uoload-recom global-display global-a-items" v-for="(item,index) in dailyRecomData" :key="index
            ">
                <div>
                    <img :src="item.imageUrl">
                </div>
                <div>
                    <p class="text-show">{{ item.title }}</p>
                    <p>地址：{{ item.address }}</p>
                    <p>颜色值：{{ item.color }}</p>
                    <p>添加时间：{{ item.time }}</p>
                </div>
                <div>
                    <!-- <el-button type="primary" size="default" :disabled="item.setting" @click="setasRecom(item._id,index)">{{ item.setting ? '已推荐' :'设为推荐' }}</el-button> -->
                    <el-button type="danger" size="default" @click="deleteRecom(item._id,index)">删除</el-button>
                </div>
            </div>
            <!-- 分页 -->
            <div class="pager-next">
                <el-pagination background layout="prev, pager, next" hide-on-single-page :total="count" 
                @current-change="currentChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
    // 顶部导航组件
    import Paging from '@/page/component/Paging-component.vue'
    import { ref,onMounted } from 'vue';
    import request from '@/api/request.js'
    import { useRouter } from 'vue-router'
    import { ElMessage, ElMessageBox } from 'element-plus'
    const $router = useRouter()  // 这是路由跳转的
    // 跳转
    function juMp(){
        $router.push('/daily-recom-upload')
    }
    // 获取数据
    const dailyRecomData = ref([])
    const count = ref(1)
    onMounted(async()=>{
        await requestApi()
    })
    async function requestApi(page=1){
        const res = await request.get('/gainDailyRecom',{page})
        dailyRecomData.value = res.data.data
        count.value = res.data.count
    }
    // 分页
    async function currentChange(event){
        await requestApi(event)
    }
    // 设为推荐：已废弃
    async function setasRecom(_id,index){
        await request.get('/setasRecomMended',{_id})
        dailyRecomData.value.forEach(item=>item.setting = false)
        dailyRecomData.value[index].setting = true
    }
    // 删除
    async function deleteRecom(_id,index){
        try {
            await ElMessageBox.confirm('确定删除吗','提示',
                {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true,
                }
            )
            await request.get('/deleteDailyRecom',{_id})
            dailyRecomData.value.splice(index,1)
        } catch (error) {
            console.log(error);
        }
    }
</script>

<style scoped>
@import '../../style/index.css';
</style>