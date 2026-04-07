import Area from '@ant-design/plots/es/components/area';

interface AreaProps {
  data: any[];
  xField: string;
  yField: string;
  height?: number;
}

export default ({ data, xField, yField, height = 260 }: AreaProps) => {
  const config = {
    data,
    xField: xField,
    yField: yField,
    height,
    xAxis: {
      range: [0, 1],
    },
  };

  return <Area {...config} />;
};
