'use client'
import React from "react";
import { DataTableHelpForm } from "./data-table";

export default function AdminPage() {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 mt-8 justify-start w-full px-2">
      <DataTableHelpForm />
    </div>
  );
}