import CONFIG from '@/consts/config';
import { Avatar, Select } from 'antd';

const { Option } = Select;

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface UserSelectProps {
  users: User[];
  placeholder?: string;
  onChange?: (value: number) => void;
  value?: number;
  mode?: 'multiple' | 'tags';
}

export default ({ users, placeholder = '请选择人员', onChange, value, mode }: UserSelectProps) => {
  return (
    <Select
      allowClear
      onChange={onChange}
      value={value}
      showSearch
      placeholder={placeholder}
      mode={mode}
      filterOption={(input, option) => {
        if (!option) return false;
        const children = (option as any).children;
        if (!children || !Array.isArray(children)) return false;
        return (
          children[2]?.toLowerCase?.().indexOf(input.toLowerCase()) > -1 ||
          children[4]?.toLowerCase?.().indexOf(input.toLowerCase()) > -1
        );
      }}
    >
      {users.map((v) => (
        <Option key={v.id} value={v.id}>
          <Avatar size={14} src={v.avatar || CONFIG.AVATAR_URL} /> {v.name}({v.email})
        </Option>
      ))}
    </Select>
  );
};
