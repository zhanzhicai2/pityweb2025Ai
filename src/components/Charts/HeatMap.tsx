import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ReactTooltip from 'react-tooltip';

interface HeatmapValue {
  date: string;
  count: number;
}

interface HeatMapProps {
  values: HeatmapValue[];
  startDate: string;
  endDate: string;
}

export default ({ values, startDate, endDate }: HeatMapProps) => {
  return (
    <>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        showWeekdayLabels={true}
        tooltipDataAttrs={(value: HeatmapValue) => {
          return value.date === null
            ? null
            : {
                'data-tip': `${value.date} 操作记录: ${value.count}`,
              };
        }}
      />
      <ReactTooltip />
    </>
  );
};
