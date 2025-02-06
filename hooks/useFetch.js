import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useFetch = (cb, queryKeyToInvalidate) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (...args) => {
      await cb(...args);
    },

    onMutate: () => {
      const toastId = toast.loading("Processing Request");
      return { toastId };
    },

    onSuccess: (data, variables, context) => {
      toast.success("Successful", { id: context?.toastId });
      queryClient.invalidateQueries(queryKeyToInvalidate);
    },

    onError: (error, variables, context) => {
      toast.error(error.message, { id: context?.toastId });
    },
  });

  return {
    data: mutation.data,
    error: mutation.error,
    loading: mutation.isPending,
    fn: mutation.mutate,
  };
};
