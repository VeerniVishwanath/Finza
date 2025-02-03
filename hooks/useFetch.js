import { useState } from "react";
import { toast } from "sonner";

export const useFetch = (cb) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    const toastId = toast.loading("processing...");

    try {
      const res = await cb(...args);
      setData(res.data);
      toast.success("Successful", { id: toastId });
      setError(null);
    } catch (error) {
      toast.error(error.message, { id: toastId });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};
