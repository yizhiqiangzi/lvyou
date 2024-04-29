<template>
    <div id="Content-page">
        <Paging :pagData="[{name:'用户管理',router:'/user-manag'}]" />
        <div class="content-main">
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="nickname" label="昵称" width="180" />
                <el-table-column prop="time" label="头像">
                    <template #default="scope">
                        <el-image
                        style="width: 50px; height: 50px"
                        :src="scope.row.avatarUrl"
                        lazy
                        preview-teleported
                        :zoom-rate="1.2"
                        :preview-src-list="[scope.row.avatarUrl]"
                        :initial-index="scope.$index"
                        fit="cover"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="articleQuantity" label="作品数" />
                <el-table-column prop="concernQuantity" label="粉丝数" />
                <el-table-column prop="mobile" label="手机号" />
                <el-table-column prop="uid" label="uid" />
            </el-table>
            <!-- 分页 -->
            <div class="pager-next">
                <el-pagination background layout="prev, pager, next" hide-on-single-page :total="count" 
                @current-change="currentChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
    // 顶部导航组件
    import Paging from '@/page/component/Paging-component.vue'
    import { ref,onMounted } from 'vue';
    import request from '@/api/request.js'
    // 用户的游记
    const tableData = ref([])
    const count = ref(1)
    onMounted(async()=>{
        await requestApi()
    })
    async function requestApi(page=1){
        const res = await request.get('/allUserInfor',{page})
        count.value = res.data.count
        tableData.value = res.data.data
    }
    // 分页
    async function currentChange(event){
        await requestApi(event)
    }
</script>

<style scoped>

</style>