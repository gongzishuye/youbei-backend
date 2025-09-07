import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserList from '@/views/UserList.vue'
import ChangePassword from '@/views/ChangePassword.vue'
import UserBuyHistory from '@/views/UserBuyHistory.vue'
import UserSellHistory from '@/views/UserSellHistory.vue'
import UserIncomeHistory from '@/views/UserIncomeHistory.vue'
import UserExpenseHistory from '@/views/UserExpenseHistory.vue'
import CreateBuyRecord from '@/views/CreateBuyRecord.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: {
        created() {
          // 如果是直接访问根域名，重定向到实际的首页
          window.location.href = '/home'
        },
        template: '<div></div>'
      }
    },
    {
      path: '/backend',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          redirect: '/dashboard/users'
        },
        {
          path: 'users',
          name: 'UserList',
          component: UserList
        },
        {
          path: 'users/:userId/buy-history',
          name: 'UserBuyHistory',
          component: () => import('@/views/UserBuyHistory.vue'),
          children: [
            {
              path: 'create',
              name: 'CreateBuyRecord',
              component: () => import('@/views/CreateBuyRecord.vue')
            },
            {
              path: 'edit/:id',
              name: 'EditBuyRecord',
              component: () => import('@/views/CreateBuyRecord.vue'),
              props: true
            }
          ]
        },
        {
          path: 'users/:userId/sell-history',
          name: 'UserSellHistory',
          component: () => import('@/views/UserSellHistory.vue'),
          children: [
            {
              path: 'create',
              name: 'CreateSellRecord',
              component: () => import('@/views/EditSellRecord.vue')
            },
            {
              path: 'edit/:id',
              name: 'EditSellRecord',
              component: () => import('@/views/EditSellRecord.vue'),
              props: true
            }
          ]
        },
        {
          path: 'users/:userId/income-history',
          name: 'UserIncomeHistory',
          component: UserIncomeHistory,
          children: [
            {
              path: 'create',
              name: 'CreateIncomeRecord',
              component: () => import('@/views/EditIncomeRecord.vue')
            },
            {
              path: 'edit/:id',
              name: 'EditIncomeRecord',
              component: () => import('@/views/EditIncomeRecord.vue'),
              props: true
            }
          ]
        },
        {
          path: 'users/:userId/expense-history',
          name: 'UserExpenseHistory',
          component: UserExpenseHistory,
          children: [
            {
              path: 'create',
              name: 'CreateExpenseRecord',
              component: () => import('@/views/EditExpenseRecord.vue')
            },
            {
              path: 'edit/:id',
              name: 'EditExpenseRecord',
              component: () => import('@/views/EditExpenseRecord.vue'),
              props: true
            }
          ]
        },
        {
          path: 'change-password',
          name: 'ChangePassword',
          component: ChangePassword
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 