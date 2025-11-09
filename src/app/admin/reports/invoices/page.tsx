"use client";
import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/reusable/Button";
import Input from "@/components/reusable/Input";

interface InvoiceRow {
  _id: string;
  invoiceNumber: string;
  category?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  dueDate: string;
  property?: { title?: string };
  agent?: { name?: string };
  seller?: { name?: string };
}

export default function AdminInvoiceReportsPage() {
  const [query, setQuery] = useState({
    from: "",
    to: "",
    propertyId: "",
    agentId: "",
    sellerId: "",
    status: "",
    category: "",
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [total, setTotal] = useState(0);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) p.append(k, String(v));
    });
    return p.toString();
  }, [query]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const res = await fetch(`${backendUrl}/api/admin/invoices?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRows((data?.data?.invoices || []) as InvoiceRow[]);
      setTotal(data?.data?.pagination?.total || 0);
    } catch (e) {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCsv = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const res = await fetch(`${backendUrl}/api/admin/invoices/export?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoice Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div>
          <label className="block text-xs text-gray-500">From</label>
          <input type="date" className="w-full border rounded px-2 py-1" value={query.from} onChange={(e)=>setQuery({...query, from:e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">To</label>
          <input type="date" className="w-full border rounded px-2 py-1" value={query.to} onChange={(e)=>setQuery({...query, to:e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Property ID</label>
          <input className="w-full border rounded px-2 py-1" value={query.propertyId} onChange={(e)=>setQuery({...query, propertyId:e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Agent ID</label>
          <input className="w-full border rounded px-2 py-1" value={query.agentId} onChange={(e)=>setQuery({...query, agentId:e.target.value})} />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Seller ID</label>
          <input className="w-full border rounded px-2 py-1" value={query.sellerId} onChange={(e)=>setQuery({...query, sellerId:e.target.value})} />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={fetchData} className="px-4 py-2">Filter</Button>
          <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2">Invoice</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-left px-4 py-2">Amount (A$)</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Property</th>
                <th className="text-left px-4 py-2">Agent</th>
                <th className="text-left px-4 py-2">Seller</th>
                <th className="text-left px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-6" colSpan={8}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="px-4 py-6 text-gray-500" colSpan={8}>No invoices found</td></tr>
              ) : rows.map((r)=> (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-2">{r.invoiceNumber}</td>
                  <td className="px-4 py-2">{r.category || ''}</td>
                  <td className="px-4 py-2">{(r.totalAmount||0).toLocaleString('en-AU')}</td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2">{r.property?.title || ''}</td>
                  <td className="px-4 py-2">{r.agent?.name || ''}</td>
                  <td className="px-4 py-2">{r.seller?.name || ''}</td>
                  <td className="px-4 py-2">{new Date(r.createdAt).toLocaleDateString('en-AU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
