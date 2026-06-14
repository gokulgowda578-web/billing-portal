import React, { useEffect, useState } from 'react';
import { getPlans, getMySubscription, subscribeToPlan } from '../services/api';
import PlanCard from '../components/PlanCard';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const PlansPage = () => {
  const [plans, setPlans]               = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading]           = useState(true);
  const [subLoading, setSubLoading]     = useState(false);
  const [message, setMessage]           = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subRes] = await Promise.all([
          getPlans(),
          getMySubscription(),
        ]);
        setPlans(plansRes.data);
        setSubscription(subRes.data);
      } catch (err) {
        console.error('Plans load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (planId) => {
    setSubLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await subscribeToPlan({ planId, billingCycle });
      setSubscription(data.subscription);
      setMessage({ type: 'success', text: `Successfully subscribed! Invoice #${data.invoice._id.slice(-6)} generated.` });
      // Refresh subscription display
      const subRes = await getMySubscription();
      setSubscription(subRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Subscription failed.' });
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-500 mt-1">Choose the plan that fits your needs</p>
      </div>

      {/* Alert */}
      {message.text && (
        <div className="mb-6">
          <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle((c) => (c === 'monthly' ? 'yearly' : 'monthly'))}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
              billingCycle === 'yearly' ? 'left-7' : 'left-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
          Yearly
          <span className="ml-1 text-xs text-green-600 font-semibold">Save ~17%</span>
        </span>
      </div>

      {/* Plan cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            billingCycle={billingCycle}
            currentPlanId={subscription?.planId?._id || subscription?.planId}
            onSubscribe={handleSubscribe}
            loading={subLoading}
          />
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 text-gray-400">No plans available.</div>
      )}
    </div>
  );
};

export default PlansPage;
