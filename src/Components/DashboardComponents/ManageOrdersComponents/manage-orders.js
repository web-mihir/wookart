import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import OrderPaymentInfoModal from './OrderPaymentInfoModal';
import OrderDetailsModal from './OrderDetailsModal';
import OrderLabelModal from './OrderLabelModal';
import OrderTable from './OrderTable';
import { useOrder } from '@/lib/OrderProvider';
import Spinner from '@/Components/Shared/Spinner/Spinner';
import { useAuthContext } from '@/lib/AuthProvider';



const ManageOrders = () => {
   const router = useRouter();
   const { userInfo, setMessage } = useAuthContext();
   const { orders, orderRefetch, orderLoading, viewController } = useOrder();
   const [openModal, setOpenModal] = useState(false);
   const [openOrderPaymentInfo, setOpenOrderPaymentInfo] = useState(false);
   const [labelModal, setLabelModal] = useState(false);
   const [pendingOrders, setPendingOrders] = useState([]);
   const [dispatchOrder, setDispatchOrder] = useState([]);
   const [shipOrder, setShipOrder] = useState([]);
   const [showOrders, setShowOrders] = useState("placed");
   const viewMode = new URLSearchParams(window && window.location.search).get("view");

   // Filtering orders by status

   useEffect(() => {
      if (orders) {
         setPendingOrders(orders.filter(odr => odr?.orderStatus === "pending").reverse());
         setDispatchOrder(orders.filter(odr => odr?.orderStatus === "dispatch").reverse())
         setShipOrder(orders.filter(odr => odr?.orderStatus === "shipped").reverse());
      }
   }, [orders]);

   // function view(params) {
   //    viewController(params);
   //    router.replace('/dashboard/manage-orders?view=' + params);
   // }


   return (
      <div className='section_default'>
         <div className="container">
            <h5 className="pb-1">
               All Orders
            </h5>
            <div className="headers">
               <button onClick={() => setShowOrders("placed")} className={`hBtn ${showOrders === "placed" ? "active" : ""}`}>
                  Placed Orders ({pendingOrders.length})
               </button>
               <button onClick={() => setShowOrders("process")} className={`hBtn ${showOrders === "process" ? "active" : ""}`}>
                  On Processing ({dispatchOrder.length})
               </button>
               <button onClick={() => setShowOrders("shipped")} className={`hBtn ${showOrders === "shipped" ? "active" : ""}`}>
                  Shipped
               </button>
            </div>

            {/* <div className="py-2">
               View As : <button className='bt9_edit' onClick={() => view("group")}>
                  Group
               </button>
               &nbsp;
               <button className='bt9_edit' onClick={() => view("single")}>
                  Single List
               </button>
            </div> */}

            <div className="row">

               {
                  <div className="col-lg-12 mb-4 p-3">
         
                        <div className="py-1">
                           {
                              orderLoading ? <Spinner /> :
                                 <OrderTable
                                    setMessage={setMessage}
                                    orderRefetch={orderRefetch}
                                    orders={orders ? orders : []}
                                    setOpenModal={setOpenModal}
                                    setLabelModal={setLabelModal}
                                    setOpenOrderPaymentInfo={setOpenOrderPaymentInfo}
                                    userInfo={userInfo}
                                 />
                           }
                        </div>
              
                  </div>
               }

               {
                  showOrders === "process" &&
                  <div className="col-lg-12  mb-4 p-3">
                     <div className='card_default card_description'>
                        {
                           dispatchOrder.length > 0 ? <>
                              <h6>Ready To Ship ({dispatchOrder.length})</h6>
                              <div className="py-1">
                                 <OrderTable
                                    orderList={dispatchOrder}
                                    setOpenModal={setOpenModal}
                                 />
                              </div>
                           </> : "No orders"

                        }

                     </div>
                  </div>
               }

               {showOrders === "shipped" && <div className="col-lg-12">
                  <div className="card_default card_description">
                     <h6>Shipped Orders ({shipOrder.length})</h6>
                     <div className="py-1" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {
                           orderLoading ? <Spinner /> : shipOrder.length > 0 ?
                              <OrderTable
                                 orderList={shipOrder}
                                 setOpenModal={setOpenModal}
                              /> : <i className='text-muted'>No shipped orders</i>
                        }
                     </div>
                  </div>
               </div>
               }

            </div>
         </div>

         {
            openOrderPaymentInfo && <OrderPaymentInfoModal
               orderRefetch={orderRefetch}
               data={openOrderPaymentInfo}
               closeModal={() => setOpenOrderPaymentInfo(false)}
            />
         }

         {
            openModal && <OrderDetailsModal
               data={openModal}
               closeModal={() => setOpenModal(false)}
            ></OrderDetailsModal>
         }

         {labelModal && <OrderLabelModal
            data={labelModal}
            userInfo={userInfo}
            closeModal={() => setLabelModal(false)}
         ></OrderLabelModal>
         }
      </div >
   );
};

export default ManageOrders;