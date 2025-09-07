// 用户信息类型
export interface User {
  id: number
  name: string
  nickname: string | null
  desc: string | null
  phone: string | null
  password: string | null
  avatarUrl: string | null
  wechat: string | null
  mainUserid: number
  level: number
  isMainuser: number
  createdAt: string
  updatedAt: string
}

// 登录请求类型
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  status: number
  bearer: string
}

// 修改密码请求类型
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface Asset {
  id: number;
  code: string;
  name: string;
  price: number;
  atype: number;
  category: string | null;
  market: number;
  currency: number;
  bonusRate: number;
  assetPool: string | null;
  creator: number;
  updatedAt: string;
  createdAt: string;
}

export interface BuyRecord {
  id: number;
  assetId: number;
  assets: Asset;
  userId: number;
  currencyId: number;
  exchangeRate: number;
  price: number;
  amount: number;
  amountOri: number;
  buyTime: string;
  strategy?: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
} 