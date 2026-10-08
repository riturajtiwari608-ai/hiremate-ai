import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Starter Free",
      tagline: "Essential tools to test your readiness",
      priceMonthly: "$0",
      priceYearly: "$0",
      features: [
        "2 AI Resume-JD Analyses per month",
        "1 Voice AI Mock Interview session",
        "Standard Skill Gap Matching",
        "Basic PDF Report Download",
        "Community Support",
      ],
      ctaText: "Current Plan",
      popular: false,
      buttonClass: "secondary-btn",
    },
    {
      id: "pro",
      name: "Candidate Pro",
      tagline: "For active job seekers who want to crack interviews",
      priceMonthly: "$14",
      priceYearly: "$99",
      features: [
        "Unlimited AI Resume-JD Analyses",
        "Unlimited Voice & Speech Mock Interviews",
        "1-Click AI ATS Resume Optimizer & Rewriter",
        "Full 7-Day Role Preparation Roadmap",
        "Instant Email & PDF Report Delivery",
        "Detailed Technical, Communication & Confidence Scoring",
        "Priority Support",
      ],
      ctaText: "Upgrade to Pro",
      popular: true,
      buttonClass: "primary-btn",
    },
    {
      id: "enterprise",
      name: "University / B2B Agency",
      tagline: "For Colleges, Bootcamps & HR Staffing Agencies",
      priceMonthly: "$249",
      priceYearly: "$1,999",
      features: [
        "Bulk Screening (up to 500 resumes/batch)",
        "1-Click CSV / Excel Export for Placement Teams",
        "Full White-label Branding (Logo, Colors, Name)",
        "Candidate Performance Leaderboard",
        "Automated Candidate Email Dispatching",
        "Dedicated Account Manager & API Access",
      ],
      ctaText: "Contact Enterprise",
      popular: false,
      buttonClass: "primary-btn",
    },
  ];

  const handleSelectPlan = (plan) => {
    if (plan.id === "free") return;
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setShowCheckoutModal(true);
  };

  const handleSimulatePayment = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowCheckoutModal(false);
      alert(`🎉 Payment Successful! Your account has been upgraded to ${selectedPlan.name}.`);
    }, 1500);
  };

  return (
    <>
      <Navbar />

      <main className="container">
        <div className="page-header" style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 32px" }}>
          <p className="eyebrow dark-eyebrow">Flexible Plans</p>
          <h1>Invest in Your Career Readiness</h1>
          <p style={{ fontSize: "16px" }}>
            Choose the plan that fits your preparation goals or enterprise placement team.
          </p>

          <div style={{ display: "inline-flex", background: "#e2e8f0", padding: "4px", borderRadius: "999px", marginTop: "16px" }}>
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              style={{
                border: "none",
                padding: "8px 20px",
                borderRadius: "999px",
                fontWeight: 700,
                cursor: "pointer",
                background: billingCycle === "monthly" ? "white" : "transparent",
                color: billingCycle === "monthly" ? "#0f172a" : "#64748b",
                boxShadow: billingCycle === "monthly" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              style={{
                border: "none",
                padding: "8px 20px",
                borderRadius: "999px",
                fontWeight: 700,
                cursor: "pointer",
                background: billingCycle === "yearly" ? "white" : "transparent",
                color: billingCycle === "yearly" ? "#0f172a" : "#64748b",
                boxShadow: billingCycle === "yearly" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              }}
            >
              Yearly (Save 35% 🎁)
            </button>
          </div>
        </div>

        <div className="grid-3" style={{ alignItems: "stretch" }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="info-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                border: plan.popular ? "2px solid #2563eb" : "1px solid #e2e8f0",
                boxShadow: plan.popular ? "0 12px 32px rgba(37, 99, 235, 0.15)" : "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              {plan.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    right: "24px",
                    background: "#2563eb",
                    color: "white",
                    padding: "4px 14px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 800,
                  }}
                >
                  MOST POPULAR
                </span>
              )}

              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "22px" }}>{plan.name}</h3>
                <p style={{ color: "#64748b", fontSize: "14px", minHeight: "40px" }}>{plan.tagline}</p>

                <div style={{ margin: "20px 0" }}>
                  <span style={{ fontSize: "40px", fontWeight: 800, color: "#0f172a" }}>
                    {billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                  </span>
                  <span style={{ color: "#64748b", fontSize: "14px" }}>
                    {plan.id !== "free" ? (billingCycle === "monthly" ? "/month" : "/year") : ""}
                  </span>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "16px 0" }} />

                <ul style={{ paddingLeft: "20px", lineHeight: "2", fontSize: "14px", color: "#334155" }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={plan.buttonClass}
                style={{ width: "100%", marginTop: "24px" }}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Simulation Modal */}
        {showCheckoutModal && selectedPlan && (
          <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h2>Secure Checkout ({selectedPlan.name})</h2>
                <button className="close-btn" onClick={() => setShowCheckoutModal(false)}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong>Plan:</strong>
                    <span>{selectedPlan.name} ({billingCycle})</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                    <strong>Total Amount:</strong>
                    <strong style={{ color: "#2563eb" }}>
                      {billingCycle === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly}
                    </strong>
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  🔒 Secure payment powered by <strong>Stripe & Razorpay Gateway Sandbox</strong>.
                </p>

                {paymentSuccess ? (
                  <div className="success-box" style={{ textAlign: "center", padding: "20px" }}>
                    <h3>✅ Payment Processing Successful!</h3>
                    <p>Activating your subscription...</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ width: "100%", padding: "14px", fontSize: "16px" }}
                    onClick={handleSimulatePayment}
                  >
                    Pay & Upgrade Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
