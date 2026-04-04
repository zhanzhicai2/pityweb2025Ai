// @ts-nocheck
import { Avatar } from 'antd';
import moment from 'moment';
import styles from './index.less';

interface ArticleListContentProps {
  data: {
    content: string;
    updatedAt: string;
    avatar?: string;
    owner: string;
    href: string;
  };
}

const ArticleListContent = ({
  data: { content, updatedAt, avatar, owner, href },
}: ArticleListContentProps) => (
  <div className={styles.listContent}>
    <div className={styles.description}>{content}</div>
    <div className={styles.extra}>
      <Avatar src={avatar} size="small" />
      <a href={href}>{owner}</a> 发布在 <a href={href}>{href}</a>
      <em>{moment(updatedAt).format('YYYY-MM-DD HH:mm')}</em>
    </div>
  </div>
);

export default ArticleListContent;
