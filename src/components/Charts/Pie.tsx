import { Pie } from '@ant-design/plots';

interface PieProps {
  data: any[];
  height?: number;
  name?: string;
  value?: string;
}

export default ({ data, height, name = 'count', value = 'count' }: PieProps) => {
  const config = {
    appendPadding: 16,
    data,
    theme: {
      colors10: ['rgb(63, 205, 127)', 'rgb(230, 98, 97)', 'rgb(250, 207, 76)', 'rgb(86, 97, 235)'],
    },
    angleField: value,
    colorField: name,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
      },
    },
    tooltip: {
      showTitle: true,
      title: (title: string, datum: any) => {
        return `${datum.name}: ${(datum.percent * 100).toFixed(0)}%`;
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    height,
    autoFit: true,
  };
  return <Pie {...config} />;
};
