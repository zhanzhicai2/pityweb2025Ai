// @ts-nocheck
import { LikeOutlined, MessageFilled, StarTwoTone } from '@ant-design/icons';
import { List, Tag } from 'antd';
import { useRequest } from 'umi';
import { queryFakeList } from '../../service';
import ArticleListContent from '../ArticleListContent';
import styles from './index.less';

interface FakeListItem {
  id: number;
  href: string;
  title: string;
  content: string;
  avatar?: string;
  owner: string;
  star: number;
  like: number;
  message: number;
}

const Articles = () => {
  const IconText = ({ icon, text }: { icon: React.ReactNode; text: number }) => (
    <span>
      {icon} {text}
    </span>
  );

  const { data: listData } = useRequest(() => {
    return queryFakeList({
      count: 30,
    });
  });

  return (
    <List
      size="large"
      className={styles.articleList}
      rowKey="id"
      itemLayout="vertical"
      dataSource={listData?.list || []}
      renderItem={(item: FakeListItem) => (
        <List.Item
          key={item.id}
          actions={[
            <IconText key="star" icon={<StarTwoTone />} text={item.star} />,
            <IconText key="like" icon={<LikeOutlined />} text={item.like} />,
            <IconText key="message" icon={<MessageFilled />} text={item.message} />,
          ]}
        >
          <List.Item.Meta
            title={
              <a className={styles.listItemMetaTitle} href={item.href}>
                {item.title}
              </a>
            }
            description={
              <span>
                <Tag>Ant Design</Tag>
                <Tag>设计语言</Tag>
                <Tag>蚂蚁金服</Tag>
              </span>
            }
          />
          <ArticleListContent data={item} />
        </List.Item>
      )}
    />
  );
};

export default Articles;
