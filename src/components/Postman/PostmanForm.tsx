import PostmanBody from '@/components/Postman/PostmanBody';
import { connect } from '@umijs/max';
import { Card } from 'antd';
import React from 'react';

interface PostmanFormProps {
  bordered?: boolean;
  gconfig?: any;
  dispatch?: any;
  form: any;
  body?: any;
  setBody?: (body: any) => void;
  headers?: any[];
  setHeaders?: (headers: any[]) => void;
  formData?: any[];
  setFormData?: (data: any[]) => void;
  caseInfo?: any;
  bodyType?: number;
  setBodyType?: (type: number) => void;
  save?: any;
}

const PostmanForm: React.FC<PostmanFormProps> = (props) => {
  return (
    <Card bordered={props.bordered}>
      <PostmanBody
        {...(props as any)}
        body={props.body as string}
        headers={props.headers as any[]}
      />
    </Card>
  );
};

export default connect(({ gconfig }: any) => ({ gconfig }))(PostmanForm);
