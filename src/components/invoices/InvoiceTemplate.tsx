interface InvoiceTemplateProps {
  invoice: {
    invoiceNumber: string;
    property: {
      title: string;
      price: number;
    };
    amount: number;
    date: string;
    paymentMethods: Array<{
      type: string;
      details: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        reference: string;
      }
    }>;
  }
}

export const InvoiceTemplate = ({ invoice }: InvoiceTemplateProps) => {
  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Onlyif - Payment Receipt</h1>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2"><span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}</p>
          <p className="mb-2"><span className="font-medium">Property:</span> {invoice.property.title}</p>
          <p className="mb-2"><span className="font-medium">Amount:</span> ${invoice.amount.toFixed(2)}</p>
          <p className="mb-4"><span className="font-medium">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
          
          {/* Payment Details Section with Agent Account Number */}
          {invoice.paymentMethods && invoice.paymentMethods.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h2 className="font-semibold text-lg mb-3">Payment Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Bank Name:</span> {invoice.paymentMethods[0]?.details.bankName}</p>
                <p><span className="font-medium">Account Name:</span> {invoice.paymentMethods[0]?.details.accountName}</p>
                <p><span className="font-medium">Account Number:</span> {invoice.paymentMethods[0]?.details.accountNumber || '—'}</p>
                <p><span className="font-medium">Payment Reference:</span> {invoice.paymentMethods[0]?.details.reference}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
