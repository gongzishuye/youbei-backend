ALTER TABLE incomes ADD userid INT not null;
ALTER TABLE expenses ADD userid INT not null;
ALTER TABLE sells ADD userid INT not null;
ALTER TABLE incomes change createdAt created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE expenses add deducted_from SMALLINT not null comment '1. 总资产扣除 2. 打猎';
ALTER TABLE expenses add fishing double not null;
ALTER TABLE expenses add furit_tree double not null;
ALTER TABLE expenses add vegetable double not null;
ALTER TABLE expenses add hunting double not null;
ALTER TABLE expenses add ecology double not null;
ALTER TABLE expenses add pie double not null;
ALTER TABLE borrows add repayment double not null;
ALTER TABLE repays add repayment double not null;
alter table summary change trigger triggered BOOLEAN not null default false;
alter table references change publish_time publish_time varchar(50) not null DEFAULT '';
alter table `references` add rtype tinyint unsigned not null comment '1. summary 2. strategy pie';
alter table `references` change summary_id rtype_id int not null;
alter table reference_questions change summary_id reference_id int not null;
alter table incomes change itype itype varchar(50) comment '收入类型';
alter table statistics add total_cny double not null;
alter table buys change finance_rate finance_rate double not null default 0.0;
alter table incomes add distribution_type tinyint unsigned not null comment '1. 按比例分配 2. 定向分配';
alter table assets change market market INT unsigned not null;
alter table assets change code code VARCHAR(120) not null;
alter table assets change name name VARCHAR(128) not null default '';
alter table assets_statistics add income double not null;
alter table assets change market market INT unsigned not null;
alter table articles add cover_image_url VARCHAR(255);
alter table pnl change categories categories tinyint unsigned not null comment '0. 锁定盈亏 1. 损益';
alter table assets_snapshot add asset_id INT not null;
alter table summary change asset_name asset_id int not null;
alter table summary add date_time TIMESTAMP not null;
alter table references change extra_rel_info extra_rel_info varchar(20);
alter table references change extra_freshness_info extra_freshness_info varchar(20);
alter table references change extra_auth_info extra_auth_info varchar(20);
alter table pnl change date_at date_at TIMESTAMP not null;
alter table repays add rtype tinyint unsigned not null comment '1. 借出 2. 还款';
alter table dialogs add is_collect tinyint unsigned not null default 0 comment '是否收藏';
alter table dialogs add collect_time datetime(6) comment '收藏时间'; 
alter table buys add amount_ori double not null default -1.0;
alter table borrows add amount_ori double not null default -1.0;
alter table borrows change deadline deadline DATETIME comment '还款时间';


