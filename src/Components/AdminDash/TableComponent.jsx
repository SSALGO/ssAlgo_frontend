

// import React, { useState } from "react";
// import PropTypes from "prop-types";
// import UpdateForm from "./UpdateForm";

// const TableComponent = ({
//   title,
//   description,
//   columns,
//   data,
//   onUpdate,
//   onDelete,
//   onEdit,
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10;
//   const [showUpdateForm, setShowUpdateForm] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [isEditing, setIsEditing] = useState("");

//   const indexOfLastRow = currentPage * rowsPerPage;
//   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
//   const currentRows = Array.isArray(data)
//     ? data.slice(indexOfFirstRow, indexOfLastRow)
//     : [];

//   const pageNumbers = [];
//   for (let i = 1; i <= Math.ceil(data.length / rowsPerPage); i++) {
//     pageNumbers.push(i);
//   }

//   const handleClick = (event, pageNumber) => {
//     event.preventDefault();
//     setCurrentPage(pageNumber);
//   };

//   const handleUpdateClick = (row) => {
//     setIsEditing(title);
//     setSelectedRow(row);
//     setShowUpdateForm(true);
//   };

//   const handleUpdateSubmit = (updatedData) => {
//     onUpdate({ updatedData, isEditing });
//     setShowUpdateForm(false);
//     setSelectedRow(null);
//   };

//   const handleUpdateCancel = () => {
//     setShowUpdateForm(false);
//     setSelectedRow(null);
//   };

//   const getUpdateFields = () => {
//     switch (title) {
//       case "User Management":
//         return {
//           title: "User",
//           inputs: [
//             {
//               name: "username",
//               label: "User Name",
//               type: "text",
//               icon: "/user.svg",
//               img: "/userimg.svg",
//             },
//             {
//               name: "email",
//               label: "Email Address",
//               type: "email",
//               icon: "/email.svg",
//             },
//             {
//               name: "mobile",
//               label: "Mobile Number",
//               type: "tel",
//               icon: "/call.svg",
//             },
//           ],
//         };
//       case "Subscriptions":
//         return {
//           title: "Subscription",
//           inputs: [
//             {
//               name: "user",
//               label: "User Name",
//               type: "text",
//               icon: "/user.svg",
//               img: "/sub.svg",
//             },
//             {
//               name: "start",
//               label: "Start Date",
//               type: "date",
//               icon: "/date.svg",
//             },
//             { name: "end", label: "End Date", type: "date", icon: "/date.svg" },
//             {
//               name: "subtype",
//               label: "Subscription Type",
//               type: "text",
//               icon: "/date.svg",
//             },
//           ],
//         };
//       case "API Management":
//         return {
//           title: "API",
//           inputs: [
//             {
//               name: "apikey",
//               label: "API Key",
//               type: "text",
//               icon: "/api1.svg",
//               img: "/apiimg.svg",
//             },
//             {
//               name: "apisecret",
//               label: "API Secret",
//               type: "text",
//               icon: "/secret.svg",
//             },
//             {
//               name: "user",
//               label: "User Name",
//               type: "text",
//               icon: "/user.svg",
//             },
//           ],
//         };
//       default:
//         return { title: "", inputs: [] };
//     }
//   };

