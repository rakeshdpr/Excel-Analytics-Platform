import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChartData } from '../../store/slices/analyticsSlice';
import { BarChart3 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

const Chart2D = ({ fileId, sheetName, chartType, xAxis, yAxis, onChartUpdate }) => {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [isContainerReady, setIsContainerReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { chartData, loading, error } = useSelector(state => state.analytics);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (fileId && sheetName && xAxis && yAxis && chartType) {
      dispatch(fetchChartData({ fileId, sheetName, chartType, xAxis, yAxis }));
    }
  }, [dispatch, fileId, sheetName, chartType, xAxis, yAxis]);

  useEffect(() => {
    // Cleanup previous chart instance when dependencies change
    return () => {
      if (chartInstance) {
        try {
          chartInstance.destroy();
        } catch (error) {
          console.warn('Error destroying chart instance:', error);
        }
        setChartInstance(null);
      }
    };
  }, [chartType, xAxis, yAxis, chartInstance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstance) {
        try {
          chartInstance.destroy();
        } catch (error) {
          console.warn('Error destroying chart instance on unmount:', error);
        }
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if container is ready
  useEffect(() => {
    if (containerRef.current && isMounted) {
      const checkContainer = () => {
        if (!isMounted) return;

        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setIsContainerReady(true);
        } else {
          // Retry after a short delay
          setTimeout(checkContainer, 100);
        }
      };
      checkContainer();
    }
  }, [chartData, isMounted]);

  const getChartData = () => {
    if (!chartData.length) return { labels: [], datasets: [] };

    switch (chartType) {
      case 'line':
        return {
          labels: chartData.map(item => item.label || item.x),
          datasets: [{
            label: yAxis,
            data: chartData.map(item => item.y),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: false
          }]
        };

      case 'bar':
        return {
          labels: chartData.map(item => item.label || item.x),
          datasets: [{
            label: yAxis,
            data: chartData.map(item => item.y),
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        };

      case 'scatter':
        return {
          datasets: [{
            label: `${xAxis} vs ${yAxis}`,
            data: chartData.map(item => ({
              x: item.x,
              y: item.y
            })),
            backgroundColor: 'rgba(255, 99, 132, 0.8)',
            borderColor: 'rgb(255, 99, 132)',
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        };

      case 'pie':
      case 'doughnut':
        return {
          labels: chartData.map(item => item.label),
          datasets: [{
            data: chartData.map(item => item.value),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
              '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };

      default:
        return { labels: [], datasets: [] };
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: `${chartType.toUpperCase()} Chart: ${xAxis} vs ${yAxis}`
        },
        tooltip: {
          mode: chartType === 'scatter' ? 'nearest' : 'index',
          intersect: false
        }
      },
      scales: chartType === 'scatter' ? {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: xAxis
          }
        },
        y: {
          title: {
            display: true,
            text: yAxis
          }
        }
      } : {
        x: {
          title: {
            display: true,
            text: xAxis
          }
        },
        y: {
          title: {
            display: true,
            text: yAxis
          }
        }
      }
    };

    // Special options for pie/doughnut charts
    if (chartType === 'pie' || chartType === 'doughnut') {
      delete baseOptions.scales;
      baseOptions.plugins.tooltip = {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      };
    }

    return baseOptions;
  };

  const handleChartRef = (ref) => {
    if (ref) {
      setChartInstance(ref);
      chartRef.current = ref;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Error loading chart</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-center">
          <BarChart3 className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">No data to display</p>
          <p className="text-sm">Please select axes and chart type to view data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-96">
      <div ref={containerRef} className="relative h-96 w-full bg-white rounded-lg shadow-sm">
        {isContainerReady ? (
          <Chart
            ref={handleChartRef}
            type={chartType}
            data={getChartData()}
            options={getChartOptions()}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500">Preparing chart...</div>
          </div>
        )}
      </div>
      {/* Download Button */}
      {chartData.length > 0 && chartRef.current && (
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {
              try {
                const chart = chartRef.current;
                if (chart) {
                  // Get the canvas element
                  const canvas = chart.canvas;
                  if (canvas) {
                    // Create download link
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `${chartType}-chart-${Date.now()}.png`;
                    link.click();
                  }
                }
              } catch (error) {
                console.error('Error downloading chart:', error);
              }
            }}
          >
            Download Chart
          </button>
        </div>
      )}
      {chartData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Displaying {chartData.length} data points</p>
          <p>Chart type: {chartType} | X-axis: {xAxis} | Y-axis: {yAxis}</p>
        </div>
      )}
    </div>
  );
};

export default Chart2D;
