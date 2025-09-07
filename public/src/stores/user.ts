import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: 0,
    username: '',
    token: '',
  }),
  
  actions: {
    setUser(userId: number, username: string, token: string) {
      this.userId = userId;
      this.username = username;
      this.token = token;
    },
    
    clearUser() {
      this.userId = 0;
      this.username = '';
      this.token = '';
    },
  },
}); 