// pages/forgot-pwd.js

import { apiHandler } from "@/Functions/common";
import { useAuthContext } from "@/lib/AuthProvider";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ForgotPwdPage() {

   const { setMessage, role } = useAuthContext();

   const [fPWDEmail, setFPWDEmail] = useState(false);

   const [showPwd, setShowPwd] = useState(false);

   let [timer, setTimer] = useState(0);

   const [target, setTarget] = useState([1]);

   const [newPwdForm, setNewPwdForm] = useState({});

   const router = useRouter();

   useEffect(() => {
      if (role) {
         router.push("/");
      }
   }, [role, router]);


   useEffect(() => {
      const dd = setInterval(() => {
         setTimer(p => p - 1)
      }, 1000);

      if (timer === 0) {
         clearInterval(dd);
      }

      return () => clearInterval(dd);
   }, [timer]);

   async function handleForgotPwd(e, cEmail) {
      try {
         e.preventDefault();

         let clientEmail = cEmail || e.target.email.value;

         if (!clientEmail) {
            return setMessage("Required email address or phone number !", "danger");
         }

         const { success, message, email, lifeTime } = await apiHandler("/auth/check-user-authentication", "POST", { email: clientEmail });

         if (success && lifeTime && email) {
            setFPWDEmail(email);
            setTarget([...target, 2]);
            setTimer(lifeTime / 1000);
            setMessage(message, "success");
            return;

         } else {
            return setMessage(message, "danger");
         }

      } catch (error) {
         return setMessage(error?.message, "danger");
      }
   }


   async function securityCodeHandler(e) {
      try {
         e.preventDefault();

         let email = fPWDEmail || "";
         let securityCode = e.target.securityCode.value;

         if (!securityCode) {
            return setMessage("Required security code !", "danger");
         }

         const { success, message, data } = await apiHandler("/auth/check-user-forgot-pwd-security-key", "POST", { securityCode, email });

         if (success && data) {
            setFPWDEmail(false);
            setMessage(message, "success");
            setTarget([...target, 3]);
            setNewPwdForm({ user: data?.email, session: data?.securityCode, life_time: data?.sessionLifeTime });

            return;
         } else {
            return setMessage(message, "danger");
         }

      } catch (error) {
         return setMessage(error?.message, "danger");
      }
   }


   async function handleNewPassword(e) {
      try {
         e.preventDefault();

         let password = e.target.password.value;

         if (!password) {
            return setMessage("Required password !", "danger");
         }

         const { success, message } = await apiHandler("/auth/user/set-new-password", "POST", { email: newPwdForm?.user, password, securityCode: newPwdForm?.session });

         if (success) {
            setMessage(message, "success");

            router.push("/login?email=" + newPwdForm?.user);
         } else {
            return setMessage(message, "danger");
         }
      } catch (error) {
         return setMessage(error?.message, "danger");
      }
   }

   return (
      <div className="section_default">
         <div className="container">
            <h5 className="text-center">Forgot Your Password ?</h5>

            <div className="py-3 w-75 mx-auto" style={{
               height: "100%",
               marginTop: "5rem"
            }}>
               <div className="py-2 target_bar">
                  <span className={target.includes(1) ? "active" : ""}>1</span>
                  <span className={target.includes(2) ? "active" : ""}>2</span>
                  <span className={target.includes(3) ? "active" : ""}>3</span>
               </div>

               {
                  (newPwdForm?.user && target.includes(3)) ? <div className="row">
                     <div className="col-lg-4 mx-auto" style={{
                        boxShadow: "0 0 8px 0 #c5c5c599"
                     }}>
                        <form action="" onSubmit={handleNewPassword} className='text-center p-4'>

                           <div className="input_group">
                              <label htmlFor="password">Password</label>
                              <div style={{ position: 'relative' }}>
                                 <input className='form-control form-control-sm' 
                                 type={showPwd ? "text" : "password"} 
                                 name='password' 
                                 id='password' 
                                 autoComplete='off' 
                                 placeholder="Enter new password..." />
                                 <span style={{
                                    transform: "translateY(-50%)",
                                    position: "absolute",
                                    right: "2%",
                                    top: "50%"
                                 }} className='bt9' onClick={() => setShowPwd(e => !e)}>
                                    {showPwd ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
                                 </span>
                              </div>

                           </div>

                           <button className="bt9_edit w-100" type="submit">Set new password</button>
                        </form>
                     </div>
                  </div> :
                     (fPWDEmail && target.includes(2)) ?
                        <div className="row">

                           <div className="col-lg-4 mx-auto" style={{
                              boxShadow: "0 0 8px 0 #c5c5c599"
                           }}>
                              <form onSubmit={securityCodeHandler} className="p-4">

                                 <div className="input_group">
                                    <label htmlFor="securityCode"> {
                                       timer === 0 ?
                                          <div style={{ color: "red" }}>
                                             <span>Session Expired !</span>
                                             <button className="bt9_primary ms-2" onClick={(e) => handleForgotPwd(e, fPWDEmail)}>Resend</button>
                                          </div>
                                          : <div>
                                             <span>Your Security Code is <b style={{ color: "green" }}>&nbsp;{fPWDEmail}&nbsp;</b> </span>
                                             <br />
                                             <i>Time Remaining <b>{timer}</b> seconds</i>
                                          </div>
                                    }
                                    </label>

                                    <input
                                       type="text"
                                       disabled={timer === 0 ? true : false}
                                       name="securityCode"
                                       id="securityCode"
                                       className="form-control form-control-sm"
                                       autoComplete="off"
                                       defaultValue=""
                                    />
                                 </div>

                                 <button className="bt9_edit w-100" type="submit" disabled={timer === 0 ? true : false}>Verify Security Code</button>
                              </form>

                           </div>
                        </div> :
                        <div className="row">
                           <div className="col-lg-4 mx-auto" style={{
                              boxShadow: "0 0 8px 0 #c5c5c599"
                           }}>
                              <form onSubmit={handleForgotPwd} className='bordered p-4'>
                                 <div className="input_group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                       type="text"
                                       name="email"
                                       id="email"
                                       className="form-control form-control-sm"
                                       placeholder="enter email address..."
                                    />
                                 </div>

                                 <button className="bt9_edit w-100" type="submit">Check Account</button>
                              </form>
                           </div>
                        </div>
               }
            </div>
         </div>
      </div>
   )
}