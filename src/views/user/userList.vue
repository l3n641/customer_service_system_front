<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades">用户列表</i>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-select v-model="query.isOnline" clearable placeholder="在线状态">
          <el-option label="全部" :value="false"/>
          <el-option label="离线用户" :value="0"/>
          <el-option label="在线用户" :value="1"/>
        </el-select>
        <el-select v-model="query.role" clearable placeholder="角色">
          <el-option label="管理员" :value="1"/>
          <el-option label="客服" :value="2"/>
        </el-select>

        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </div>


      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="ID" label="ID" width="200" align="center"></el-table-column>
        <el-table-column prop="CreatedAt" label="创建时间"></el-table-column>
        <el-table-column prop="name" label="用户" width="100"></el-table-column>
        <el-table-column prop="name" label="角色" width="100">
          <template #default="scope">
            <div>
              <div v-if=" scope.row.role==1">
                <el-tag type="primary">管理员</el-tag>
              </div>
              <div v-else>
                <el-tag type="danger">客服</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="是否在线" align="center">
          <template #default="scope">
            <div>
              <div v-if=" scope.row.is_online">
                <el-tag type="success">在线</el-tag>
              </div>
              <div v-else>
                <el-tag type="danger">离线</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="last_login_at" label="最后在线时间"></el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
            background
            layout="total, prev, pager, next"
            :current-page="query.page"
            :page-size="query.page_size"
            :total="pageTotal"
            @current-change="handlePageChange"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, reactive} from "vue";
import {useRouter} from "vue-router";
import {getUserList} from "@/adminApi/user.js";


export default {
  name: "UserList",
  components: {},
  methods: {},
  setup() {
    const query = reactive({
      role: 2,
      isOnline: false,
      page: 1,
      page_size: 20,
    })
    const tableData = ref([])
    const pageTotal = ref(0)
    const router = useRouter();

    // 获取表格数据
    const getData = () => {
      getUserList(query).then(res => {
        tableData.value = res.data
        pageTotal.value = res.total
      })
    }
    getData()
    // 查询操作
    const handleSearch = () => {
      query.page = 1
      getData()
    }
    // 分页导航
    const handlePageChange = (val) => {
      query.page = val
      getData()
    }
    const handleEdit = (product) => {
      const {href} = router.resolve({
        path: '/collection_product_update',
        query: {
          collectionProductId: product.id
        }
      });
      window.open(href, "_blank");

    }

    return {
      query,
      tableData,
      pageTotal,
      handleEdit,
      handleSearch,
      handlePageChange,
      getData,
    }
  }
}
</script>

<style scoped>
.product_info div {
  margin-bottom: 5px;
}


.handle-box {
  margin-bottom: 20px;
}


.table {
  width: 100%;
  font-size: 14px;
}


</style>
