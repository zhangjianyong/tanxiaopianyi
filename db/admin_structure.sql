CREATE DATABASE IF NOT EXISTS `tanxiaopianyi`  DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `tanxiaopianyi`;

DROP TABLE IF EXISTS `admin_user`;

CREATE TABLE `admin_user` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `u_name` varchar(20) DEFAULT '' COMMENT '',
  `u_nick` varchar(20) DEFAULT '' COMMENT '',
  `u_email` varchar(50) DEFAULT '' COMMENT '',
  `u_phone` varchar(20) DEFAULT '' COMMENT '',
  `u_pwd` varchar(32) DEFAULT '' COMMENT '',
  `u_status` tinyint(2) DEFAULT '0' COMMENT '',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;