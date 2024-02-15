<!-- eslint-disable no-tabs -->
<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';

// data
const message = ref('');
const dataList = ref('');
const dialogVisible = ref(false);
const tableData = ref([]);
const form = ref({ name: '', username: '' });
const options = ref([
	{
		id: 1, pageNumber: 20, text: '/page',
	},
]);

/**
 * 取得後台帳號列表
 */
const getTableData = async () => {
	const response = await axios.get('/api/v1/users/list');
	tableData.value = response.data.ret;
};

/**
 * 新增/編輯會員
 */
const onSubmit = async () => {
	await nextTick();
	console.log(form.value.name);
	// post要傳入form接到的username,name
	const response = await axios.post('/api/v1/users', { username: 'ddd', name: 'ddd' });
	dialogVisible.value = false;
	console.log(response.data);
};
const onEdit = async () => {
	console.log(form.value);
	// put要傳入form接到的id
	const response = await axios.put('/api/v1/users/65cdb30c94d7555f63d0d27c');
	console.log(response.data);
};
function openCreateDialog() {
	dialogVisible.value = !dialogVisible.value;
}
function openEditDialog(row: { username: string; name: string; editing: boolean; }) {
	form.value.username = row.username;
	form.value.name = row.name;
	row.editing = true;
}
/**
 * 刪除會員
 */
const onDelete = async () => {
	console.log(form.value);
	// delete要傳入form接到的id
	const response = await axios.delete('/api/v1/users/65cdb6cb94d7555f63d0d282');
	console.log(response.data);
};
function closeEditDialog(row: { editing: boolean; }) {
	if (row.editing) {
		row.editing = false;
	}
}
onMounted(() => {
	getTableData();
});
</script>

<template>
  <div>
    <h1>後台帳號管理</h1>
    <input v-model="message" placeholder="尋找" />
    <el-button type="primary" plain @click="openCreateDialog">新增</el-button>
    <el-dialog
      title="新增會員"
      v-model="dialogVisible"
      width="30%"
    >
      <el-form :model="form" ref="form" label-width="80px">
        <el-form-item label="帳號" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="暱稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit">新增</el-button>
    </el-dialog>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column label="排序" />
      <el-table-column prop="created_at" label="建立時間" />
      <el-table-column prop="username" label="帳號" />
      <el-table-column prop="name" label="暱稱" />
      <el-table-column prop="enable" label="啟用/停用" align="center">
        <template v-slot="{ row }">
          <el-switch v-model="row.enable" active-color="#13ce66" inactive-color="#ff4949" />
        </template>
      </el-table-column>
      <el-table-column label="編輯">
        <template v-slot="{ row }">
          <el-button v-model="row.enable" type="primary" @click="openEditDialog(row)">編輯</el-button>
          <el-button type="primary" @click="onDelete(row)">刪除</el-button>
          <el-dialog
            title="編輯會員"
            v-model="row.editing"
            width="30%"
          >
            <el-form :model="form" ref="form" label-width="80px">
              <el-form-item label="帳號" prop="username">
                <el-input v-model="form.username" />
              </el-form-item>
              <el-form-item label="暱稱" prop="name">
                <el-input v-model="form.name" />
              </el-form-item>
            </el-form>
            <el-button @click="closeEditDialog(row)">取消</el-button>
            <el-button type="primary" @click="onEdit(row)">修改</el-button>
          </el-dialog>
        </template>
      </el-table-column>
    </el-table>
    <el-select v-model="dataList" placeholder="顯示資料">
      <el-option
        v-for="item in options"
        :key="item.id"
        :value="item.pageNumber + item.text"
      />
    </el-select>
  </div>
</template>

<style scoped>
  .el-select {
    width: 10rem;
    margin-top: 1rem;
  }
  input {
    margin-bottom: 1rem;
    margin-right: 1rem;
    width: 10rem;
    height: 2rem;
    border-radius: 0.2rem;
  }
</style>

function nextTick() {
  throw new Error('Function not implemented.');
}
