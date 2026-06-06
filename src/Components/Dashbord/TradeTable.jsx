import React from "react";

const TradesTable = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto rounded-lg border-2">
      <table className="min-w-full">
        <thead>
          <tr className="text-[#79829E] text-sm">
            {columns.map((column, index) => (
              <th
                key={index}
                className="py-3 px-5 max-lg:px-2 font-medium text-sm text-center text-[#79829E] border-b-2 border-r-2 border-gray-300"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-dashed border-gray-200">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="py-3 px-5 max-lg:px-2 text-center whitespace-nowrap border-b-2 border-r-2 border-gray-300"
                >
                  <span
                    className={`font-medium ${
                      column === "PNL"
                        ? row.PNL > 0
                          ? "text-green-500"
                          : row.PNL < 0
                          ? "text-red-500"
                          : ""
                        : "text-[#252F4A]"
                    }`}
                  >
                    {row[column] !== undefined && row[column] !== null
                      ? row[column]
                      : ""}
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

export default TradesTable;
