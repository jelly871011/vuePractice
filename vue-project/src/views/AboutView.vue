<script lang="ts" setup>
import { ref } from 'vue';
const tableData = ref([
	{ id: 1, time:'2024-02-05', account: 'a', name: 'aa'},
	{ id: 2, time:'2024-02-05', account: 'b', name: 'bb'},
	{ id: 3, time:'2024-02-05', account: 'c', name: 'cc'},
]);
const openValue = ref(true);
</script>
<template>
  <div>
    <h1>後台帳號管理</h1>
    
  </div>
  <div>
    <input type="search">
  </div>
  <div>
    <div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="id"></el-table-column>
      <el-table-column prop="time" label="建立時間"></el-table-column>
      <el-table-column prop="account" label="帳號"></el-table-column>
      <el-table-column prop="name" label="暱稱"></el-table-column>
      <el-table-column label="啟用/停用"><el-switch v-model="openValue" active-color="#13ce66" inactive-color="#ff4949"></el-switch></el-table-column>
      <el-table-column prop="edit" label="編輯"></el-table-column>
    </el-table>
  </div>
  </div>
</template>

<style>

</style>
