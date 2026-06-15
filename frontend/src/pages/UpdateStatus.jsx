// import React, { useState } from "react";
// import CommonTable from "../components/CommonTable";

// const UpdateStatus = () => {
//   const [orders, setOrders] = useState([
//     {
//       id: "#ORD201",
//       customer: "Rahul Patel",
//       deliveryBoy: "Amit Verma",
//       status: "Assigned",
//     },
//     {
//       id: "#ORD202",
//       customer: "Neha Sharma",
//       deliveryBoy: "Amit Verma",
//       status: "Out for Delivery",
//     },
//     {
//       id: "#ORD203",
//       customer: "Priya Mehta",
//       deliveryBoy: "Ravi Kumar",
//       status: "Delivered",
//     },
//   ]);

//   const handleStatusChange = (id, newStatus) => {
//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === id ? { ...order, status: newStatus } : order
//       )
//     );
//   };

//   const columns = [
//     { accessorKey: "id", header: "Order ID" },
//     { accessorKey: "customer", header: "Customer" },
//     { accessorKey: "deliveryBoy", header: "Delivery Boy" },
//     {
//       accessorKey: "status",
//       header: "Status",
//       Cell: ({ row }) => {
//         const order = row.original;
//         return (
//           <select
//             className="form-select form-select-sm"
//             value={order.status}
//             onChange={(e) =>
//               handleStatusChange(order.id, e.target.value)
//             }
//           >
//             <option value="Assigned">Assigned</option>
//             <option value="Out for Delivery">Out for Delivery</option>
//             <option value="Delivered">Delivered</option>
//             <option value="Cancelled">Cancelled</option>
//           </select>
//         );
//       },
//     },
//     {
//       header: "Action",
//       Cell: () => (
//         <button className="btn btn-sm btn-success">
//           Update
//         </button>
//       ),
//     },
//   ];

//   return (
//     <div className="container-fluid mt-5 pt-5">
//       <br /><br /><br /><br />
//       {/* <div className="card shadow-sm">
//         <div className="card-header bg-primary text-white">
//           <h4 className="mb-0">Update Order Status</h4>
//         </div> */}

//         <div className="card-body p-0">
//           <CommonTable columns={columns} data={orders} />
//         </div>

//         {/* <div className="card-footer text-center">
//           Total Orders: {orders.length}
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default UpdateStatus;