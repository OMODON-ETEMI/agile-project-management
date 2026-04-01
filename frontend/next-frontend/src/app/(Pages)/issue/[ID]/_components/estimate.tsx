import React, { useState, useEffect } from 'react';
import { Clock, BarChart } from 'lucide-react';
import { Issue, Project, TimeUnit, User } from '@/src/helpers/type';
import Select from '@/src/component/select';
import { UpdateProjects } from '@/src/helpers/getData';


// Interface for the API response (adjust as needed)
interface EstimateResponse {
  issue: Project | Issue;
  currentUser: User;
}

const TimeEstimateTracker: React.FC<EstimateResponse> = ({issue, currentUser}) => {
  // State for the estimate value and unit
  const [estimate, setEstimate] = useState<number>(issue.estimate?.estimate || 5);
  const [unit, setUnit] = useState<string>(issue.estimate.unit);

  // State for tracking API response and progress
//   const [apiResponse, setApiResponse] = useState<EstimateResponse | null>(null);
//   const [progress, setProgress] = useState<number>(0);

  // Simulate progress update over time
  useEffect(() => {
    if (estimate >= 100) return;

    const interval = setInterval(() => {
      setEstimate(prev => Math.min(prev + 1, 100)); // Increment progress by 1% per second
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [estimate, unit]);

  // Handler for estimate input
  const handleEstimateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEstimate(isNaN(value) ? 0 : value);
  };

  // Handler for unit selection
  const handleUnitChange = ( selectedUnit: string | number | (string | number)[]) => {
    setUnit(selectedUnit as TimeUnit);
  };


  // API call function (mock implementation)
  const updateEstimate = async () => {
    const update = {
        estimate : estimate,
        unit : unit,
        ID: issue._id,
        user_id: currentUser.user_id
    }
    try {
        await UpdateProjects(update);
      } catch (error) {
        console.log('Error: ', error);
      }
  };


  const unitOptions = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-grow">
          <input
            type="number"
            value={estimate || ''}
            onChange={handleEstimateChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter estimate"
          />
        </div>
        <div>
          <Select 
            value={unit} 
            onChange={handleUnitChange}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            options={unitOptions}
          />
        </div>
      </div>

      <button 
        onClick={updateEstimate}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300 mb-4"
      >
        Update Estimate
      </button>

      {/* Progress Visualization */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${estimate}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>0%</span>
        <span>Remaining Time</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default TimeEstimateTracker;