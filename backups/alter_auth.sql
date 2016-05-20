alter table gis1.projects modify rec_status nvarchar(32);
alter table gis1.projects modify submit_status nvarchar(32);
alter table gis1.projects modify progress_status nvarchar(32);
alter table gis1.projects modify monitoring nvarchar(32);
alter table gis1.projects modify legal_status nvarchar(32);
alter table gis1.projects modify ajust_status nvarchar(32);
alter table gis1.projects modify ajust_submit_status nvarchar(32);
alter table gis1.projects modify ajust_approval_status nvarchar(32);
alter table gis1.projects modify auth_certified_status nvarchar(32);
alter table gis1.projects modify benif_submit_status nvarchar(32);
alter table gis1.projects modify benif_approval_status nvarchar(32);
alter table gis1.projects modify reclaiming nvarchar(32);

update gis1.projects set 
	reclaiming = if(reclaiming='0','未填海','填海'),
	progress_status = case progress_status when '0' then '开工' when '1' then '竣工' when '2' then '验收' end,
	rec_status = if(rec_status='0','超面积','正常'),
	submit_status = case submit_status when '0' then '已上报' when '1' then '上报预警' when '2' then '上报报警' end,
	monitoring = if(monitoring='0','未监测','已监测'),
	legal_status = if(legal_status='0','违法','合法'),
	ajust_status = if(ajust_status='0','无调整','有调整'),
	ajust_submit_status = if(ajust_submit_status='0','未上报','已上报'),
	ajust_approval_status = if(ajust_approval_status='0','未通过','已通过'),
	auth_certified_status = if(auth_certified_status='0','未发证','已发证'),
	benif_submit_status = if(benif_submit_status='0','未上报','已上报'),
	benif_approval_status = if(benif_approval_status='0','未通过','已通过');

alter table gis1.projects change progress_status `项目进展情况` nvarchar(32);
alter table gis1.projects change reclaiming `填海情况` nvarchar(32);
alter table gis1.projects change rec_status `填海超面积情况` nvarchar(32);
alter table gis1.projects change submit_status `海域使用上报情况` nvarchar(32);
alter table gis1.projects change monitoring `动态监测情况` nvarchar(32);
alter table gis1.projects change legal_status `违法情况` nvarchar(32);
alter table gis1.projects change ajust_status `用海调整情况` nvarchar(32);
alter table gis1.projects change ajust_submit_status `调整上报情况` nvarchar(32);
alter table gis1.projects change ajust_approval_status `调整上报审批情况` nvarchar(32);
alter table gis1.projects change auth_certified_status `确权发证情况` nvarchar(32);
alter table gis1.projects change benif_submit_status `受益方上报情况` nvarchar(32);
alter table gis1.projects change benif_approval_status `受益方上报审批情况` nvarchar(32);
alter table gis1.projects change dist_src `配号来源` nvarchar(32);
alter table gis1.projects change cata_lv1 `用海一级类` nvarchar(32);
alter table gis1.projects change cata_lv2 `用海二级类` nvarchar(32);
alter table gis1.projects change method `用海方式` nvarchar(32);