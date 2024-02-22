<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <el-aside width="400px">
    <el-menu>
      <router-link to="/">
        <el-menu-item class="title" index="1">
          首頁
        </el-menu-item>
      </router-link>
      <router-link to="/users">
        <el-menu-item index="2">
          後台帳號管理
        </el-menu-item>
      </router-link>
    </el-menu>
  </el-aside>
</template>
<style>
</style>
