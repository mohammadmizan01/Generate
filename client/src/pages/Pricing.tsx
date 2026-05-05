import { useState } from "react";
import { appPlans } from "../assets/assets";

interface Plan {
  id: string;
  name: string;
  price: string;
  credits: number;
  description: string;
  features: string[];
}

const Pricing = () => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const plans = appPlans as Plan[];

  const handlePurchase = async (planId: string) => {
    try {
      setLoadingPlanId(planId);

      console.log("Purchase plan:", planId);

      // Later:
      // const response = await fetch("/api/payment/create-checkout", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ planId }),
      // });
      //
      // const data = await response.json();
      // window.location.href = data.checkoutUrl;
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto z-20 max-md:px-4 min-h-[80vh] text-white">
        <div className="text-center mt-16">
          <h2 className="text-gray-100 text-3xl font-medium">
            Choose your plan
          </h2>

          <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">
            Start for free and scale up as you grow. Find the perfect plan for
            your creation needs.
          </p>

          <div className="w-full max-w-5xl mx-auto z-20 max-md:px-4">
            <div className="pt-14 py-4 px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 flex-wrap gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-6 bg-black/20 ring ring-indigo-950 mx-auto w-full max-w-sm rounded-lg text-white shadow-lg hover:ring-indigo-500 transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold">{plan.name}</h3>

                    <div className="my-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-300">
                        {" "}
                        / {plan.credits} credits
                      </span>
                    </div>

                    <p className="text-gray-300 mb-6">{plan.description}</p>

                    <ul className="space-y-1.5 mb-6 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <svg
                            className="h-5 w-5 text-indigo-300 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>

                          <span className="text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={loadingPlanId === plan.id}
                      className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-sm rounded-md transition-all disabled:opacity-70"
                    >
                      {loadingPlanId === plan.id ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