//   return (
//     <div className="mx-auto py-4  px-6 max-lg:px-3  ">
//       {showUpdateForm && isEditing === title ? (
//         <UpdateForm
//           initialData={selectedRow}
//           fields={getUpdateFields()}
//           onSubmit={handleUpdateSubmit}
//           onCancel={handleUpdateCancel}
//         />
//       ) : (
//         <div>
//           <h1 className="text-2xl font-bold text-[#0A1438] max-lg:mt-14">
//             Admin Dashboard{" "}
//           </h1>
//           <p className="font-medium mt-1 text-sm text-[#4B5675]">
//             {description}{" "}
//           </p>
//           <h2 className="text-2xl text-[#0A1438] font-bold mt-3 mb-6">
//             {title}
//           </h2>
//           <div className=" bg-white  rounded-lg overflow-x-auto">
//             <table className="w-full border-2">
//               <thead>
//                   <tr className="text-[#79829E] text-sm">
//                   <th className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2">
//                     Action
//                   </th>
//                   {columns.map((column, index) => (
//                     <th
//                       key={index}
//                       className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-r-2 border-b-2 text-nowrap"
//                     >
//                       {column.header}
//                     </th>
//                   ))}
//                   {/* <th className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2">
//                     Action
//                   </th> */}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-dashed">
//                 {currentRows.map((row, rowIndex) => (
//                   <tr key={rowIndex}>
//                     <td className="px-5 max-lg:px-2 max-lg:py-2 py-3 whitespace-nowrap text-sm max-sm:text-[12px] font-medium">
//                       {onEdit && (
//                         <button
//                           onClick={() => handleUpdateClick(row)}
//                           className="text-white bg-[#F1BF00] hover:bg-yellow-600 px-4 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-2"
//                         >
//                           Edit
//                         </button>
//                       )}
//                       {onUpdate && (
//                         <button
//                           onClick={() => handleUpdateClick(row)}
//                           className="text-white bg-[#3985FF] hover:bg-blue-600 px-4 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-1"
//                         >
//                           Update
//                         </button>
//                       )}
//                       {onDelete && (
//                         <button
//                           onClick={() => onDelete(row)}
//                           className="text-white bg-[#EE2358] hover:bg-red-600 px-2  py-1 max-md:py-[2px] rounded"
//                         >
//                           Delete
//                         </button>
//                       )}
//                     </td>
//                     {columns.map((column, colIndex) => (
//                       <td
//                         key={colIndex}
//                         className="px-5 max-lg:px-2 max-lg:py-2 py-3  max-md:text-[12px] whitespace-nowrap font-medium text-sm text-[#252F4A] text-wrap"
//                       >
//                         {row[column.key]}
//                       </td>
//                     ))}
//                     {/* <td className="px-5 max-lg:px-2 max-lg:py-2 py-3 whitespace-nowrap text-sm max-sm:text-[12px] font-medium">
//                       {onEdit && (
//                         <button onClick={() => handleUpdateClick(row)} className="text-white bg-[#F1BF00] hover:bg-yellow-600 px-4 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-2">
//                           Edit
//                         </button>
//                       )}
//                       {onUpdate && (
//                         <button onClick={() => handleUpdateClick(row)} className="text-white bg-[#3985FF] hover:bg-blue-600 px-4 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-1">
//                           Update
//                         </button>
//                       )}
//                       {onDelete && (
//                         <button onClick={() => onDelete(row)} className="text-white bg-[#EE2358] hover:bg-red-600 px-2  py-1 max-md:py-[2px] rounded">
//                           Delete
//                         </button>
//                       )}
//                     </td> */}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// TableComponent.defaultProps = {
//   data: [],
//   columns: [],
// };

// TableComponent.propTypes = {
//   title: PropTypes.string.isRequired,
//   description: PropTypes.string,
//   columns: PropTypes.array.isRequired,
//   data: PropTypes.array.isRequired,
//   onUpdate: PropTypes.func,
//   onDelete: PropTypes.func,
//   onEdit: PropTypes.func,
// };

// export default TableComponent;


import React, { useState } from "react";
import PropTypes from "prop-types";
import UpdateForm from "./UpdateForm";
import { displayValue } from '../../utils/displayValue';
import { EmptyState, StatusBadge } from "../../shared/components/TradingUi";

