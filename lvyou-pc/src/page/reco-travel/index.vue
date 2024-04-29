<template>
    <div id="Content-page">
        <Paging :pagData="[{name:'推荐游记',router:'/reco-travel'}]" />
        <div class="content-main">
            <div class="global-display subbuttom"><el-button type="success" :disabled="recoTravel.length >= 4" class="subbuttom" @click="juMp">选择游记</el-button></div>
            <div class="uoload-recom global-display global-a-items" v-for="(item,index) in recoTravel" :key="index">
                <div>
                    <img :src="item.imageUrl">
                </div>
                <div>
                    <p class="text-show">{{ item.title }}</p>
                    <p>作者：{{ item.nickname }}</p>
                    <p>发布时间：{{ item.articltTime }}</p>
                    <p>更新时间：{{ item.time }}</p>
                </div>
                <div>
                    <el-button type="primary" size="default" @click="modify(item._id,item.imageUrl)">修改</el-button>
                    <el-button type="danger" size="default" @click="deleteRecom(item._id,index)">删除</el-button>
                </div>
            </div>
            <!-- 分页 -->
            <!-- <div class="pager-next">
                <el-pagination background layout="prev, pager, next" :total="1000" />
            </div> -->
        </div>
    </div>
</template>

<script setup>
    // 顶部导航组件
    import Paging from '@/page/component/Paging-component.vue'
    import { ref,onMounted } from 'vue';
    import request from '@/api/request.js'
    import { useRouter,useRoute } from 'vue-router'
    import { ElMessage, ElMessageBox } from 'element-plus'
    const $router = useRouter()  // 这是路由跳转的

    // 跳转
    function juMp(){
        $router.push('/reco-travel-upload')
    }
    const recoTravel = ref([])
    onMounted(async()=>{
        const res = await request.get('/gainRecomTravel')
        console.log(res);
        recoTravel.value = res.data
    })
    // 修改
    function modify(_id,imageUrl){
        $router.push({path:'/reco-travel-upload',query:{_id,imageUrl}})
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
            await request.get('/deleteRecomTravel',{_id})
            recoTravel.value.splice(index,1)
        } catch (error) {
            console.log(error);
        }
    }
</script>

<style scoped>
@import '../../style/index.css';
</style>