----------
CREATE DATABASE IF NOT EXISTS `youbei` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `desc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wechat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `main_userid` int(11) DEFAULT NULL,
  `level` tinyint(4) NOT NULL DEFAULT '1',
  `is_mainuser` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(120) not null,
  name VARCHAR(128) not null default '',
  price double not null default -1,
  atype tinyint unsigned not null comment 'asset type:1: 股票, 2: 债券, 3: 基金, 4: 数字货币, 5: 房产',
  category VARCHAR(32) comment 'atype的二级分类',
  market INT unsigned not null comment '1. 加密货币 2. a股票 3. 港股 4. 美股',
  currency tinyint not null comment '1. 人民币 2. 美元 3. 港币 4. 欧元 5. 英镑 6. 日元',
  bonus_rate double,
  asset_pool tinyint unsigned comment '1. 风险投资池 2. 网格交易池 3. 周期储备池 4. 现金池',
  creater VARCHAR(255),
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE assets_snapshot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT not null,
  code VARCHAR(120) not null,
  name VARCHAR(128) not null default '',
  price double not null default -1,
  atype tinyint unsigned not null comment 'asset type:1: 股票, 2: 债券, 3: 基金, 4: 数字货币, 5: 房产',
  category VARCHAR(32) comment 'atype的二级分类',
  market INT unsigned not null comment '1. 加密货币 2. a股票 3. 港股 4. 美股',
  currency tinyint not null comment '1. 人民币 2. 美元 3. 港币 4. 欧元 5. 英镑 6. 日元',
  bonus_rate double,
  asset_pool tinyint unsigned comment '1. 风险投资池 2. 网格交易池 3. 周期储备池 4. 现金池',
  creater VARCHAR(255),
  snapshot_time TIMESTAMP not null comment '快照时间',
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE currencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  symbol VARCHAR(10),
  exchange_rate double not null default -1.0,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner int not null comment 'user id',
  name VARCHAR(128) not null,
  `desc` VARCHAR(255),
  manager VARCHAR(40) not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE buys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buy_time TIMESTAMP not null comment '买入时间',
  asset_id INT not null default -1,
  user_id INT not null,
  count SMALLINT not null default -1,
  currency_id INT not null,
  exchange_rate double not null default -1.0,
  price double not null,
  amount double not null default -1.0,
  strategy tinyint unsigned not null comment '1. vegetable 2. fruit 3. fishing 4. hunting 5. pie 6. ecology',
  total_pay double not null,
  fee_rate double not null,
  fee double not null,

  account_id INT comment '账户id',
  financing boolean not null default false,
  finance_rate double not null default 0.0,
  dividend_yield double comment '股息率',
  `desc` VARCHAR(255),
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE buys_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buy_time TIMESTAMP not null comment '买入时间',
  asset_id INT not null default -1,
  user_id INT not null,
  count SMALLINT not null default -1,
  currency_id INT not null,
  exchange_rate double not null default -1.0,
  price double not null,
  amount double not null default -1.0,
  strategy tinyint unsigned not null comment '1. vegetable 2. fruit 3. fishing 4. hunting 5. pie 6. ecology',
  total_pay double not null,
  fee_rate double not null,
  fee double not null,

  account_id INT comment '账户id',
  financing boolean not null default false,
  finance_rate double not null default 0.0,
  dividend_yield double comment '股息率',
  `desc` VARCHAR(255),
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE sells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
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
  distribution_id INT default -1,
  fishing_ratio SMALLINT not null,
  fruit_ratio SMALLINT not null,
  vegetable_ratio SMALLINT not null,
  hunting_ratio SMALLINT not null,
  ecology_ratio SMALLINT not null,
  pie_ratio SMALLINT not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE incomes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  income_time TIMESTAMP not null comment '收入时间',
  user_id INT not null,
  `desc` VARCHAR(255) comment '收入描述',
  currency_id INT,
  exchange_rate double not null,
  amount double not null,
  distribution_type tinyint unsigned not null comment '1. 按比例分配 2. 定向分配',
  distribution_id INT default -1,
  fishing_ratio SMALLINT not null,
  fruit_ratio SMALLINT not null,
  vegetable_ratio SMALLINT not null,
  hunting_ratio SMALLINT not null,
  ecology_ratio SMALLINT not null,
  pie_ratio SMALLINT not null,

  itype varchar(50) comment '收入类型',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  expenses_time TIMESTAMP not null comment '支出时间',
  `desc` VARCHAR(255) comment '支出描述',
  category varchar(20) comment '支出类型',
  currency_id INT not null,
  amount double not null,
  exchange_rate double not null,
  equ_rmb double,
  deducted_from SMALLINT not null comment '1. 总资产扣除 2. 定向扣除',
  fishing double not null,
  furit_tree double not null,
  vegetable double not null,
  hunting double not null,
  ecology double not null,
  pie double not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE borrows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  borrow_time TIMESTAMP not null comment '借款时间',
  `desc` VARCHAR(255) comment '借款描述',
  currency_id INT not null,
  exchange_rate double not null,
  amount double not null,
  amount_ori double not null default -1.0,
  interest double comment '利息',
  interest_rate double comment '利息率',
  deadline DATETIME comment '还款时间',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE borrows_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  borrow_time TIMESTAMP not null comment '借款时间',
  `desc` VARCHAR(255) comment '借款描述',
  currency_id INT not null,
  exchange_rate double not null,
  amount double not null,
  interests double comment '利息',
  interest_rate double comment '利息率',
  deadline TIMESTAMP null comment '还款时间',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE repays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  rtype tinyint unsigned not null comment '1. 借出 2. 还款',
  borrow_id INT null,
  repay_time TIMESTAMP not null comment '还款时间',
  `desc` VARCHAR(255) comment '借款描述',
  currency_id INT not null,
  exchange_rate double not null,
  amount double not null,
  interest_rate double comment '利息率',
  interest double comment '利息',

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE cashpool (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cash_type tinyint unsigned not null comment '1. income 2. expense 3. buys 4. sells',
  cash_id INT not null comment 'cash_type对应的id',
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  isCash boolean not null comment 'true: cash, false: position',
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
  total_cny double not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE assets_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT not null,
  type tinyint unsigned not null comment '0. 总体 1. fishing 2. fruit 3. vegetable 4. hunting 5. ecology 6. pie',
  total_assets double not null,
  networth double not null,
  total_liabilities double not null,
  pnl double not null,
  upnl double not null,
  income double not null,
  expense double not null,
  cash double not null,
  positions double not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-------------------------------------------
-------------------------------------------
-------------------------------------------
-------------------------------------------
CREATE TABLE summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userid INT not null,
  content VARCHAR(255) not null,
  triggered BOOLEAN not null default false,
  asset_id int not null,
  incomes double not null,
  expenses double not null,
  pnl double not null,
  borrows double not null,
  total_pnl double not null,
  date_time TIMESTAMP not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

insert into summary (userid, content, triggered, asset_name) values (1, 'hello', false, 'BTC');

CREATE TABLE summary_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  summary_id INT not null,
  question VARCHAR(255) not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE references (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rtype tinyint unsigned not null comment '1. summary 2. strategy pie',
  rtype_id INT not null,
  url VARCHAR(255) not null,
  logo_url VARCHAR(255),
  title VARCHAR(255) not null,
  `summary` TEXT not null,
  publish_time varchar(50) not null DEFAULT '',
  cover_image_url VARCHAR(255),
  extra_rel_info varchar(20),
  extra_freshness_info varchar(20),
  extra_auth_info varchar(20),

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE reference_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_id INT not null,
  question VARCHAR(255) not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE core_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_url VARCHAR(255) not null,
  title VARCHAR(255) not null,
  `summary` TEXT not null,
  cover_image_url VARCHAR(255) not null,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE dialogs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(255) COMMENT '对话标题',
    status TINYINT DEFAULT 1 COMMENT '状态：1-进行中 2-已结束',
    model VARCHAR(50) COMMENT '使用的模型，如：gpt-3.5-turbo',
    is_collect tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否收藏',
    collect_time datetime(6) DEFAULT NULL COMMENT '收藏时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `dialogs_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dialog_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `role` tinyint(4) NOT NULL COMMENT '角色：user-0 system-1',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokens` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE pnl (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT not null,
    point_date TIMESTAMP null,
    strategy tinyint unsigned not null comment '1. vegetable 2. fruit 3. fishing 4. hunting 5. pie 6. ecology',
    pnl double not null,
    ptype tinyint unsigned not null comment '1. day 2. month 3. year',
    categories tinyint unsigned not null comment '1. 锁定盈亏 2. 损益',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

alter table pnl add ptype tinyint unsigned not null comment '1. day 2. month 3. year';


CREATE TABLE articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    summary TEXT,
    cover_image_url VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    cover_image_url VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;