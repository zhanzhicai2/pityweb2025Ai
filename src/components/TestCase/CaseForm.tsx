import CommonForm from '@/components/Drawer/CommonForm';
import fields from '@/consts/fields';
import { Row } from 'antd';
import React from 'react';

interface CaseFormProps {
  data: any;
  modal: boolean;
  setModal: (modal: boolean) => void;
  onFinish: (values: any) => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ data, modal, setModal, onFinish }) => {
  return (
    <Row gutter={[8, 8]}>
      <CommonForm
        title="新增接口测试用例"
        left={6}
        right={18}
        width={800}
        record={data}
        onFinish={onFinish}
        fields={fields.CaseDetail}
        onCancel={() => setModal(false)}
        open={modal}
      />
    </Row>
  );
};

export default CaseForm;
