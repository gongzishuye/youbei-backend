<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useUserStore } from './stores/user';
import { jwtDecode } from 'jwt-decode';

const authStore = useAuthStore();
const userStore = useUserStore();

// 初始化用户信息
onMounted(() => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userStore.setUser(decoded.userid, decoded.username || '', token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      authStore.logout();
    }
  }
});
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
</style> 