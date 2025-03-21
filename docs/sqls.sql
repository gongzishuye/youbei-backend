----------
CREATE DATABASE IF NOT EXISTS `youbei`;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) not null,
  nickname VARCHAR(255),
  `desc` VARCHAR(255),
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  wechat VARCHAR(255),
  main_userid INT not null,
  level tinyint unsigned not null default 1,
  is_mainuser boolean not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(16) not null,
  name VARCHAR(128) not null,
  price double not null default -1,
  atype tinyint unsigned not null comment 'asset type:1: 股票, 2: 债券, 3: 期货, 4: 期权, 5: 基金, 6: 数字货币, 7: 其他',
  category VARCHAR(32) comment 'atype的二级分类',
  market tinyint unsigned not null comment '1. 加密货币 2. a股票 3. 港股 4. 美股',
  currency tinyint not null comment '1. 人民币 2. 美元 3. 港币 4. 欧元 5. 英镑 6. 日元',
  bonus_rate double,
  asset_pool tinyint unsigned comment '1. 风险投资池 2. 网格交易池 3. 周期储备池 4. 现金池',
  creater VARCHAR(255),
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE currencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  symbol VARCHAR(10),
  exchange_rate double not null default -1.0,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE distribution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner int not null comment 'user id',
  name VARCHAR(128) not null,
  `desc` VARCHAR(255),
  fishing tinyint unsigned not null,
  fruit_tree tinyint unsigned not null,
  vegetable tinyint unsigned not null,
  hunting tinyint unsigned not null,
  ecology tinyint unsigned not null,
  pie tinyint unsigned not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner int not null comment 'user id',
  name VARCHAR(128) not null,
  `desc` VARCHAR(255),
  manager VARCHAR(40) not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buy_time TIMESTAMP not null comment '买入时间',
  asset_id INT not null default -1,
  count SMALLINT not null default -1,
  currency_id INT not null,
  exchange_rate double not null default -1.0,
  price double not null,
  amount double not null default -1.0,
  strategy tinyint unsigned not null comment '1. 种菜 2. 打猎 3. 钓鱼 4. 生态位 5. 种果树 6. 捡馅饼',
  total_pay double not null,
  fee_rate double not null,
  fee double not null,
  account_id INT not null,

  financing boolean not null default false,
  finance_rate double not null,
  dividend_yield double not null comment '股息率',
  `desc` VARCHAR(255),
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT not null default -1,
  sell_time TIMESTAMP not null comment '卖出时间',
  currency_id INT not null,
  exchange_rate double not null,
  buys_id INT not null,
  amount double not null,
  sell_price double not null,
  amount_left double not null,
  pnl double not null,
  fee_rate double not null,
  fee double not null,
  
  distribution_type tinyint unsigned not null comment '1. 按比例分配 2. 定向分配',
  distribution_id INT not null,
  fishing_ratio SMALLINT not null,
  fruit_ratio SMALLINT not null,
  vegetable_ratio SMALLINT not null,
  hunting_ratio SMALLINT not null,
  ecology_ratio SMALLINT not null,
  pie_ratio SMALLINT not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incomes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  income_time TIMESTAMP not null comment '收入时间',
  `desc` VARCHAR(255) comment '收入描述',
  currency_id INT,
  exchange_rate double not null,
  amount double not null,
  distribution_id INT,
  fishing_ratio SMALLINT not null,
  fruit_ratio SMALLINT not null,
  vegetable_ratio SMALLINT not null,
  hunting_ratio SMALLINT not null,
  ecology_ratio SMALLINT not null,
  pie_ratio SMALLINT not null,

  itype SMALLINT comment '1. 工资 2. 奖金 3. 利息 4. 股息 5. 分红 6. 其他',
  pattern SMALLINT comment '1. 非投资收入 2. 投资收入',
  country_from SMALLINT comment '1. 中国 2. 美国 3. 香港 4. 其他',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expenses_time TIMESTAMP not null comment '支出时间',
  `desc` VARCHAR(255) comment '支出描述',
  category SMALLINT not null comment '1. 生活费 2. 房租 3. 水电费 4. 交通费 5. 通讯费 6. 娱乐费 7. 其他',
  currency_id INT,
  amount double not null,
  exchange_rate double not null,
  equ_rmb double not null,
  strategy SMALLINT not null comment '1. 种菜 2. 打猎 3. 钓鱼 4. 生态位 5. 种果树 6. 捡馅饼',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrow (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  borrow_time TIMESTAMP not null comment '借款时间',
  `desc` VARCHAR(255) comment '借款描述',
  currency_id INT not null,
  exchange_rate double not null,
  amount double not null,
  interests double comment '利息',
  deadline TIMESTAMP comment '还款时间',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repay (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  borrow_id INT not null,
  repay_time TIMESTAMP not null comment '还款时间',
  `desc` VARCHAR(255) comment '借款描述',
  currency_id INT not null,
  exchange_rate double not null,
  amount double not null,
  amount_left double not null,
  interests double comment '利息',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cashpool (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cash_type tinyint unsigned not null comment '1. income 2. outcome 3. buys 4. sells',
  cash_id INT not null,
  currency_id INT not null,
  fishing_cash double not null,
  fruit_cash double not null,
  vegetable_cash double not null,
  hunting_cash double not null,
  ecology_cash double not null,
  pie_cash double not null,
  user_id INT not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cash_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  isCash boolean not null,
  fishing_cash_usd double not null,
  fishing_cash_hkd double not null,
  fishing_cash_eur double not null,
  fishing_cash_cny double not null,
  fishing_cash_thb double not null,
  fishing_cash_usdt double not null,
  fruit_cash_usd double not null,
  fruit_cash_hkd double not null,
  fruit_cash_eur double not null,
  fruit_cash_cny double not null,
  fruit_cash_thb double not null,
  fruit_cash_usdt double not null,
  vegetable_cash_usd double not null,
  vegetable_cash_hkd double not null,
  vegetable_cash_eur double not null,
  vegetable_cash_cny double not null,
  vegetable_cash_thb double not null,
  vegetable_cash_usdt double not null,
  hunting_cash_usd double not null,
  hunting_cash_hkd double not null,
  hunting_cash_eur double not null,
  hunting_cash_cny double not null,
  hunting_cash_thb double not null,
  hunting_cash_usdt double not null,
  ecology_cash_usd double not null,
  ecology_cash_hkd double not null,
  ecology_cash_eur double not null,
  ecology_cash_cny double not null,
  ecology_cash_thb double not null,
  ecology_cash_usdt double not null,
  pie_cash_usd double not null,
  pie_cash_hkd double not null,
  pie_cash_eur double not null,
  pie_cash_cny double not null,
  pie_cash_thb double not null,
  pie_cash_usdt double not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  total_assets double not null,
  networth double not null,
  total_liabilities double not null,
  pnl double not null,
  upnl double not null,
  expense double not null,
  cash double not null,
  positions double not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

