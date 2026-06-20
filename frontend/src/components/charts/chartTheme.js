import { createElement } from 'react';

export const chartMargin = {
  top: 10,
  right: 10,
  left: -10,
  bottom: 0,
};

export const chartAxisTick = {
  fontSize: 11,
  fill: '#94A3B8',
};

export const chartGridProps = {
  strokeDasharray: '3 3',
  stroke: '#F1F5F9',
  vertical: false,
};

export const chartTooltipStyle = {
  backgroundColor: '#1E293B',
  border: 'none',
  borderRadius: '8px',
  color: '#F8FAFC',
  fontSize: '12px',
  padding: '8px 12px',
};

export function formatChartNumber(value) {
  if (value == null || value === '') {
    return '--';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  if (Math.abs(numericValue) >= 1000) {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(numericValue);
  }

  if (Number.isInteger(numericValue)) {
    return `${numericValue}`;
  }

  return numericValue.toFixed(1);
}

function getDateInterval(dataLength = 0) {
  if (!dataLength || dataLength <= 6) {
    return 'preserveStartEnd';
  }

  return Math.max(0, Math.floor(dataLength / 5));
}

export function getXAxisProps(dataKey) {
  return {
    dataKey,
    tick: chartAxisTick,
    axisLine: false,
    tickLine: false,
  };
}

export function getDateXAxisProps(dataKey, dataLength) {
  return {
    ...getXAxisProps(dataKey),
    interval: getDateInterval(dataLength),
  };
}

export function getYAxisProps(domain = [0, 'auto']) {
  return {
    domain,
    tick: chartAxisTick,
    axisLine: false,
    tickLine: false,
    tickCount: 5,
    tickFormatter: formatChartNumber,
    width: 35,
  };
}

export function getTooltipProps(unit = '') {
  return {
    contentStyle: chartTooltipStyle,
    labelStyle: {
      color: '#94A3B8',
      marginBottom: '4px',
    },
    itemStyle: {
      color: '#F8FAFC',
    },
    cursor: {
      stroke: '#CBD5E1',
      strokeDasharray: '4 4',
    },
    formatter: (value, name) => [`${formatChartNumber(value)}${unit}`, name],
  };
}

export function renderLastPointDot(totalPoints, color, radius = 4) {
  return function LastPointDot(props) {
    const { cx, cy, index } = props;

    if (index !== totalPoints - 1 || cx == null || cy == null) {
      return null;
    }

    return createElement('circle', {
      cx,
      cy,
      r: radius,
      fill: color,
      stroke: '#FFFFFF',
      strokeWidth: 2,
    });
  };
}