const TableComponent = ({
  title,
  description,
  columns,
  data,
  onUpdate,
  onDelete,
  onEdit,
}) => {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isEditing, setIsEditing] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const handleUpdateClick = (row) => {
    setIsEditing(title);
    setSelectedRow(row);
    setShowUpdateForm(true);
  };

  const handleUpdateSubmit = (updatedData) => {
    onUpdate({ updatedData, isEditing });
    setShowUpdateForm(false);
    setSelectedRow(null);
  };

  const handleUpdateCancel = () => {
    setShowUpdateForm(false);
    setSelectedRow(null);
  };

  const getUpdateFields = () => {
    switch (title) {
      case "User Management":
        return {
          title: "User",
          inputs: [
            {
              name: "username",
              label: "User Name",
              type: "text",
              icon: "/user.svg",
              img: "/userimg.svg",
            },
            {
              name: "email",
              label: "Email Address",
              type: "email",
              icon: "/email.svg",
            },
            {
              name: "mobile",
              label: "Mobile Number",
              type: "tel",
              icon: "/call.svg",
            },
            {
              name: "StrategyLimit",
              label: "User Limit",
              type: "number",
              icon: "/user.svg",
              
            }
          ],
        };
      case "Subscriptions":
        return {
          title: "Subscription",
          inputs: [
            {
              name: "user",
              label: "User Name",
              type: "text",
              icon: "/user.svg",
              img: "/sub.svg",
            },
            {
              name: "start",
              label: "Start Date",
              type: "date",
              icon: "/date.svg",
            },
            { name: "end", label: "End Date", type: "date", icon: "/date.svg" },
            {
              name: "subtype",
              label: "Subscription Type",
              type: "text",
              icon: "/date.svg",
            },
          ],
        };
      case "API Management":
        return {
          title: "API",
          inputs: [
            {
              name: "apikey",
              label: "API Key",
              type: "text",
              icon: "/api1.svg",
              img: "/apiimg.svg",
            },
            {
              name: "apisecret",
              label: "API Secret",
              type: "text",
              icon: "/secret.svg",
            },
            {
              name: "user",
              label: "User Name",
              type: "text",
              icon: "/user.svg",
            },
          ],
        };
      default:
        return { title: "", inputs: [] };
    }
  };

  const filteredData = data.filter((row) =>
    columns.some((column) =>
      String(row[column.key] ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const currentRows = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const maskIfSecret = (column, value) => {
    const key = String(column.key || "").toLowerCase();
    if (key.includes("secret") || key.includes("apikey") || key.includes("token")) {
      return value ? "********" : "";
    }
    return displayValue(value);
  };

  return (
    <div className="mx-auto py-4 px-6 max-lg:px-3">
      {showUpdateForm && isEditing === title ? (
        <UpdateForm
          initialData={selectedRow}
          fields={getUpdateFields()}
          onSubmit={handleUpdateSubmit}
          onCancel={handleUpdateCancel}
        />
      ) : (
        <div className="uppercase">
          <h1 className=" text-2xl font-bold text-[#0A1438] max-lg:mt-14">
            Admin Dashboard{" "}
          </h1>
          <p className="font-medium mt-1 text-sm text-[#4B5675]">
            {description}{" "}
          </p>
          <h2 className="text-2xl text-[#0A1438] font-bold mt-3 mb-6">
            {title}
          </h2>

          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full"
            />
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold text-[#79829E]">Rows</p>
              <p className="text-xl font-bold text-[#0A1438]">{filteredData.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold text-[#79829E]">User status</p>
              <StatusBadge value="Visible in table" tone="ready" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold text-[#79829E]">Broker status</p>
              <StatusBadge value="API placeholder" tone="warning" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold text-[#79829E]">Audit actions</p>
              <StatusBadge value="API not ready" tone="warning" />
            </div>
          </div>

          {currentRows.length === 0 ? (
            <EmptyState title="No rows found" description="Adjust the search filter or wait for admin API data to load." />
          ) : (
          <div className="bg-white rounded-lg overflow-x-auto">
            <table className="w-full border-2">
              <thead>
                <tr className="text-[#79829E] text-sm">
                  <th className="px-5 max-lg:px-2 max-lg:py-2 py-3 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-b-2">
                    Action
                  </th>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-5 max-lg:px-2 max-lg:py-2 py-3 max-md:text-[12px] font-medium text-sm text-left text-[#79829E] border-r-2 border-b-2 text-nowrap"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed">
                {currentRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="px-5 max-lg:px-2 max-lg:py-2 py-3 whitespace-nowrap text-sm max-sm:text-[12px] font-medium">
                      {onEdit && (
                        <button
                          onClick={() => handleUpdateClick(row)}
                          className="text-white bg-[#F1BF00] hover:bg-yellow-600 px-4 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-2"
                        >
                          Edit
                        </button>
                      )}
                      {onUpdate && (
                        <button
                          onClick={() => handleUpdateClick(row)}
                          className="text-white bg-[#3985FF] hover:bg-blue-600 px-4 max-lg:px-2 py-1 max-md:py-[2px] rounded mr-1"
                        >
                          Update
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-white bg-[#EE2358] hover:bg-red-600 px-2 py-1 max-md:py-[2px] rounded"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-5 max-lg:px-2 max-lg:py-2 py-3 max-md:text-[12px] whitespace-nowrap font-medium text-sm text-[#252F4A] text-wrap"
                      >
                        {maskIfSecret(column, row[column.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm normal-case text-[#4B5675]">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-50">
                Previous
              </button>
              <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-md border px-3 py-2 text-sm font-semibold disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TableComponent.defaultProps = {
  data: [],
  columns: [],
};

TableComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

export default TableComponent;
