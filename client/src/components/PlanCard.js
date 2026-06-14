import React from 'react';

const PlanCard = ({ plan, billingCycle, currentPlanId, onSubscribe, loading }) => {
  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const isCurrentPlan = currentPlanId === plan._id;
  const isFree = price === 0;

  return (
    <div className={`card flex flex-col gap-4 relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
      {isCurrentPlan && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Current Plan
        </span>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-3xl font-extrabold text-gray-900">
            {isFree ? 'Free' : `$${price}`}
          </span>
          {!isFree && (
            <span className="text-sm text-gray-500 mb-1">
              / {billingCycle === 'yearly' ? 'year' : 'month'}
            </span>
          )}
        </div>
        {!isFree && billingCycle === 'yearly' && (
          <p className="text-xs text-green-600 font-medium mt-1">
            Save ${(plan.priceMonthly * 12 - plan.priceYearly).toFixed(2)} vs monthly
          </p>
        )}
      </div>

      <ul className="space-y-2 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-500 font-bold">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {onSubscribe && (
        <button
          disabled={isCurrentPlan || loading}
          onClick={() => onSubscribe(plan._id)}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isCurrentPlan
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isCurrentPlan ? 'Active' : loading ? 'Processing…' : `Choose ${plan.name}`}
        </button>
      )}
    </div>
  );
};

export default PlanCard;
