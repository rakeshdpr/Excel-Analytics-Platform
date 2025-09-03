import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Points, PointMaterial } from '@react-three/drei';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChartData } from '../../store/slices/analyticsSlice';
import { Box, RotateCcw, ZoomIn } from 'lucide-react';

// 3D Scatter Plot Component
const ScatterPlot3D = ({ data, xAxis, yAxis, zAxis }) => {
  const meshRef = useRef();
  const pointsRef = useRef();

  // Normalize data to fit in 3D space
  const normalizedData = useMemo(() => {
    if (!data.length) return [];
    
    const xValues = data.map(d => d.x).filter(x => typeof x === 'number');
    const yValues = data.map(d => d.y).filter(y => typeof y === 'number');
    const zValues = data.map(d => d.z).filter(z => typeof z === 'number');
    
    if (xValues.length === 0 || yValues.length === 0 || zValues.length === 0) return [];
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const zRange = zMax - zMin;
    const maxRange = Math.max(xRange, yRange, zRange);
    
    return data.map(d => ({
      x: xRange > 0 ? ((d.x - xMin) / maxRange) * 10 - 5 : 0,
      y: yRange > 0 ? ((d.y - yMin) / maxRange) * 10 - 5 : 0,
      z: zRange > 0 ? ((d.z - zMin) / maxRange) * 10 - 5 : 0,
      original: d
    }));
  }, [data]);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  if (!normalizedData.length) {
    return (
      <group>
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="gray"
          anchorX="center"
          anchorY="middle"
        >
          No 3D data available
        </Text>
      </group>
    );
  }

  return (
    <group ref={meshRef}>
      {/* 3D Points */}
      <Points ref={pointsRef} positions={normalizedData.flatMap(d => [d.x, d.y, d.z])}>
        <PointMaterial
          transparent
          vertexColors
          size={0.1}
          sizeAttenuation={true}
          color="#4f46e5"
        />
      </Points>
      
      {/* Axis Labels */}
      <Text
        position={[6, 0, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {xAxis}
      </Text>
      <Text
        position={[0, 6, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {yAxis}
      </Text>
      <Text
        position={[0, 0, 6]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {zAxis}
      </Text>
      
      {/* Grid Lines */}
      <gridHelper args={[10, 10, '#374151', '#1f2937']} />
      
      {/* Center Point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
};

// 3D Bar Chart Component
const BarChart3D = ({ data, xAxis, yAxis, zAxis }) => {
  const meshRef = useRef();

  const normalizedData = useMemo(() => {
    if (!data.length) return [];
    
    const xValues = data.map(d => d.x).filter(x => typeof x === 'number');
    const yValues = data.map(d => d.y).filter(y => typeof y === 'number');
    
    if (xValues.length === 0 || yValues.length === 0) return [];
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const maxRange = Math.max(xRange, yRange);
    
    return data.map((d, index) => ({
      x: xRange > 0 ? ((d.x - xMin) / maxRange) * 8 - 4 : (index / data.length) * 8 - 4,
      y: yRange > 0 ? ((d.y - yMin) / maxRange) * 4 : 0,
      z: 0,
      original: d
    }));
  }, [data]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  if (!normalizedData.length) {
    return (
      <group>
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="gray"
          anchorX="center"
          anchorY="middle"
        >
          No 3D bar data available
        </Text>
      </group>
    );
  }

  return (
    <group ref={meshRef}>
      {/* 3D Bars */}
      {normalizedData.map((d, index) => (
        <mesh key={index} position={[d.x, d.y / 2, d.z]}>
          <boxGeometry args={[0.3, d.y, 0.3]} />
          <meshStandardMaterial 
            color={`hsl(${(index * 137.5) % 360}, 70%, 60%)`}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* Grid */}
      <gridHelper args={[10, 10, '#374151', '#1f2937']} />
      
      {/* Labels */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {yAxis}
      </Text>
      <Text
        position={[0, 0, 5]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {xAxis}
      </Text>
    </group>
  );
};

const Chart3D = ({ fileId, sheetName, chartType, xAxis, yAxis, zAxis, onChartUpdate }) => {
  const dispatch = useDispatch();
  const { chartData, loading, error } = useSelector(state => state.analytics);

  useEffect(() => {
    if (fileId && sheetName && xAxis && yAxis && (chartType === '3d-scatter' || chartType === '3d-bar')) {
      dispatch(fetchChartData({ fileId, sheetName, chartType, xAxis, yAxis }));
    }
  }, [dispatch, fileId, sheetName, chartType, xAxis, yAxis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">Error loading 3D chart</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 text-center">
                     <Box className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">No 3D data to display</p>
          <p className="text-sm">Please select axes and chart type to view 3D data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="h-96 w-full bg-gray-900 rounded-lg overflow-hidden">
        <Canvas
          camera={{ position: [10, 10, 10], fov: 75 }}
          style={{ background: '#111827' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {chartType === '3d-scatter' && (
            <ScatterPlot3D 
              data={chartData} 
              xAxis={xAxis} 
              yAxis={yAxis} 
              zAxis={zAxis || 'Z'} 
            />
          )}
          
          {chartType === '3d-bar' && (
            <BarChart3D 
              data={chartData} 
              xAxis={xAxis} 
              yAxis={yAxis} 
              zAxis={zAxis || 'Z'} 
            />
          )}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>
      
      {/* Controls */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <RotateCcw className="h-4 w-4" />
          <span>Drag to rotate</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ZoomIn className="h-4 w-4" />
          <span>Scroll to zoom</span>
        </div>
      </div>
      
      {chartData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Displaying {chartData.length} data points in 3D space</p>
          <p>X: {xAxis} | Y: {yAxis} | Z: {zAxis || 'Auto'}</p>
        </div>
      )}
    </div>
  );
};

export default Chart3D;
