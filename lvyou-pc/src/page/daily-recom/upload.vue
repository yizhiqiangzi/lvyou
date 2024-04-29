<template>
    <div id="Content-page">
        <Paging :pagData="[{name:'每日推荐',router:'/index'},{name:'上传推荐',router:'/daily-recom-upload'}]" />
        <div class="content-main">
            <div class="global-display global-j-content">
                <div>
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
                            <span>建议上传大小不超过500kb，宽为900px，高为1280px</span>
                        </div>
                        <div v-else>
                            <img :src="uploadImgurl" alt="">
                        </div>
                    </div>
                    </el-upload>
                </div>
                <div class="right-upload">
                    <div class="right-upload-input global-display global-a-items">
                        <p>标题</p>
                        <el-input placeholder="输入标题" v-model="recomTitle"/>
                    </div>
                    <div class="right-upload-input global-display global-a-items">
                        <p>地址</p>
                        <el-select
                            v-model="recoAddress"
                            filterable
                            remote
                            reserve-keyword
                            placeholder="搜索景点地址"
                            :remote-method="remoteMethod"
                            :loading="loading">
                            <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            />
                        </el-select>
                    </div>
                    <div class="right-upload-input global-display global-a-items">
                        <p>颜色值</p>
                        <div><el-color-picker v-model="color" show-alpha @change="changeColor"/></div>
                    </div>
                    <div class="right-upload-button">
                        <el-button type="success" class="submit-button" :loading="loadIng" @click="subMit">提交</el-button>
                    </div>
                </div>
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
    import { useRouter } from 'vue-router'
    const $router = useRouter()  // 这是路由跳转的

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
    // 标题
    const recomTitle = ref('')
    // 地址
    const recoAddress = ref('')
    const loading = ref(false)
    const options = ref([])
    // 远程搜索城市
    async function remoteMethod(keywords){
        if(keywords == '')return false
        const res = await request.get('/china-data',{keywords})
        if(res.data.length > 0){
            options.value = res.data[0].citys.map(item=>{
                return { value: item.cityName, label: item.cityName }
            })
        }else{
            options.value = []
        }
    }
    // 颜色
    const color = ref('')
    function changeColor(event){
        color.value = event
    }
    // 提交
    async function subMit(){
        try {
            loadIng.value = true
            await request.post('/dailyRecom',{
                imageUrl:uploadImgurl.value,
                title:recomTitle.value,
                address:recoAddress.value,
                color:color.value
            })
            $router.push('/daily-recom')
            loadIng.value = false
        } catch (error) {
            loadIng.value = false
        }
    }
</script>

<style scoped>
.content-main{
    padding:  60px 200px !important;
}
.left-upload{
    border: 1px dashed rgba(0,0,0,.3);
    color: rgba(0,0,0,.3);
    width: 200px;
    height: 300px;
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
    height: 305px;
    object-fit: cover;
}
.left-upload span{
    padding: 10px 20px;
}
.right-upload{
    flex: 1;
}
.right-upload p{
    width: 200px;
    text-align: center;
}
.right-upload-input{
    padding-bottom: 30px;
}
.right-upload-input div{
    width: 100%;
}

</style>