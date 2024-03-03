<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { ElForm, ElNotification } from 'element-plus';

// interface
interface Row {
  _id: string;
  username: string;
  name: string;
  enable: boolean;
}

// data
const searchMessage = ref('');
const isEditDialog = ref(false);
const isDeleteDialog = ref(false);
const tableData = ref<{ username: string, name: string }[]>([]);
const form = ref({ _id: '', name: '', username: '', enable: true });
const formRef = ref<typeof ElForm | null>(null);
const loading = ref(false);
const checked = ref(false);
// pagination
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// rules
const rules = {
  username: [
    { required: true, message: '帳號不可為空', trigger: 'blur' },
    { min: 3, max: 20, message: '長度在 3 到 20 個字元', trigger: 'blur' },
  ],
  name: [{ required: true, message: '暱稱不可為空', trigger: 'blur' }],
};

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
 * 日期格式轉換
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/**
 * API 呼叫和錯誤處理
 */
async function callApi(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: object) {
  if (method === 'get') {
    return axios.get(url, { params: data });
  }

  const response = await axios({ method, url, data });

  if (response.data.result === 'ok') {
    showMessage('更新成功', 'success');
  } else {
    showMessage('更新失敗', 'error');
  }

  return response;
}

/**
 * 取得後台帳號列表
 */
const getTableData = async () => {
  loading.value = true;

  const firstResult = (currentPage.value - 1) * pageSize.value;
  const maxResult = pageSize.value;

  const response = await callApi('get', '/api/v1/users/list', {
    first_result: firstResult,
    max_result: maxResult,
  });

  if (response.data.result === 'ok') {
    const rawData = response.data.ret.sort((
      a: { created_at: string },
      b: { created_at: string },
    ) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    tableData.value = rawData.map((item: { created_at: string; }, index: number) => ({
      ...item,
      created_at: new Date(item.created_at),
      formattedDate: formatDate(item.created_at),
      index: firstResult + index + 1,
    }));

    totalItems.value = response.data.pagination.total;
    loading.value = false;
  }
};

/**
 * 分頁
 *
 * @param val - 每頁顯示筆數
 */
const handleSizeChange = (val: number) => {
  pageSize.value = val;

  getTableData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;

  getTableData();
};

/**
 * 模糊搜尋篩選資料
 */
const filteredData = computed(() => (!searchMessage.value
  ? tableData.value
  : tableData.value
    .filter((item) => item.username.includes(searchMessage.value)
    || item.name.includes(searchMessage.value))));

/**
 * 設定表單值
 */
function setFormValue(row: Row) {
  const { username, _id, name, enable } = row;

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
function openEditDialog(row: Row) {
  isEditDialog.value = true;
  setFormValue(row);
}

const updateData = async () => {
  const { _id: id } = form.value;

  const method = id ? 'put' : 'post';
  const url = id ? `/api/v1/users/${id}` : '/api/v1/users';

  await callApi(method, url, form.value);
  isEditDialog.value = false;
  getTableData();
};

const submitForm = async () => {
  if (formRef.value) {
    formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        await updateData();
        isEditDialog.value = false;
      }
    });
  }
};

/**
 * 刪除會員
 */
function openDeleteDialog(row: Row) {
  isDeleteDialog.value = true;
  setFormValue(row);
}

const deleteData = async () => {
  const { _id: id } = form.value;

  await callApi('delete', `/api/v1/users/${id}`, form.value);

  getTableData();
  isDeleteDialog.value = false;
};

/**
 * 啟用/停用
 */
function handleSwitchChange(row: Row) {
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
    <el-row style="display: flex; align-items: center;">
      <el-icon size="20px" class="green">
        <Search />
      </el-icon>
      <el-input v-model="searchMessage" placeholder="搜尋帳號或暱稱" style="padding-left: 1em; padding-right: 1em;" />
      <el-button type="primary" @click="openEditDialog">新增會員</el-button>
      <el-button type="primary">批次刪除</el-button>
    </el-row>
    <el-table v-loading="loading" class="el-table" :data="filteredData" style="width: 100%">
      <el-table-column style="width: 1em;" prop="checked" label="選取">
        <el-checkbox v-model="checked" label="" size="large" />
      </el-table-column>
      <el-table-column prop="index" label="排序" />
      <el-table-column prop="formattedDate" label="建立時間" />
      <el-table-column prop="username" label="帳號" />
      <el-table-column prop="name" label="暱稱" />
      <el-table-column prop="enable" label="啟用/停用">
        <template v-slot="{ row }">
          <el-switch
            v-model="row.enable"
            active-color="hsla(160, 100%, 37%, 1)"
            inactive-color="rgba(60, 60, 60, 0.12)"
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
      v-model="isEditDialog"
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
      <el-button @click="isEditDialog = false">取消</el-button>
      <el-button type="primary" @click="submitForm">確認</el-button>
    </el-dialog>
    <el-dialog
      title="確認刪除此會員?"
      :data="form"
      v-model="isDeleteDialog"
      width="20%"
    >
      <span style="display: block;">帳號: {{ form.username }}</span>
      <span style="display: block;">暱稱: {{ form.name }}</span>
      <el-button @click="isDeleteDialog = false">取消</el-button>
      <el-button type="primary" @click="deleteData">確認</el-button>
    </el-dialog>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-size="pageSize"
      layout="sizes, prev, pager, next"
      :page-sizes="[10, 20, 30]"
      :total="totalItems" />
  </div>
</template>

<style scoped>
  .el-input {
    width: 10rem;
    height: 2rem;
    border-radius: 0.2rem;
  }
  .el-pagination {
    margin-top: 1rem;
  }
  .el-row {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }
</style>
