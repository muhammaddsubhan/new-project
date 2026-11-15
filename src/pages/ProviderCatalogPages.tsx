import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { ALL_SERVICES, KARACHI_AREAS } from '../data/karachiDemoData';
import { useWashMate } from '../context/WashMateContext';
import { DashboardShell } from '../components/DashboardShell';
import { PROVIDER_NAV_ITEMS, useMyProvider } from './ProviderDashboardPages';
import type { ClothingItemPrice, ServiceType } from '../types/washmate';

export const ProviderServicesPage: React.FC = () => {
  const { providerServices, toggleProviderService } = useWashMate();
  const myProvider = useMyProvider();
  const [error, setError] = useState('');

  if (!myProvider) {
    return (
      <DashboardShell portalLabel="Partner Portal" breadcrumb="Services" navItems={PROVIDER_NAV_ITEMS}>
        <p className="text-sm text-slate-600">Register your business profile first.</p>
      </DashboardShell>
    );
  }

  const handleToggle = async (svc: ServiceType, currentlyEnabled: boolean, hrs: number) => {
    setError('');
    try {
      await toggleProviderService(myProvider.id, svc, !currentlyEnabled, hrs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update service.');
    }
  };

  return (
    <DashboardShell
      portalLabel="Partner Portal"
      breadcrumb="Services & Turnaround"
      navItems={PROVIDER_NAV_ITEMS}
    >
      {error ? (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">{error}</div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {ALL_SERVICES.map((svc) => {
          const cfg = providerServices.find((s) => s.providerId === myProvider.id && s.serviceType === svc);
          const enabled = myProvider.availableServices.includes(svc);
          const hrs = cfg?.turnaroundHours || myProvider.turnaroundHours;

          return (
            <div key={svc} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{svc}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Turnaround: <span className="font-mono-num">{hrs} hours</span> ·{' '}
                  {enabled ? 'Visible to customers' : 'Disabled for this shop'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(svc, enabled, hrs)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
                  enabled
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {enabled ? 'Enabled (Click to Disable)' : 'Disabled (Click to Enable)'}
              </button>
            </div>
          );
        })}
      </div>
    </DashboardShell>
  );
};

export const ProviderPricingPage: React.FC = () => {
  const { clothingItems, upsertClothingItemPrice, currentUser } = useWashMate();
  const myProvider = useMyProvider();

  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState<ClothingItemPrice['category']>('Tops');
  const [newBasePrice, setNewBasePrice] = useState(50);
  const [savedToast, setSavedToast] = useState('');

  if (!myProvider) {
    return (
      <DashboardShell portalLabel="Partner Portal" breadcrumb="Clothing Prices" navItems={PROVIDER_NAV_ITEMS}>
        <p className="text-sm text-slate-600">Register your business profile first.</p>
      </DashboardShell>
    );
  }

  const myItems = clothingItems.filter((item) => item.providerId === myProvider.id);

  const handlePriceEdit = async (item: ClothingItemPrice, svc: ServiceType, val: number) => {
    const clean = Math.max(0, Math.round(val));
    await upsertClothingItemPrice(myProvider.id, {
      ...item,
      pricesByService: {
        ...item.pricesByService,
        [svc]: clean,
      },
    });
    setSavedToast(`Updated ${item.itemName} (${svc}) to Rs. ${clean}.`);
    setTimeout(() => setSavedToast(''), 2500);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !currentUser) return;
    const pricesByService: Partial<Record<ServiceType, number>> = {};
    myProvider.availableServices.forEach((svc) => {
      pricesByService[svc] = Math.max(10, Math.round(newBasePrice));
    });
    const newItem: ClothingItemPrice = {
      id: `${myProvider.id}_item_${Date.now().toString(36)}`,
      providerId: myProvider.id,
      ownerId: currentUser.uid,
      itemName: newItemName.trim(),
      category: newCategory,
      pricesByService,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertClothingItemPrice(myProvider.id, newItem);
    setNewItemName('');
    setSavedToast(`Added ${newItem.itemName} to price sheet.`);
  };

  return (
    <DashboardShell
      portalLabel="Partner Portal"
      breadcrumb="Per-Item PKR Pricing"
      navItems={PROVIDER_NAV_ITEMS}
    >
      {savedToast ? (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          {savedToast}
        </div>
      ) : null}

      <form onSubmit={handleAddItem} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Clothing Item Name</label>
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="e.g. Sherwani / Abaya"
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as ClothingItemPrice['category'])}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
          >
            <option value="Tops">Tops</option>
            <option value="Bottoms">Bottoms</option>
            <option value="Traditional">Traditional</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Bedding & Bath">Bedding & Bath</option>
            <option value="Formal">Formal</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Default Price (PKR)</label>
          <input
            type="number"
            min={10}
            value={newBasePrice}
            onChange={(e) => setNewBasePrice(Number(e.target.value))}
            className="w-28 px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono-num"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Garment
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Category</th>
                {myProvider.availableServices.map((svc) => (
                  <th key={svc} className="py-3 px-3 whitespace-nowrap">
                    {svc} (Rs.)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{item.itemName}</td>
                  <td className="py-2.5 px-4 text-slate-500">{item.category}</td>
                  {myProvider.availableServices.map((svc) => (
                    <td key={svc} className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        defaultValue={item.pricesByService[svc] ?? 0}
                        onBlur={(e) => handlePriceEdit(item, svc, Number(e.target.value))}
                        className="w-20 px-2 py-1 border border-slate-200 rounded-lg font-mono-num text-slate-900"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
};

export const ProviderProfilePage: React.FC = () => {
  const { updateProviderProfile, registerLaundryBusiness, uploadProviderImage } = useWashMate();
  const myProvider = useMyProvider();

  const [businessName, setBusinessName] = useState(myProvider?.businessName || '');
  const [description, setDescription] = useState(myProvider?.description || '');
  const [phone, setPhone] = useState(myProvider?.phone || '');
  const [email, setEmail] = useState(myProvider?.email || '');
  const [address, setAddress] = useState(myProvider?.address || '');
  const [primaryArea, setPrimaryArea] = useState(myProvider?.primaryArea || KARACHI_AREAS[0]);
  const [serviceAreas, setServiceAreas] = useState<string[]>(myProvider?.serviceAreas || [KARACHI_AREAS[0]]);
  const [operatingHours, setOperatingHours] = useState(myProvider?.operatingHours || '09:00 AM – 10:00 PM');
  const [pickupFeePkr, setPickupFeePkr] = useState(myProvider?.pickupFeePkr ?? 50);
  const [deliveryFeePkr, setDeliveryFeePkr] = useState(myProvider?.deliveryFeePkr ?? 50);
  const [minOrderPkr, setMinOrderPkr] = useState(myProvider?.minOrderPkr ?? 250);
  const [expressAvailable, setExpressAvailable] = useState(myProvider?.expressAvailable ?? true);
  const [expressSurchargePkr, setExpressSurchargePkr] = useState(myProvider?.expressSurchargePkr ?? 150);
  const [turnaroundHours, setTurnaroundHours] = useState(myProvider?.turnaroundHours ?? 24);
  const [coverImageUrl, setCoverImageUrl] = useState(myProvider?.coverImageUrl || '');
  const [statusMsg, setStatusMsg] = useState('');

  const toggleArea = (area: string) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? (prev.length > 1 ? prev.filter((a) => a !== area) : prev) : [...prev, area]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !myProvider) return;
    try {
      const url = await uploadProviderImage(myProvider.id, file);
      setCoverImageUrl(url);
      await updateProviderProfile(myProvider.id, { coverImageUrl: url });
      setStatusMsg('Business photo uploaded to Firebase Storage.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Photo upload requires live Firebase login.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myProvider) {
      await updateProviderProfile(myProvider.id, {
        businessName,
        description,
        phone,
        email,
        address,
        primaryArea,
        serviceAreas,
        operatingHours,
        pickupFeePkr,
        deliveryFeePkr,
        minOrderPkr,
        expressAvailable,
        expressSurchargePkr,
        turnaroundHours,
        coverImageUrl,
      });
      setStatusMsg('Business profile updated.');
    } else {
      await registerLaundryBusiness({
        businessName,
        description,
        phone,
        email,
        address,
        primaryArea,
        serviceAreas,
        operatingHours,
        pickupAvailable: true,
        deliveryAvailable: true,
        expressAvailable,
        expressSurchargePkr,
        pickupFeePkr,
        deliveryFeePkr,
        minOrderPkr,
        turnaroundHours,
        availableServices: ['Washing', 'Drying', 'Ironing', 'Wash + Dry + Fold'],
        coverImageUrl,
      });
      setStatusMsg('Business registered and submitted for Admin approval.');
    }
  };

  return (
    <DashboardShell
      portalLabel="Partner Portal"
      breadcrumb="Business Profile & Karachi Areas"
      navItems={PROVIDER_NAV_ITEMS}
    >
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 max-w-4xl">
        {statusMsg ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
            {statusMsg}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Karachi Area</label>
            <select
              value={primaryArea}
              onChange={(e) => setPrimaryArea(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"
            >
              {KARACHI_AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Shop Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Karachi Areas Served (Pickup & Delivery)
          </label>
          <div className="flex flex-wrap gap-2">
            {KARACHI_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl border ${
                  serviceAreas.includes(area)
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Fee (Rs.)</label>
            <input
              type="number"
              min={0}
              value={pickupFeePkr}
              onChange={(e) => setPickupFeePkr(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Fee (Rs.)</label>
            <input
              type="number"
              min={0}
              value={deliveryFeePkr}
              onChange={(e) => setDeliveryFeePkr(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order (Rs.)</label>
            <input
              type="number"
              min={0}
              value={minOrderPkr}
              onChange={(e) => setMinOrderPkr(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Turnaround (hrs)</label>
            <input
              type="number"
              min={6}
              value={turnaroundHours}
              onChange={(e) => setTurnaroundHours(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono-num"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={expressAvailable}
                onChange={(e) => setExpressAvailable(e.target.checked)}
              />
              Offer Express (+Rs.)
            </label>
            {expressAvailable ? (
              <input
                type="number"
                min={0}
                value={expressSurchargePkr}
                onChange={(e) => setExpressSurchargePkr(Number(e.target.value))}
                className="w-24 px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-mono-num"
              />
            ) : null}
          </div>
        </div>

        {myProvider ? (
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Shop Photo (Firebase Storage Upload)
            </label>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-900 bg-sky-50 hover:bg-sky-100 rounded-xl cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              Upload Cover Photo
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        ) : null}

        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
        >
          {myProvider ? 'Save Business Profile' : 'Register Laundry Business'}
        </button>
      </form>
    </DashboardShell>
  );
};
