import { TokenPriceHistoryContext } from "contexts/TokenPriceHistory";
import { useContext } from "react";
import Chart from 'kaktana-react-lightweight-charts';

export default function TokenPriceChart() {
  const priceHistory = useContext(TokenPriceHistoryContext);
  // Calculate precision based on displayed values
  const lowestPrice = priceHistory.map((dataPoint) => dataPoint.value)
    .reduce((prev, curr) => Math.min(prev, curr), Number.MAX_VALUE);
  const chartPrecision = lowestPrice.toPrecision(3).split('.')[1]?.length ?? 2;
  const minMove = Math.pow(10, -chartPrecision).toPrecision(1);
  return <Chart
    autoWidth
    darkTheme
    options={
      {
        alignLabels: true,
        timeScale: {
          rightOffset: 12,
          barSpacing: 3,
          fixLeftEdge: true,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          borderVisible: false,
          borderColor: "#fff000",
          visible: true,
          timeVisible: true,
        },
      }
    }
    lineSeries={[{
      data: priceHistory,
      options: {
        priceFormat: {
          type: 'price',
          precision: chartPrecision,
          minMove: minMove,
        },
      }
    }]}
  >
  </Chart>
}