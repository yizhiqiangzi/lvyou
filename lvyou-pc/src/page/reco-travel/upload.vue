<template>
    <div id="Content-page">
        <Paging :pagData="[{name:'推荐游记',router:'/reco-travel'},{name:'选择游记',router:'/reco-travel-upload'}]" />
        <div class="content-main">
            <div class="global-display global-j-content">
                <el-upload
                ref="uploadEle"
                :action="imageUrl"
                accept=".jpg,.png,.jpeg,.webp"
                :limit="1"
                :show-file-list="false"
                :on-success="onSuccess"
                :on-error="onError"
                >
                <div class="left-upload left-upload-icon">
                    <div class="left-upload-icon" v-if="uploadImgurl == ''">
                        <el-icon :size="20"><Plus /></el-icon>
                        <span>建议上传大小不超过500kb，宽为280px，高为200px</span>
                    </div>
                    <div v-else>
                        <img :src="uploadImgurl" alt="">
                    </div>
                </div>
                </el-upload>
                <div class="right-upload-button">
                    <el-button type="success" class="submit-button" :loading="loadIng" @click="subMit">
                        {{ recoTravelId == '' ? '提交' : '确认修改' }}
                    </el-button>
                </div>
            </div>
            <!-- 已选择游记 -->
           <div v-if="tableSelect.length > 0">
            <p class="select-Title">已选择游记</p>
            <el-table :data="tableSelect" style="width: 100%">
                <el-table-column prop="author_data[0].nickname" label="作者" width="180" />
                <el-table-column prop="time" label="发布时间" />
                <el-table-column prop="address" label="位置" />
                <el-table-column prop="title" label="标题" />
            </el-table>
           </div>
            <!-- 选择游记 -->
            <p class="select-Title">请选择一个游记关联</p>
            <el-table :data="userTarvelData" highlight-current-row style="width: 100%" @current-change="handleCurrentChange">
                <el-table-column prop="author_data[0].nickname" label="作者" width="180" />
                <el-table-column prop="time" label="发布时间" />
                <el-table-column prop="address" label="位置" />
                <el-table-column prop="title" label="标题" />
            </el-table>
            <!-- 分页 -->
            <div class="pager-next">
                <el-pagination background layout="prev, pager, next" 
				hide-on-single-page
				:total="count" 
                @current-change="currentChange"/> 
            </div>
        </div>
    </div>
</template>

<script setup>
    // 顶部导航组件
    import Paging from '@/page/component/Paging-component.vue'
    import {Plus} from '@element-plus/icons-vue'
    import { ref,onMounted } from 'vue';
    import {imageUrl} from '@/api/request.js'
    import { ElMessage } from 'element-plus'
    import request from '@/api/request.js'
    import { useRouter,useRoute } from 'vue-router'
    const $router = useRouter()  // 这是路由跳转的
    const $routeQuery = useRoute()  // 用于接收路由参数的
    //#region 
    // 存储上传的图片地址
    const loadIng = ref(false)
    // 未上传和已上传的图片展示
    const uploadImgurl = ref('')
    const uploadEle = ref(null)
    // 上传成功
    function onSuccess(response){
        uploadImgurl.value = response.data[0]
        uploadEle.value.clearFiles()
    }
    // 上传失败
    function onError(event){
        console.log(event);
        ElMessage('上传图片失败')
    }
    //#endregion
    // 已选择的游记
    const tableSelect = ref([])
    const travelId = ref('')//游记_id
    const recoTravelId = ref('')//该条数据_id
    onMounted(async()=>{
        if(JSON.stringify($routeQuery.query) != "{}"){
            const {imageUrl,_id} = $routeQuery.query
            uploadImgurl.value = imageUrl
            recoTravelId.value = _id
        }
        await requestApi()
    })
    const count = ref(1)
    const userTarvelData = ref([])
    async function requestApi(page=1){
        const res = await request.get('/allUserTravel',{page})
        console.log(res);
        userTarvelData.value = res.data.data
        count.value = res.data.count
    }
     // 分页
     async function currentChange(event){
        await requestApi(event)
    }
    // 选择游记
    function handleCurrentChange(event){
        tableSelect.value = event ? [event] : tableSelect.value
        travelId.value = event ? event._id : travelId.value
    }
    // 提交
    async function subMit(){
    try {
        loadIng.value = true
        if(recoTravelId.value == ''){
            await request.post('/uploadFourTravel',{
                imageUrl:uploadImgurl.value,
                travel_id:travelId.value,
            })
        }else{
            await request.post('/modifyRecomTravel',{
                _id:recoTravelId.value,
                imageUrl:uploadImgurl.value,
                travel_id:travelId.value,
            })
        }
        $router.push('/reco-travel')
        loadIng.value = false
    } catch (error) {
        loadIng.value = false
    }
}
</script>

<style scoped>
.left-upload{
    border: 1px dashed rgba(0,0,0,.3);
    color: rgba(0,0,0,.3);
    width: 200px;
    height: 200px;
    border-radius: 4px;
    overflow: hidden;
}
.left-upload-icon{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.left-upload img{
    width: 200px;
    height: 205px;
    object-fit: cover;
}
.left-upload span{
    padding: 10px 20px;
}
.select-Title{
    font-size: 18px;
    font-weight: bold;
    padding: 20px 0;
}
</style>