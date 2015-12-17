/*pid*/
insert into alimama_pid(ali_pid, ali_pid_name, comments, chn, create_time, last_modify) values ('mm_16546936_3400764_43782076', 'chn1', '贪小便宜', 'default', null, null);
insert into alimama_pid(ali_pid, ali_pid_name, comments, chn, create_time, last_modify) values ('mm_16546936_3400764_43780349', 'chn2', '未知', 'chn2', null, null);
insert into alimama_pid(ali_pid, ali_pid_name, comments, chn, create_time, last_modify) values ('mm_16546936_3400764_43772996', 'chn3', '未知', 'chn3', null, null);
insert into alimama_pid(ali_pid, ali_pid_name, comments, chn, create_time, last_modify) values ('mm_16546936_3400764_43780351', 'chn4', '未知', 'chn4', null, null);
insert into alimama_pid(ali_pid, ali_pid_name, comments, chn, create_time, last_modify) values ('mm_16546936_3400764_43782085', 'chn5', '未知', 'chn5', null, null);

/*shop*/
insert into shop(id, shop_name, logo, p_shop_id, p_shop_name, create_time) values (1, '淘宝', '', 0, '', null);
insert into shop(id, shop_name, logo, p_shop_id, p_shop_name, create_time) values (2, '天猫', '', 0, '', null);

/*category*/
insert into category(id, name, display_order, path, status, create_time) values (1, '女装', 0, 'nvz', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (2, '男装', 0, 'nz', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (3, '家居', 0, 'jj', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (4, '美妆', 0, 'mz', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (5, '鞋包', 0, 'xb', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (6, '美食', 0, 'ms', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (7, '配饰', 0, 'ps', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (8, '母婴', 0, 'my', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (9, '数码', 0, 'sm', 'normal', null);
insert into category(id, name, display_order, path, status, create_time) values (10, '百货', 0, 'bh', 'normal', null);

/*fetch_website*/
insert into fetch_website(id, `name`, domain, delay, `interval`, weight) values (1, '蛮便宜', 'manpianyi.com', 10, 10,1);
insert into fetch_website(id, `name`, domain, delay, `interval`, weight) values (2, '折800', 'zhe800.com', 10, 10, 1);
insert into fetch_website(id, `name`, domain, delay, `interval`, weight) values (3, '特买惠', 'temai.egou.com', 10, 10, 1);
insert into fetch_website(id, `name`, domain, delay, `interval`, weight) values (4, '1折网', '1zw.com', 10, 10, 1);


/*sys_config*/
insert into sys_config(`name`, `key`, `value`) values ('商品排序计算', 'item_order_weight', '');
