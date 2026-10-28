"use client"
import GeneralError from "@/components/ui/GeneralError";
import React from "react";
const error = (error, reset) => {
  return <GeneralError error={error} onRetry={reset} />;
};

export default error;
