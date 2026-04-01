"use client";

import { useQuery } from "@tanstack/react-query";

export function TestQuery() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      console.log("🔴 TEST QUERY FN EXECUTING");
      return { message: "Success" };
    },
    enabled: true,
  });

  console.log("🟡 TEST QUERY RENDER:", { data, isLoading, error });

  return (
    <div>
      <h3>Test Query</h3>
      <p>Loading: {isLoading ? "yes" : "no"}</p>
      <p>Data: {JSON.stringify(data)}</p>
    </div>
  );
}
