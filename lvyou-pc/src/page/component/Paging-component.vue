<template>
    <el-breadcrumb separator="/" id="content-title">
        <el-breadcrumb-item v-for="(item,index) in pagData" :key="index"
        :to="{ path: item.router }"
        >
            {{ item.name }}
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script setup>
import { ref } from 'vue';
defineProps({pagData:Array})
</script>

<style scoped>

</style>