// @ts-nocheck
// @ts-nocheck
import LoadingFailed from '@/assets/LoadingFailed.svg';
import NoRecord from '@/components/NotFound/NoRecord';
import ProjectInfo from '@/components/Project/ProjectInfo';
import ProjectRole from '@/components/Project/ProjectRole';
import CONFIG from '@/consts/config';
import { queryProject } from '@/services/project';
import { listUsers } from '@/services/user';
import auth from '@/utils/auth';
import { PageContainer, PageHeader } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Avatar, Card, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import styles from './Project.less';

const { TabPane } = Tabs;

const ProjectDetail: React.FC = () => {
  const params = useParams();
  const projectId = params.id;
  const [projectData, setProjectData] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [authority, setAuthority] = useState(false);

  const fetchUsers = async () => {
    const res = await listUsers();
    setUsers(res);
  };

  const fetchData = async (projId = projectId) => {
    const res = await queryProject({ projectId: projId });
    setAuthority(res.code !== 403);
    if (auth.response(res)) {
      setProjectData(res.data.project);
      setRoles(res.data.roles);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  return authority ? (
    <PageContainer
      breadcrumb={undefined}
      title={
        <PageHeader
          className={styles.sitePageHeader}
          onBack={() => {
            window.history.back();
          }}
          title={
            <span>
              <Avatar src={projectData.avatar || CONFIG.PROJECT_AVATAR_URL} /> {projectData.name}
            </span>
          }
        />
      }
    >
      <Card bodyStyle={{ padding: '8px 18px' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="成员列表" key="1">
            <ProjectRole users={users} project={projectData} roles={roles} fetchData={fetchData} />
          </TabPane>
          <TabPane tab="项目设置" key="2">
            <ProjectInfo data={projectData} users={users} reloadData={fetchData} />
          </TabPane>
        </Tabs>
      </Card>
    </PageContainer>
  ) : (
    <NoRecord height={400} desc="对不起, 你没有权限访问该项目" image={LoadingFailed} />
  );
};

export default ProjectDetail;
