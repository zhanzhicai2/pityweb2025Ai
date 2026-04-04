// @ts-nocheck
import { Card, List } from 'antd';
import moment from 'moment';
import { useRequest } from 'umi';
import { queryFakeList } from '../../service';
import AvatarList from '../AvatarList';
import styles from './index.less';

interface Member {
  id: number;
  avatar?: string;
  name: string;
}

interface FakeListItem {
  id: number;
  title: string;
  subDescription?: string;
  cover?: string;
  updatedAt: string;
  members: Member[];
}

const Projects = () => {
  const { data: listData } = useRequest(() => {
    return queryFakeList({
      count: 30,
    });
  });

  return (
    <List
      className={styles.coverCardList}
      rowKey="id"
      grid={{
        gutter: 24,
        xxl: 3,
        xl: 2,
        lg: 2,
        md: 2,
        sm: 2,
        xs: 1,
      }}
      dataSource={listData?.list || []}
      renderItem={(item: FakeListItem) => (
        <List.Item>
          <Card className={styles.card} hoverable cover={<img alt={item.title} src={item.cover} />}>
            <Card.Meta title={<a>{item.title}</a>} description={item.subDescription} />
            <div className={styles.cardItemContent}>
              <span>{moment(item.updatedAt).fromNow()}</span>
              <div className={styles.avatarList}>
                <AvatarList size="small">
                  {item.members.map((member) => (
                    <AvatarList.Item
                      key={`${item.id}-avatar-${member.id}`}
                      src={member.avatar}
                      tips={member.name}
                    />
                  ))}
                </AvatarList>
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default Projects;
