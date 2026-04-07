'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/reusable';
import { useAuth } from '@/context/AuthContext';

type ModalType = 'buyer' | 'seller' | 'agent' | null;

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, acceptRole, requestAgentRole } = useAuth();

  const [modal, setModal] = useState<ModalType>(null);

  const [buyerChecks, setBuyerChecks] = useState({
    unlockFee: false,
    noBypass: false,
    responsibility: false,
  });

  const [sellerChecks, setSellerChecks] = useState({
    terms: false,
    legalAuthorization: false,
    successFee: false,
    noBypass: false,
    upgrades: false,
    agentPartnerHelp: false,
  });

  const [agentChecks, setAgentChecks] = useState({
    terms: false,
  });

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/signin');
      return;
    }

    if (user.role === 'buyer') {
      router.replace('/dashboards/buyer');
      return;
    }

    if (user.role === 'seller') {
      router.replace('/dashboards/seller');
      return;
    }

    if (user.role === 'agent') {
      router.replace('/dashboards/agent');
      return;
    }

    if (user.role === 'admin') {
      router.replace('/dashboards/admin');
      return;
    }
  }, [isLoading, router, user]);

  const buyerAllChecked = useMemo(
    () => buyerChecks.unlockFee && buyerChecks.noBypass && buyerChecks.responsibility,
    [buyerChecks]
  );

  const sellerAllChecked = useMemo(
    () =>
      sellerChecks.terms &&
      sellerChecks.legalAuthorization &&
      sellerChecks.successFee &&
      sellerChecks.noBypass &&
      sellerChecks.upgrades &&
      sellerChecks.agentPartnerHelp,
    [sellerChecks]
  );

  const agentAllChecked = useMemo(() => agentChecks.terms, [agentChecks]);

  const handleAcceptBuyer = async () => {
    if (!buyerAllChecked) return;
    await acceptRole('buyer');
    router.push('/dashboards/buyer');
  };

  const handleAcceptSeller = async () => {
    if (!sellerAllChecked) return;
    await acceptRole('seller');
    router.push('/dashboards/seller');
  };

  const handleAcceptAgent = async () => {
    if (!agentAllChecked) return;
    try {
      await requestAgentRole();
      router.push('/dashboards/agent');
    } catch (error) {
      console.error('Error requesting agent role:', error);
    }
  };

  if (isLoading || !user || user.role !== null) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Welcome to Only If</h1>
        <p className="mt-3 text-center text-gray-600">
          Choose how you want to use the platform to continue.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => setModal('seller')}
            className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl">🏠</div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">List My Home</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a seller account and list privately.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModal('buyer')}
            className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl">🔍</div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">Browse Homes</h2>
            <p className="mt-2 text-sm text-gray-600">
              Get access to off-market properties.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModal('agent')}
            className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-2xl">🤝</div>
            <h2 className="mt-4 text-lg font-bold text-gray-900">I&apos;m an Agent</h2>
            <p className="mt-2 text-sm text-gray-600">
              Learn how to get started as an agent.
            </p>
          </button>
        </div>
      </main>

      <Dialog open={modal === 'buyer'} onOpenChange={(open) => setModal(open ? 'buyer' : null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Browse Homes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={buyerChecks.unlockFee}
                onChange={(e) => setBuyerChecks((p) => ({ ...p, unlockFee: e.target.checked }))}
              />
              <span>
                I understand the $49 unlock fee is non-refundable and grants access to full listing details.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={buyerChecks.noBypass}
                onChange={(e) => setBuyerChecks((p) => ({ ...p, noBypass: e.target.checked }))}
              />
              <span>I agree not to contact sellers directly or bypass the platform.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={buyerChecks.responsibility}
                onChange={(e) => setBuyerChecks((p) => ({ ...p, responsibility: e.target.checked }))}
              />
              <span>I acknowledge Only If is not responsible for the sale outcome or owner decisions.</span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!buyerAllChecked} onClick={handleAcceptBuyer}>
              Accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'seller'} onOpenChange={(open) => setModal(open ? 'seller' : null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>List My Home</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.terms}
                onChange={(e) => setSellerChecks((p) => ({ ...p, terms: e.target.checked }))}
              />
              <span>
                I agree to the Terms and Conditions
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.legalAuthorization}
                onChange={(e) => setSellerChecks((p) => ({ ...p, legalAuthorization: e.target.checked }))}
              />
              <span>I confirm I am legally authorised to list the property on Only If.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.successFee}
                onChange={(e) => setSellerChecks((p) => ({ ...p, successFee: e.target.checked }))}
              />
              <span>
                I agree to a 1.1% (inc. GST) success fee if a buyer from Only If purchases my property.
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.noBypass}
                onChange={(e) => setSellerChecks((p) => ({ ...p, noBypass: e.target.checked }))}
              />
              <span>I will not attempt to bypass the platform or agent once a buyer is introduced.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.upgrades}
                onChange={(e) => setSellerChecks((p) => ({ ...p, upgrades: e.target.checked }))}
              />
              <span>I understand optional listing upgrades (photos, floorplan, video) are available at extra cost.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={sellerChecks.agentPartnerHelp}
                onChange={(e) => setSellerChecks((p) => ({ ...p, agentPartnerHelp: e.target.checked }))}
              />
              <span>I may request help from an Only If Agent Partner if needed.</span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!sellerAllChecked} onClick={handleAcceptSeller}>
              Accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'agent'} onOpenChange={(open) => setModal(open ? 'agent' : null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>I&apos;m an Agent</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-700">
            Agent accounts are created by our admin team. Please contact us to get started.
          </p>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setModal(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={modal === 'agent'} onOpenChange={(open) => setModal(open ? 'agent' : null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Become an Agent</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              By joining as an agent, you agree to our terms of service for property management and client interaction. Your account will be reviewed by an administrator before you gain full access.
            </p>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={agentChecks.terms}
                onChange={(e) => setAgentChecks((p) => ({ ...p, terms: e.target.checked }))}
              />
              <span>I agree to the Agent Terms & Conditions and understand my account is subject to review.</span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!agentAllChecked} onClick={handleAcceptAgent}>
              Accept & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

