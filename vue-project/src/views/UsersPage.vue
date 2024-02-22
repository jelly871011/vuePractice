<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { ElForm, ElNotification } from 'element-plus';

// data
const searchMessage = ref('');
const editDialog = ref(false);
const deleteDialog = ref(false);
const tableData = ref([]);
const form = ref({
	_id: '', name: '', username: '', enable: true,
});
const formRef = ref<typeof ElForm | null>(null);

// pagination
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// rules
const rules = ref({
	username: [
		{ required: true, message: '帳號不可為空', trigger: 'blur' },
		{
			min: 3, max: 20, message: '長度在 3 到 20 個字元', trigger: 'blur',
		},
		// {
		// 	pattern: /^[a-z0-9]+$/i, message: '帳號只能包含字母和數字', trigger: 'change',
		// },
	],
	name: [
		{ required: true, message: '暱稱不可為空', trigger: 'blur' },
	],
});

/**
 * 顯示訊息
 */
function showMessage(message: string, type: 'success' | 'error') {
	ElNotification({
		message,
		type,
	});
}

/**
 * 取得後台帳號列表
 */
const getTableData = async () => {
	try {
		const response = await axios.get('/api/v1/users/list');

		const rawData = response.data.ret.sort((
			a: { created_at: string },
			b: { created_at: string },
		) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

		const startIndex = (currentPage.value - 1) * pageSize.value;
		const endIndex = currentPage.value * pageSize.value;

		tableData.value = rawData.map((item: { created_at: string; }, index: number) => {
			const date = new Date(item.created_at);
			const formattedDate = date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

			return {
				...item,
				created_at: date,
				formattedDate,
				index: index + 1,
			};
		}).slice(startIndex, endIndex);

		totalItems.value = rawData.length;
	} catch (error) {
		showMessage('讀取失敗', 'error');
		console.error(error);
	}
};

/**
 * 分頁
 */
const handleSizeChange = async (val: number) => {
	pageSize.value = val;
	await getTableData();
};
const handleCurrentChange = async (val: number) => {
	currentPage.value = val;
	await getTableData();
};

/**
 * 模糊搜尋篩選資料
 */
const filteredData = computed(() => {
	if (!searchMessage.value) {
		return tableData.value;
	}
	return tableData.value.filter((item: { username: string, name: string }) => (
		item.username.includes(searchMessage.value)
    || item.name.includes(searchMessage.value)
	));
});

/**
 * 設定表單值
 */
function setFormValue(row: { _id: string; username: string; name: string; enable: boolean; }) {
	const {
		username, _id, name, enable,
	} = row;

	form.value = {
		username,
		name,
		_id,
		enable,
	};
}

/**
 * 新增/編輯會員
 */
function openEditDialog(row: { _id: string; username: string; name: string; enable: boolean;}) {
	editDialog.value = true;
	setFormValue(row);
}

const updateData = async () => {
	let res: AxiosResponse;
	const { _id: id } = form.value;

	try {
		if (id !== undefined && id !== '') {
			res = await axios.put(`/api/v1/users/${id}`, form.value);
		} else {
			res = await axios.post('/api/v1/users', form.value);
		}

		if (res.data.result === 'ok') {
			showMessage('更新成功', 'success');
			await getTableData();
		} else {
			throw new Error('更新失敗');
		}
	} catch (error) {
		showMessage('更新失敗', 'error');
		console.error(error);
	} finally {
		editDialog.value = false;
	}
};

function closeEditDialog() {
	editDialog.value = false;
}

const submitForm = async () => {
	if (formRef.value) {
		formRef.value.validate(async (valid: boolean) => {
			if (valid) {
				await updateData();
				editDialog.value = false;
			} else {
				showMessage('更新失敗', 'error');
			}
		});
	}
};

/**
 * 刪除會員
 */
function openDeleteDialog(row: { _id: string; username: string; name: string; enable: boolean; }) {
	deleteDialog.value = true;
	setFormValue(row);
}

const deleteData = async () => {
	const { _id: id } = form.value;

	try {
		const res = await axios.delete(`/api/v1/users/${id}`, { data: form.value });
		if (res.data.result === 'ok') {
			showMessage('更新成功', 'success');
			getTableData();
		} else {
			showMessage('更新失敗', 'error');
		}
	} catch (error) {
		showMessage('更新失敗', 'error');
		console.error(error);
	}
	deleteDialog.value = false;
};

function closeDeleteDialog() {
	deleteDialog.value = false;
}

/**
 * 啟用/停用
 */
function handleSwitchChange(row: {
  _id: string;
  username: string;
  name: string;
  enable: boolean;
}) {
	form.value = row;
	updateData();
}

onMounted(() => {
	getTableData();
});
</script>

<template>
  <div>
    <h1 style="font-size: 30px;" class="green">後台帳號管理</h1>
    <el-row>
      <input v-model="searchMessage" placeholder="搜尋帳號或暱稱" />
      <el-button type="primary" @click="openEditDialog">新增會員</el-button>
    </el-row>
    <el-table class="el-table" :data="filteredData" style="width: 100%">
      <el-table-column prop="index" label="排序" />
      <el-table-column prop="formattedDate" label="建立時間" />
      <el-table-column prop="username" label="帳號" />
      <el-table-column prop="name" label="暱稱" />
      <el-table-column prop="enable" label="啟用/停用">
        <template v-slot="{ row }">
          <el-switch
            v-model="row.enable"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handleSwitchChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="編輯">
        <template v-slot="{ row }">
          <el-button v-model="row.id" type="primary" @click="openEditDialog(row)">編輯</el-button>
          <el-button v-model="row.id" type="primary" @click="openDeleteDialog(row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="form._id ? '編輯會員' : '新增會員'"
      :data="form"
      v-model="editDialog"
      width="30%"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="帳號" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="暱稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <el-button @click="closeEditDialog">取消</el-button>
      <el-button type="primary" @click="submitForm">確認</el-button>
    </el-dialog>
    <el-dialog
      title="確認刪除此會員?"
      :data="form"
      v-model="deleteDialog"
      width="20%"
    >
      <span style="display: block;">帳號: {{ form.username }}</span>
      <span style="display: block;">暱稱: {{ form.name }}</span>
      <el-button @click="closeDeleteDialog">取消</el-button>
      <el-button type="primary" @click="deleteData">確認</el-button>
    </el-dialog>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="pageSize"
      class="green"
      layout="sizes, prev, pager, next"
      :page-sizes="[10, 20, 30]"
      :total="totalItems" />
  </div>
</template>

<style scoped>
  input {
    margin-bottom: 1rem;
    margin-right: 1rem;
    width: 10rem;
    height: 2rem;
    border-radius: 0.2rem;
  }
  .el-pagination {
    margin-top: 1rem;
  }
	.title {
		display: flex;
	}
	.el-row {
  float: right;
  }
</style>
