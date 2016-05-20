DROP TABLE IF EXISTS `projects`;

CREATE TABLE `projects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `auth_zone` int(10) unsigned NOT NULL,
  `init_date` date DEFAULT NULL,
  `progress_status` int(11) DEFAULT NULL,
  `reclaiming` tinyint(1) DEFAULT NULL,
  `rec_status` tinyint(1) DEFAULT NULL,
  `submit_status` int(11) DEFAULT NULL,
  `monitoring` tinyint(1) DEFAULT NULL,
  `legal_status` tinyint(1) DEFAULT NULL,
  `ajust_status` tinyint(1) DEFAULT NULL,
  `ajust_submit_status` tinyint(1) DEFAULT NULL,
  `ajust_approval_status` tinyint(1) DEFAULT NULL,
  `auth_certified_status` tinyint(1) DEFAULT NULL,
  `benif_submit_status` tinyint(1) DEFAULT NULL,
  `benif_approval_status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`auth_zone`) REFERENCES authorizing(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;