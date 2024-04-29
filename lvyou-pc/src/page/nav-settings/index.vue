<template>
    <div id="Content-page">
        <Paging :pagData="[{name:'导航设置',router:'/index'}]" />
    </div>
</template>

<script setup>
// 顶部导航组件
import Paging from '@/page/component/Paging-component.vue'
</script>

<style scoped>

</style>