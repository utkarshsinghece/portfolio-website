
-- Skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_title TEXT NOT NULL,
  name TEXT NOT NULL,
  icon_key TEXT NOT NULL DEFAULT 'database',
  color TEXT NOT NULL DEFAULT '#FFFFFF',
  sort_order INTEGER NOT NULL DEFAULT 0,
  group_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin manage skills" ON public.skills FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Admin manage education" ON public.education FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed skills (existing groups)
INSERT INTO public.skills (group_title, name, icon_key, color, group_order, sort_order) VALUES
('Big Data & Processing','Apache Spark','spark','#E25A1C',0,0),
('Big Data & Processing','PySpark','python','#3776AB',0,1),
('Big Data & Processing','Hadoop','hadoop','#66CCFF',0,2),
('Big Data & Processing','Hive','hive','#FDEE21',0,3),
('Big Data & Processing','Kafka','kafka','#FFFFFF',0,4),
('Big Data & Processing','Databricks','databricks','#FF3621',0,5),
('Warehousing & Storage','Snowflake','snowflake','#29B5E8',1,0),
('Warehousing & Storage','AWS Redshift','harddrive','#8C4FFF',1,1),
('Warehousing & Storage','AWS S3','cloud','#569A31',1,2),
('Warehousing & Storage','Data Warehousing','database','#A78BFA',1,3),
('Warehousing & Storage','ETL','workflow','#22D3EE',1,4),
('Warehousing & Storage','PostgreSQL','postgresql','#4169E1',1,5),
('Warehousing & Storage','MySQL','mysql','#00758F',1,6),
('Orchestration & Cloud','Airflow','airflow','#017CEE',2,0),
('Orchestration & Cloud','Azure Data Factory','cloud','#0078D4',2,1),
('Orchestration & Cloud','AWS','cloud','#FF9900',2,2),
('Orchestration & Cloud','Docker','docker','#2496ED',2,3),
('Orchestration & Cloud','Control-M','server','#F472B6',2,4),
('Languages & Tools','Python','python','#3776AB',3,0),
('Languages & Tools','SQL','database','#E48E00',3,1),
('Languages & Tools','Java','java','#ED8B00',3,2),
('Languages & Tools','Unix / Shell','linux','#FCC624',3,3),
('Languages & Tools','Bash','bash','#4EAA25',3,4),
('Languages & Tools','Tableau','chart','#E97627',3,5),
('DevOps & Collaboration','CI/CD','gitbranch','#22C55E',4,0),
('DevOps & Collaboration','Jenkins','jenkins','#D33833',4,1),
('DevOps & Collaboration','Git','git','#F05032',4,2),
('DevOps & Collaboration','GitHub','github','#FFFFFF',4,3),
('DevOps & Collaboration','Stakeholder Mgmt','users','#60A5FA',4,4);

INSERT INTO public.education (institution, degree, location, period, sort_order) VALUES
('JSS Academy of Technical Education','Bachelor of Technology','Noida','Graduated 08/2021',0);
