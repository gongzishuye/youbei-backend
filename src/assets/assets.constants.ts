export enum StrategyType {
  VEGETABLE = 1,
  FRUIT = 2,
  FISHING = 3,
  PIE = 4,
  HUNTING = 5,
  ECOLOGY = 6,
}

export enum ExchangeRateType {
  CNY = 1,
  USD = 2,
  HKD = 3,
  THB = 4,
  EUR = 5,
  USDT = 6
}

export enum PnlLineType {
  DAY = 1,
  MONTH = 2,
  YEAR = 3
}

export enum DeductedFrom {
  DISTRIBUTION = 0,
  ORIENT = 1
}

export enum AssetMarket {
  EQUITY_CN = 1,  // a股
  EQUITY_US = 2,  // 美股
  EQUITY_HK = 3,  // 港股
  EQUITY_VIETNAM = 4,  // 越南股票
  EQUITY_INDIA = 5,  // 印度股票
  //房产
  REAL_ESTATE_CN = 101,  // 中国房产
  REAL_ESTATE_UK = 102,  // 英国房产
  REAL_ESTATE_GR = 103,  // 希腊房产
  REAL_ESTATE_PT = 104,  // 葡萄牙房产
  // 债券
  BOND_CN = 201,  // 中国债券
  BOND_US = 202,  // 美国债券
  // 加密货币
  CRYPTO = 301,  // 中国加密货币
  // test
  TEST = 0
}

export enum AssetType {
  EQUITY = 1,  // 股票
  FUND = 2,  // 基金
  BOND = 3,  // 债券
  CRYPTO = 4,  // 加密货币
  REAL_ESTATE = 5,  // 房产
  GOLD = 6,  // 黄金
  INSURANCE = 7,  // 保险
  // 外汇
  FOREIGN_CURRENCY = 8,  // 外汇
  // 企业
  CORPORATION = 9,  // 企业
}