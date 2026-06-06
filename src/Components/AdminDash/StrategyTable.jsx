
import React from 'react';

const StrategyTable = ({ data, onStart, onStop, onModify, onDelete }) => {
  // Define the headers you want to display
  const headers = ['Actions', 'Users', 'Time', 'BOT', 'Strategy', 'Symbol', 'TF', 'Live', 'LOTS', 'Duration', 'B/S Mode', 'Status'];

  return (
    <div className=" rounded-lg overflow-x-auto  ">
      <table className="w-full ">
        <thead>
          <tr className="text-[#79829E] text-sm rounded-sm">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-5 max-lg:px-2 border-2 max-lg:py-2 py-3 text-nowrap  max-md:text-[12px] font-medium text-sm text-left text-[#79829E]  border-b-2"
              >
                {header} 
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="border-r-2 border-l-2 border-b-2">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-dashed border-gray-200 text-sm">
              <td className="py-3 max-lg:py-2 text-center whitespace-nowrap px-5 max-lg:px-2  ">
                {row.Status === 'Paused' ? (
                  <>
                    <button
                      className="bg-[#43C64C] text-white px-3 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-2 text-[12px]"
                      onClick={() => {
                        onStart(row._id);
                        // console.log('Start:', row);
                      }}
                    >
                      Start
                    </button>
                    <button
                      className="bg-[#3985FF] text-white px-3 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-2 text-[12px]"
                      onClick={() => onModify(row.Data)}
                    >
                      Modify
                    </button>
                    <button
                      className=" bg-[#EE2358] text-white px-3 text-[12px] max-lg:px-2 py-1 max-md:py-[2px] rounded"
                      onClick={() => onDelete(row._id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-[#EE2358] text-white px-3 py-1 rounded mr-2"
                      onClick={() => onStop(row._id)}
                    >
                      Stop
                    </button>
                    <button
                      className="bg-[#3985FF] text-white px-3 py-1 rounded"
                      onClick={() => onModify(row.Data)}
                    >
                      Modify
                    </button>
                  </>
                )}
              </td>
              {headers.slice(1).map((header, colIndex) => (
                <td key={colIndex} className="py-3  max-lg:py-2  text-left px-5 max-lg:px-2 whitespace-nowrap">
                  <span className={`font-medium ${header === 'Status' && row[header] === 'Paused' ? 'text-red-500' : 'text-[#252F4A]'}`}>
                    {row[header]} 
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StrategyTable;

