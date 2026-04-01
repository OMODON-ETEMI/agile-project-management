'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BillingPlan {
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  features: string[];
  buttonText: string;
  buttonStyle: 'primary' | 'secondary';
  highlighted?: boolean;
}

const BillingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: BillingPlan[] = [
    {
      name: 'Free',
      tagline: 'Perfect for getting started',
      monthlyPrice: 0,
      features: [
        'Up to 10 team members',
        'Basic task management',
        'Kanban-style boards',
        'Basic commenting',
        '10MB file storage',
        'Email notifications',
        'Basic workspace customization'
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'secondary'
    },
    {
      name: 'Standard',
      tagline: 'Best for growing teams',
      monthlyPrice: 10,
      yearlyPrice: 96, // 10 * 12 * 0.8
      features: [
        'Everything in Free, plus:',
        'Unlimited team members',
        'Advanced workflows',
        'Time tracking',
        'Custom fields',
        'Advanced reporting',
        '1GB storage per project',
        'Priority support',
        'Advanced comments'
      ],
      buttonText: 'Upgrade to Standard',
      buttonStyle: 'primary',
      highlighted: true
    },
    {
      name: 'Pro',
      tagline: 'For power users',
      monthlyPrice: 15,
      yearlyPrice: 144, // 15 * 12 * 0.8
      features: [
        'Everything in Standard, plus:',
        'Custom roles & permissions',
        'Multiple workspaces',
        'Advanced integrations',
        'Audit logs',
        'Advanced admin controls',
        'White labeling',
        'Guest access',
        'Bulk actions',
        'Premium support'
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'secondary'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#0f172a]">Choose Your Plan</h2>
          <div className="inline-flex bg-[#f1f5f9] rounded-lg p-1">
            <Button 
              onClick={() => setBillingPeriod('monthly')}
              className={`
                ${billingPeriod === 'monthly' 
                  ? 'bg-[#6366f1] text-white' 
                  : 'text-[#64748b] hover:bg-[#f1f5f9]'}
                px-4 py-2 rounded-md
              `}
            >
              Monthly
            </Button>
            <Button 
              onClick={() => setBillingPeriod('yearly')}
              className={`
                ${billingPeriod === 'yearly' 
                  ? 'bg-[#6366f1] text-white' 
                  : 'text-[#64748b] hover:bg-[#f1f5f9]'}
                px-4 py-2 rounded-md
              `}
            >
              Yearly (-20%)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`
                ${plan.highlighted 
                  ? 'border-2 border-[#6366f1]' 
                  : 'border border-[#e2e8f0]'}
                bg-white
              `}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-[#0f172a]">{plan.name}</h3>
                    <p className="text-sm text-[#64748b]">{plan.tagline}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-4xl font-bold text-[#0f172a]">
                    ${billingPeriod === 'monthly' 
                      ? plan.monthlyPrice 
                      : (plan.yearlyPrice || plan.monthlyPrice)}
                  </p>
                  <p className="text-sm text-[#64748b]">
                    {billingPeriod === 'monthly' ? 'per month' : 'per year'}
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center text-sm text-[#0f172a]"
                    >
                      <span className="mr-2 text-green-500">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                <Button 
                  className={`
                    w-full 
                    ${plan.buttonStyle === 'primary' 
                      ? 'bg-[#6366f1] text-white hover:bg-[#6366f1]/90' 
                      : 'bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9]'}
                  `}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;