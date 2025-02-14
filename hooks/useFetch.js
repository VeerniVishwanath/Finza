import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const useFetch = (cb) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  async function fn(...args) {
    setLoading(true);
    const toastId = toast.loading(
      <>
        <LoaderCircleIcon className="animate-spin mr-2" />
        <span>Processing request</span>
      </>
    );

    try {
      const res = await cb(...args);
      setData(res);
      toast.success("Success", { id: toastId });
    } catch (error) {
      setError(error);
      toast.error(error.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return { data, fn, loading, error };
};
