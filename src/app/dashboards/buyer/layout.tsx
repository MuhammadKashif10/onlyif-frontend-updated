import Footer from '@/components/layout/Footer';

// The buyer dashboard renders its own footer here (instead of AppReadyShell)
// and wraps it in lg:pl-[280px] so the global green footer sits past the
// fixed BuyerSidebar instead of collapsing underneath it.
export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div className="lg:pl-[280px]">
        <Footer />
      </div>
    </>
  );
}
