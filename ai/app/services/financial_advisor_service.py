import numpy as np


def _pct(part: float, whole: float) -> float:
    return (part / whole * 100) if whole else 0.0


def generate_advice(total_expense: float, total_revenue: float, expense_breakdown: list, crop_summary: list):
    """
    Rule-based + statistical financial advisor. Combines simple thresholds with
    z-score outlier detection on expense categories and crop-level profitability
    ranking to produce prioritized, actionable recommendations.
    """
    advice = []
    net_profit = total_revenue - total_expense
    roi = _pct(net_profit, total_expense)

    # ---- 1. Overall profitability signal ----
    if total_expense > 0 and net_profit < 0:
        advice.append({
            "advice_type": "risk_alert",
            "title": "Overall Operations Are Currently Running at a Loss",
            "description": (
                f"Your total expenses (Rs. {total_expense:,.0f}) exceed total revenue "
                f"(Rs. {total_revenue:,.0f}) by Rs. {abs(net_profit):,.0f}. Review your "
                f"highest-cost categories and lowest-performing crops below before the next planting cycle."
            ),
            "priority": "critical",
            "metadata": {"net_profit": net_profit, "roi_percent": roi},
        })
    elif 0 <= roi < 15:
        advice.append({
            "advice_type": "investment",
            "title": "ROI Is Below Healthy Benchmark",
            "description": (
                f"Your current ROI is {roi:.1f}%, below the commonly recommended 15-20% threshold "
                f"for smallholder farm profitability. Consider crop diversification or input cost optimization."
            ),
            "priority": "high",
            "metadata": {"roi_percent": roi},
        })
    elif roi >= 30:
        advice.append({
            "advice_type": "general",
            "title": "Strong ROI Performance",
            "description": f"Your ROI of {roi:.1f}% is excellent. Consider reinvesting surplus profit into farm infrastructure or expanding high-performing crops.",
            "priority": "low",
            "metadata": {"roi_percent": roi},
        })

    # ---- 2. Expense category outlier detection (z-score) ----
    if len(expense_breakdown) >= 3:
        totals = np.array([float(e["total"]) for e in expense_breakdown])
        mean, std = totals.mean(), totals.std()
        if std > 0:
            for e in expense_breakdown:
                z = (float(e["total"]) - mean) / std
                if z > 1.5:
                    share = _pct(float(e["total"]), total_expense)
                    advice.append({
                        "advice_type": "cost_reduction",
                        "title": f"High Spending Detected: {e['category'].replace('_', ' ').title()}",
                        "description": (
                            f"'{e['category']}' accounts for {share:.1f}% of total expenses — significantly "
                            f"above your other cost categories. Compare vendor pricing or explore bulk-purchase "
                            f"and cooperative buying options to reduce this cost."
                        ),
                        "priority": "high" if share > 35 else "medium",
                        "metadata": {"category": e["category"], "share_percent": share},
                    })

    # ---- 3. Crop-level diversification / underperformance ----
    if crop_summary:
        losing_crops = [c for c in crop_summary if float(c["profit"]) < 0]
        winning_crops = sorted(crop_summary, key=lambda c: float(c["profit"]), reverse=True)

        if losing_crops:
            names = ", ".join(c["crop_name"] for c in losing_crops[:3])
            advice.append({
                "advice_type": "crop_diversification",
                "title": "Underperforming Crops Identified",
                "description": (
                    f"The following crop(s) are currently unprofitable: {names}. Consider switching to "
                    f"higher-performing alternatives or using the AI Crop Recommendation tool for your soil/climate profile."
                ),
                "priority": "high",
                "metadata": {"losing_crops": [c["crop_name"] for c in losing_crops]},
            })

        if winning_crops and float(winning_crops[0]["profit"]) > 0:
            top = winning_crops[0]
            advice.append({
                "advice_type": "general",
                "title": f"{top['crop_name']} Is Your Most Profitable Crop",
                "description": (
                    f"{top['crop_name']} generated Rs. {float(top['profit']):,.0f} in profit — your best "
                    f"performer. Consider allocating more acreage to it next season, subject to soil/rotation suitability."
                ),
                "priority": "medium",
                "metadata": {"crop_name": top["crop_name"], "profit": float(top["profit"])},
            })

        if len(crop_summary) == 1:
            advice.append({
                "advice_type": "crop_diversification",
                "title": "Single-Crop Dependency Risk",
                "description": (
                    "Your entire operation currently depends on one crop. Diversifying across 2-3 crops "
                    "with different seasons or market cycles can reduce risk from price volatility or crop failure."
                ),
                "priority": "medium",
                "metadata": {"crop_count": len(crop_summary)},
            })

    # ---- 4. Loan / working capital signal (heuristic on expense-to-revenue ratio) ----
    if total_revenue > 0 and total_expense / max(total_revenue, 1) > 0.85:
        advice.append({
            "advice_type": "loan_management",
            "title": "Thin Operating Margin — Review Financing Strategy",
            "description": (
                "Your expenses consume over 85% of revenue, leaving little buffer. If you're relying on "
                "informal credit, consider a Kisan Credit Card (KCC) for lower-interest working capital, "
                "and check the Government Schemes section for applicable subsidies."
            ),
            "priority": "medium",
            "metadata": {"expense_to_revenue_ratio": round(total_expense / max(total_revenue, 1), 2)},
        })

    if not advice:
        advice.append({
            "advice_type": "general",
            "title": "Your Finances Look Balanced",
            "description": "No significant risk signals detected. Keep tracking expenses and sales regularly for continued insight.",
            "priority": "low",
            "metadata": None,
        })

    return {"advice": advice, "model_version": "v1"}
