<template>
    <div id="Content-page">
        <Paging :pagData="[{name:'后台设置',router:'/back-setting'}]" />
        <div class="content-main">
            <div class="global-display global-a-items global-j-content">
            <div class="admin-user-Infor">
                <img :src="adminData.avatarUrl" alt="">
                <div class="right-upload-input">
                    <p>{{ adminData.nickname }}</p>
                </div>
                <div class="right-upload-button">
                    <el-button class="submit-button" type="success" @click="modify = !modify">
                        {{ modify ? '取消修改' : '修改' }}
                    </el-button>
                </div>
            </div>
            <div v-if="modify">
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
                            <span>上传新的头像，建议上传大小不超过500kb</span>
                        </div>
                        <div v-else>
                            <img :src="uploadImgurl" alt="">
                        </div>
                    </div>
                    </el-upload>
                </div>
                <div class="right-upload-input global-display global-a-items">
                    <el-input placeholder="输入新的昵称" v-model="nickname"/>
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
    import { ref,onMounted, reactive } from 'vue';
    import {imageUrl} from '@/api/request.js'
    import { ElMessage } from 'element-plus'
    import request from '@/api/request.js'
    import emitter from '@/api/event.js'
    // 获取本地缓存的管理员数据
    const adminData = reactive({
        avatarUrl:'',
        nickname:'',
        _id:''
    })
    onMounted(()=>{
        const {avatarUrl,nickname,_id} = JSON.parse(localStorage.getItem('adminInfor'))
        adminData._id = _id
        adminData.avatarUrl = avatarUrl
        adminData.nickname = nickname
    })

    // 显示||隐藏右边修改
    const modify = ref(false)
    // 提交按钮loading
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
    // 昵称
    const nickname = ref('')
    // 提交
    async function subMit(){
        try {
            loadIng.value = true
            await request.post('/modifyUserInfor',{
                _id:adminData._id,
                avatarUrl:uploadImgurl.value,
                nickname:nickname.value
            })
            const getadminInfor = JSON.parse(localStorage.getItem('adminInfor'))
            getadminInfor.avatarUrl = uploadImgurl.value
            getadminInfor.nickname = nickname.value
            localStorage.setItem("adminInfor", JSON.stringify(getadminInfor));
            adminData.avatarUrl = uploadImgurl.value
            adminData.nickname = nickname.value
            uploadImgurl.value = ''
            nickname.value = ''
            modify.value = false
            emitter.emit('upload-Admin-Success');
            loadIng.value = false
        } catch (error) {
            loadIng.value = false
        }
    }
</script>

<style scoped>
.admin-user-Infor img{
    width: 200px;
    height: 200px;
    border-radius: 4px;
    overflow: hidden;
    object-fit: cover;
}
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
    height: 203px;
    object-fit: cover;
}

.right-upload-input{
    width: 200px;
    padding: 15px 0;
}
.right-upload-input p{
    height: 40px;
    line-height: 40px;
    text-align: center;
}
</style>