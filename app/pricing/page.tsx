'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { usePrivy } from '@privy-io/react-auth';
import { AppShell } from '@/components/AppShell';
import { Check, Star, Shield, Zap, Users, Globe } from 'lucide-react';

export default function PricingPage() {
  const { user, upgradeToPremium } = useApp();
  const { authenticated, login } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!authenticated) {
      login();
      return;
    }

    setIsLoading(true);
    try {
      await upgradeToPremium();
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = user?.subscription_status === 'premium';

  const features = {
    free: [
      'Basic rights information for all 50 states',
      'Up to 5 interaction logs per month',
      'Standard "Do\'s and Don\'ts" scripts',
      'Basic shareable summaries',
      'Community support',
    ],
    premium: [
      'Everything in Free',
      'Unlimited interaction logging',
      'AI-powered custom script generation',
      'Advanced shareable cards with legal references',
      'Multi-language support (English & Spanish)',
      'Cloud backup and sync',
      'Priority customer support',
      'Early access to new features',
      'Farcaster Frame integration',
      'Legal resource library',
    ],
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Protect your rights with the plan that fits your needs
          </p>

          {isPremium && (
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white font-medium mb-6">
              <Star className="w-5 h-5 mr-2" />
              You&apos;re currently on Premium
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className="glass-card p-8 relative">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="text-4xl font-bold text-white mb-2">
                $0
                <span className="text-lg font-normal text-gray-300">
                  /month
                </span>
              </div>
              <p className="text-gray-300">Perfect for getting started</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              disabled={!isPremium}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                !isPremium
                  ? 'bg-gray-600 text-white cursor-default'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {!isPremium ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="glass-card p-8 relative border-2 border-purple-500">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>

            <div className="text-center mb-6">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="text-4xl font-bold text-white mb-2">
                $5
                <span className="text-lg font-normal text-gray-300">
                  /month
                </span>
              </div>
              <p className="text-gray-300">Full protection and peace of mind</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={isPremium || isLoading}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                isPremium
                  ? 'bg-gray-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              }`}
            >
              {isLoading
                ? 'Processing...'
                : isPremium
                  ? 'Current Plan'
                  : authenticated
                    ? 'Upgrade to Premium'
                    : 'Connect Wallet to Upgrade'}
            </button>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="glass-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-white font-medium">
                    Feature
                  </th>
                  <th className="text-center py-3 text-white font-medium">
                    Free
                  </th>
                  <th className="text-center py-3 text-white font-medium">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-800">
                  <td className="py-3">State-specific rights guides</td>
                  <td className="text-center py-3">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Interaction logging</td>
                  <td className="text-center py-3">5/month</td>
                  <td className="text-center py-3">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">AI script generation</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Multi-language support</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Cloud backup</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3">Priority support</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Why Premium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI-Powered
            </h3>
            <p className="text-gray-300">
              Get personalized scripts and summaries generated by advanced AI
              for your specific situation.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Multi-Language
            </h3>
            <p className="text-gray-300">
              Access rights information and scripts in both English and Spanish
              for better communication.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Priority Support
            </h3>
            <p className="text-gray-300">
              Get help when you need it most with priority customer support and
              legal resources.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-300">
                Yes, you can cancel your Premium subscription at any time.
                You&apos;ll continue to have access to Premium features until
                the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-300">
                Absolutely. All your interaction logs and personal data are
                encrypted and stored securely. We never share your information
                with third parties.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-300">
                We accept all major credit cards through Stripe. Your payment
                information is processed securely and we never store your card
                details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-300">
                We offer a 30-day money-back guarantee. If you&apos;re not
                satisfied with Premium, contact us within 30 days for a full
                refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
