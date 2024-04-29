<template>
  <router-view />
</template>

<script setup>
</script>

<style>
a {
  text-decoration: none;
}

body {
  margin: 0;
  padding: 0;
  background: #f5f5f5;
}

p,
div,
span {
  font-size: 16px;
  padding: 0;
  margin: 0;
}

.global-display {
  display: flex;
}

.global-f-wrap {
  flex-wrap: wrap;
}

.global-f-direction {
  flex-direction: column;
}

.global-j-content {
  justify-content: space-between;
}

.global-j-around {
  justify-content: space-around;
}

.global-j-end {
  justify-content: end;
}

.global-a-items {
  align-items: center;
}
.global-a-grid{
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-gap: 60px;
}
.text-show {
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.fadeIn {
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
/* 主界面 */
@media screen and (max-width: 1340px) {
	/* #Content-page {
		max-width: 1000px;
	} */
}
#Content-page{
  position: absolute;
  top: 50px;
  left: 300px;
  right: 80px;
}
#content-title{
  margin-bottom: 40px;
}
#content-title .el-breadcrumb__inner{
    font-size: 20px;
    font-weight: bold !important;
}
.content-main{
  background-color: #ffffff;
  border-radius: 5px;
  padding: 20px;
}
.subbuttom{
  justify-content:flex-end;
}
.pager-next{
  display: flex;
  justify-content: center;
  padding: 50px 0;
}
.el-pagination.is-background .el-pager li.is-active {
	background-color: #00be06 !important;
}
.right-upload-button{
    text-align: center;
}
.submit-button{
  width: 150px;
}
</style>
