CREATE DATABASE IF NOT EXISTS `tanxiaopianyi`  DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `tanxiaopianyi`;


DROP TABLE IF EXISTS `alimama_activity`;

CREATE TABLE `alimama_activity` (
  `activity_id` INT(10) NOT NULL COMMENT '淘宝活动ID',
  `title` VARCHAR(30) NOT NULL DEFAULT '' COMMENT '活动名称',
  `comments` VARCHAR(500) DEFAULT '' COMMENT '活动说明',
  `share_rate` INT(5) DEFAULT '0' COMMENT '分成比例',
  `avg_commission` INT(5) DEFAULT '0' COMMENT '平均佣金比率',
  `begin_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '淘宝活动开始时间',
  `end_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '淘宝活动结束时间',
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_modify` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` ENUM('block','normal') NOT NULL DEFAULT 'normal',
  PRIMARY KEY (`activity_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS `alimama_act_item`;

CREATE TABLE `alimama_act_item` (
  `activity_id` INT(10) NOT NULL COMMENT '淘宝活动ID',
  `item_id` BIGINT(20) NOT NULL COMMENT '淘宝商品ID',
  `item_title` VARCHAR(100) DEFAULT '' COMMENT '淘宝商品名',
  `seller_id` BIGINT(20) NOT NULL COMMENT '淘宝店铺ID',
  `pic_url` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '图片',
  `commission_rate` INT(5) NOT NULL DEFAULT '0' COMMENT '佣金比例',
  `is_sold_out` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否售罄',
  `discount_price` INT(10) NOT NULL DEFAULT '0' COMMENT '折扣价',
  `auction_price` INT(10) NOT NULL DEFAULT '0' COMMENT '拍卖价',
  `discount_rate` INT(10) NOT NULL DEFAULT '0' COMMENT '折扣率',
  `sold_quantity` INT(10) NOT NULL DEFAULT '0' COMMENT '销售量',
  `is_mall` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否是天猫商品',
  `act_begin_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '淘宝活动开始时间',
  `act_end_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT '淘宝活动结束时间',
  `share_rate` INT(5) NOT NULL DEFAULT '0' COMMENT '分成比例',
  `create_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_modify` TIMESTAMP NOT NULL DEFAULT now() ON UPDATE now(),
  PRIMARY KEY (`item_id`, `activity_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `alimama_pid`;

CREATE TABLE `alimama_pid` (
  `ali_pid` VARCHAR(50) NOT NULL COMMENT 'alimama推广位PID',
  `ali_pid_name` VARCHAR(100) NOT NULL COMMENT 'alimama推广位PID名称',
  `comments` VARCHAR(100) NOT NULL COMMENT 'PID的描述',
  `chn` VARCHAR(20) NOT NULL COMMENT '该PID投放的渠道',
  `create_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_modify` TIMESTAMP NOT NULL DEFAULT now() ON UPDATE now(),
  PRIMARY KEY (`ali_pid`),
  UNIQUE KEY `uniq_chn` (`chn`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS `product`;

CREATE TABLE `product` (
  `id` INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  `activity_id` INT(10) NOT NULL COMMENT '商家活动ID',
  `item_id` BIGINT(20) NOT NULL COMMENT '商家商品ID',
  `title` VARCHAR(100) NOT NULL COMMENT '商品名',
  `pic_url` VARCHAR(500) COMMENT '图片',
  `ori_pic_url` VARCHAR(500) NOT NULL COMMENT '抓取的图片',
  `commission_rate` INT(5) NOT NULL DEFAULT '0' COMMENT '佣金比例',
  `share_rate` INT(5) NOT NULL DEFAULT '0' COMMENT '分成比例',
  `is_sold_out` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否售罄',
  `discount_price` INT(10) NOT NULL DEFAULT '0' COMMENT '折扣价',
  `auction_price` INT(10) NOT NULL DEFAULT '0' COMMENT '拍卖价',
  `discount_rate` INT(10) NOT NULL DEFAULT '0' COMMENT '折扣率',
  `sold_quantity` INT(10) NOT NULL DEFAULT '0' COMMENT '销售量',
  `rank` INT(5) NOT NULL DEFAULT '0' COMMENT '排序分值,大值优先展示',
  `cat_id` INT(3) NOT NULL COMMENT '分类ID',
  `shop_id` INT(10) NOT NULL COMMENT '商家ID',
  `shop_name` VARCHAR(50) NOT NULL COMMENT '商家名',
  `p_shop_id` INT(10) NOT NULL DEFAULT '0' COMMENT '父商家ID',
  `p_shop_name` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '父商家名',
  `act_begin_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00'  COMMENT '淘宝活动开始时间',
  `act_end_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00'  COMMENT '淘宝活动结束时间',
  `begin_time` TIMESTAMP DEFAULT '0000-00-00 00:00:00'  COMMENT '投放开始时间',
  `end_time` TIMESTAMP DEFAULT '0000-00-00 00:00:00' COMMENT '投放束时间',
  `create_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_modify` TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  `status` ENUM('block','normal') NOT NULL DEFAULT 'normal' COMMENT 'block:前台不显示,normal:前台展示',
  UNIQUE KEY `uniq_item` (`item_id`),
  INDEX `idx_lastmodify` (`last_modify` DESC)
) AUTO_INCREMENT = 100000,ENGINE=INNODB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS `product_url`;

CREATE TABLE `product_url` (
  `product_id` INT(10) NOT NULL COMMENT '商品ID',
  `activity_id` INT(10) NOT NULL COMMENT '商家活动ID',
  `item_id` BIGINT(20) NOT NULL COMMENT '商家商品ID',
  `ali_pid` VARCHAR(50) NOT NULL COMMENT 'alimama的推广PID',
  `url` VARCHAR(500) NOT NULL COMMENT 'PID的描述',
  `create_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_modify` TIMESTAMP NOT NULL DEFAULT now() ON UPDATE now(),
  PRIMARY KEY (`product_id`,`ali_pid`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;



DROP TABLE IF EXISTS `shop`;

CREATE TABLE `shop` (
  `id` INT(10) NOT NULL COMMENT '商家ID',
  `shop_name` VARCHAR(50) NOT NULL COMMENT '商家名',
  `logo` VARCHAR(200) NOT NULL COMMENT '商家logo',
  `p_shop_id` INT(10) NOT NULL COMMENT '父商家ID',
  `p_shop_name` VARCHAR(50) NOT NULL COMMENT '父商家名',
  `create_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_modify` TIMESTAMP NOT NULL DEFAULT now() ON UPDATE now(),
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `category`;

CREATE TABLE `category` (
  `id` INT(10) NOT NULL COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名',
  `path` VARCHAR(50) NOT NULL COMMENT '用于url',
  `display_order` INT(10) NOT NULL DEFAULT '0' COMMENT '展示排序(值大优先显示)',
  `status` ENUM('block','normal') NOT NULL DEFAULT 'normal' COMMENT 'block:前台不显示,normal:前台展示',
  `create_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_modify` TIMESTAMP NOT NULL DEFAULT now() ON UPDATE now(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_path` (`path`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `fetch_item`;

CREATE TABLE `fetch_item` (
  `site_id` VARCHAR(20) NOT NULL COMMENT '站点',
  `site_pid` VARCHAR(20) NOT NULL COMMENT '抓取网站商品ID',
  `item_id` VARCHAR(50) NOT NULL COMMENT '商品ID',
  `title` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `cat_id` INT(3) NOT NULL COMMENT '分类ID',
  `rank` INT(3) NOT NULL COMMENT '在对方网站上,全分类时的排名',
  `pic_url` VARCHAR(500) NOT NULL COMMENT '图片地址',
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`site_id`, `item_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `fetch_website`;

CREATE TABLE `fetch_website` (
  `id` VARCHAR(20) NOT NULL,
  `name` VARCHAR(50) NOT NULL COMMENT '站点',
  `domain` VARCHAR(50) NOT NULL COMMENT '域名',
  `weight` INT(3) NOT NULL COMMENT '权重',
  `delay` INT(3) NOT NULL COMMENT '延迟时间',
  `interval` INT(3) NOT NULL COMMENT '间隔时长(unit:分,0为不抓取)',
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `sys_config`;

CREATE TABLE `sys_config` (
  `name` VARCHAR(50) NOT NULL,
  `key` VARCHAR(50) NOT NULL,
  `value` VARCHAR(500) NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  `last_modify` TIMESTAMP NOT NULL DEFAULT now() ON UPDATE now(),
  PRIMARY KEY (`key`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `union_data`;

CREATE TABLE `union_data` (
  `id` INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `product_id` INT(10) NOT NULL COMMENT '商品ID',
  `chn` VARCHAR(50),
  `from_url` VARCHAR(500),
  `to_url` VARCHAR(500) NOT NULL,
  `pos` VARCHAR(50),
  `create_time` TIMESTAMP NOT NULL DEFAULT NOW()
) ENGINE=INNODB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `search_data`;

CREATE TABLE `search_data` (
  `id` INT(10) UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `word` VARCHAR(50) NOT NULL COMMENT '搜索词',
  `count` INT(10),
  `create_time` TIMESTAMP NOT NULL DEFAULT NOW()
) ENGINE=INNODB DEFAULT CHARSET=utf8;