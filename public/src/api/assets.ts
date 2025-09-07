import request from './request'

export interface Asset {
  id: number
  code: string
  name: string
  price: number
  atype: number
  category: string | null
  market: number
  currency: number
  bonusRate: number
  assetPool: string | null
  creator: number
  updatedAt: string
  createdAt: string
}

export interface SearchAssetsResponse {
  data: Asset[]
  code: number
  message: string
  success: boolean
  timestamp: number
}

export interface SearchAssetsParams {
  query?: string
  page?: number
}

// 搜索资产
export const searchAssets = (params: SearchAssetsParams = {}): Promise<SearchAssetsResponse> => {
  return request.get('/search/assets', { params })
} 