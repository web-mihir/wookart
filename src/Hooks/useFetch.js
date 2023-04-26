import { CookieParser, deleteAuth } from "@/Functions/common";
import { useEffect, useState } from "react";

export const useFetch = (url, authorization = "") => {
   const [data, setData] = useState();
   const [loading, setLoading] = useState(true);
   const [err, setErr] = useState(null);
   const [ref, setRef] = useState(false);


   useEffect(() => {

      const cookie = CookieParser();

      const fetchData = setTimeout(() => {
         (async () => {
            try {
               if (url && typeof url !== 'undefined') {
                  setLoading(true);

                  const response = await fetch(`${process.env.NEXT_PUBLIC_S_BASE_URL}api/v1${url}`, {
                     withCredentials: true,
                     credentials: 'include',
                     method: "GET",
                     headers: {
                        authorization: `Berar ${cookie?.log_tok ? cookie?.log_tok : ""}`
                     }
                  });

                  if (response.status === 401) {
                     deleteAuth();
                  }

                  const resData = await response.json();

                  if (response.ok) {
                     setLoading(false);
                     setData(resData);
                  } else {
                     setLoading(false);
                  }
               } else {
                  setLoading(false);
               }

            } catch (error) {
               setErr(error);
            } finally {
               setLoading(false);
            }
         })();
      }, 0);
      return () => clearTimeout(fetchData);
   }, [url, authorization, ref]);


   const refetch = () => setRef(e => !e);

   return { data, loading, err, refetch };
}