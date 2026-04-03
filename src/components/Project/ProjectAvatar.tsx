import CONFIG from '@/consts/config';
import { Avatar } from 'antd';

interface ProjectData {
  avatar?: string;
}

interface ProjectAvatarProps {
  data?: ProjectData | null;
}

export default ({ data }: ProjectAvatarProps) => {
  if (data === null) {
    return null;
  }
  return <Avatar size={96} src={data?.avatar || CONFIG.PROJECT_AVATAR_URL} />;
};
