"use client";

import { useEffect, useRef, useState } from "react";

export interface DataTableColumn {
  title: string;
  data: string;
  render?: (data: unknown, type: string, row: unknown) => string | number | undefined;
  className?: string;
  orderable?: boolean;
}

interface DataTableComponentProps {
  columns: DataTableColumn[];
  data: unknown[];
  options?: Record<string, unknown>;
}

export function DataTableComponent({ columns, data, options }: DataTableComponentProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataTableRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !tableRef.current) return;

    const initDataTable = async () => {
      const DataTableLib = (await import("datatables.net-dt")).default;
      await import("datatables.net-responsive-dt");

      if (!tableRef.current) return;

      dataTableRef.current = new DataTableLib(tableRef.current, {
        columns,
        data,
        responsive: true,
        order: [],
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        renderer: "bootstrap",
        ...options,
      });
    };

    initDataTable();

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [columns, data, options, isMounted]);

  useEffect(() => {
    if (dataTableRef.current && data.length > 0) {
      dataTableRef.current.clear();
      dataTableRef.current.rows.add(data);
      dataTableRef.current.draw();
    }
  }, [data]);

  if (!isMounted) {
    return (
      <table className="display" style={{ width: "100%" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.data} className={col.className}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} style={{ textAlign: "center", color: "var(--muted)" }}>
              Loading...
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table ref={tableRef} className="display" style={{ width: "100%" }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.data} className={col.className}>
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody />
    </table>
  );
}
