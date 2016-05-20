drop database if exists gis1;
create database gis1;
use gis1;

create table authorizing(
	id int unsigned not null primary key,
	init_date date,
	area nvarchar(255),
	progress_status int,
	reclaiming bool,
	rec_status bool,
	submit_status int,
	monitoring bool,
	legal_status bool,
	ajust_status bool,
	ajust_submit_status bool,
	ajust_approval_status bool,
	auth_certified_status bool,
	benif_submit_status bool,
	benif_approval_status bool,
	dist_src nvarchar(255),
	cata_lv1 nvarchar(255),
	cata_lv2 nvarchar(255),
	method nvarchar(255)
);

create table zoning(
	id int unsigned not null primary key,
	area nvarchar(255),
	objectid int unsigned not null,
	function nvarchar(255),
	shape_area float,
	shape_len float
);




load data infile 'd:/desktop/authorizing.csv'
	into table authorizing
	CHARACTER SET 'utf8'
	FIELDS
	  TERMINATED BY ','
	  optionally enclosed by '"'
	LINES
	  TERMINATED BY '\n'
	ignore 1 lines
	(id, dist_src, cata_lv1, cata_lv2, method);

load data infile 'd:/desktop/zoning.csv'
	into table zoning
	CHARACTER SET 'utf8'
	FIELDS
	  TERMINATED BY ','
	  #optionally enclosed by '"'
	LINES
	  TERMINATED BY '\n'
	ignore 1 lines
	(id, objectid, function);
    
update authorizing set
	init_date = concat(2010 + ceil(POW(rand(),2)*6),'-',lpad(ceil(rand()*12),2,'0'),'-',lpad(ceil(rand()*28),2,'0')),
	progress_status = ceil(rand()*3),
	reclaiming = ceil(rand()*2) -1,
	rec_status = ceil(rand()*2) -1,
	submit_status = ceil(rand()*3),
	monitoring = ceil(rand()*2) -1,
	legal_status = ceil(rand()*2) -1,
	ajust_status = ceil(rand()*2) -1,
	ajust_submit_status = ceil(rand()*2) -1,
	ajust_approval_status = ceil(rand()*2) -1,
	auth_certified_status = ceil(rand()*2) -1,
	benif_submit_status = ceil(rand()*2) -1,
	benif_approval_status = ceil(rand()*2) -1
 where id is not null;s