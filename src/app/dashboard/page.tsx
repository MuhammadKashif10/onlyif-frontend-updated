'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/reusable';
import { useAuth } from '@/context/AuthContext';
import { BriefcaseBusiness, Heart, Home, Search } from 'lucide-react';

type ModalType = 'buyer' | 'seller' | 'agent' | null;

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, addRole, setActiveRole, activeRole, requestAgentRole } = useAuth();

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

    // Use activeRole if available for consistent redirection
    if (activeRole) {
      if (activeRole === 'admin' && user.roles.includes('admin')) {
        router.replace('/dashboards/admin');
        return;
      }
      if (activeRole === 'agent' && user.roles.includes('agent')) {
        router.replace('/dashboards/agent');
        return;
      }
      if (activeRole === 'buyer' && user.roles.includes('buyer')) {
        router.replace('/dashboards/buyer');
        return;
      }
      if (activeRole === 'seller' && user.roles.includes('seller')) {
        router.replace('/dashboards/seller');
        return;
      }
    }

    // Default redirection based on roles if activeRole is not set or not matching
    if (user.roles && user.roles.length > 0) {
      if (user.roles.includes('admin')) {
        setActiveRole('admin');
        router.replace('/dashboards/admin');
        return;
      }
      if (user.roles.includes('agent')) {
        setActiveRole('agent');
        router.replace('/dashboards/agent');
        return;
      }
      if (user.roles.includes('buyer')) {
        setActiveRole('buyer');
        router.replace('/dashboards/buyer');
        return;
      }
      if (user.roles.includes('seller')) {
        setActiveRole('seller');
        router.replace('/dashboards/seller');
        return;
      }
    }
  }, [isLoading, router, user, activeRole, setActiveRole]);

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
    await addRole('buyer');
    router.push('/dashboards/buyer');
  };

  const handleAcceptSeller = async () => {
    if (!sellerAllChecked) return;
    await addRole('seller');
    router.push('/dashboards/seller');
  };

  const handleSelectBuyer = () => {
    if (user?.acceptedRoles?.buyer) {
      router.push('/dashboards/buyer');
    } else {
      setModal('buyer');
    }
  };

  const handleSelectSeller = () => {
    if (user?.acceptedRoles?.seller) {
      router.push('/dashboards/seller');
    } else {
      setModal('seller');
    }
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

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name?.split(' ')[0] || 'there'} 👋</h1>
            <p className="mt-2 text-gray-600">Here&apos;s what you can do today</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 rounded-2xl border border-gray-200 bg-gray-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">No saved homes yet</p>
                <p className="mt-1 text-xs text-gray-600">Start browsing to save properties you&apos;re interested in.</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Home className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">You haven&apos;t listed a property</p>
                <p className="mt-1 text-xs text-gray-600">Create your private listing in just a few minutes.</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Ready to explore?</p>
                <p className="mt-1 text-xs text-gray-600">Unlock exclusive off-market opportunities today.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={handleSelectSeller}
            className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 text-white">
              <Home className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">List My Home</h2>
            <p className="mt-2 text-sm text-gray-600">Create a private listing and connect with serious buyers, on your terms.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✅ Private &amp; secure</li>
              <li>✅ Reach motivated buyers</li>
              <li>✅ Takes ~3 minutes to get started</li>
            </ul>
            <div className="mt-5">
              <span className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white">
                Start Listing →
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleSelectBuyer}
            className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Browse Homes</h2>
            <p className="mt-2 text-sm text-gray-600">Get access to exclusive off-market properties not available on other platforms.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✅ Exclusive off-market listings</li>
              <li>✅ Search and save homes</li>
              <li>✅ New properties added daily</li>
            </ul>
            <div className="mt-5">
              <span className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white">
                Browse Now →
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setModal('agent')}
            className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">I&apos;m an Agent</h2>
            <p className="mt-2 text-sm text-gray-600">Access your tools, manage clients, and grow your off-market business.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>✅ Manage your listings</li>
              <li>✅ Track client activity</li>
              <li>✅ Access agent resources</li>
            </ul>
            <div className="mt-5">
              <span className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700">
                Agent Access →
              </span>
            </div>
          </button>
        </div>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All Activity →
            </button>
          </div>
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-700">No activity yet</p>
            <p className="mt-1 text-xs text-gray-500">When you browse homes, save properties, or create a listing, your activity will appear here.</p>
          </div>
        </section>
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

