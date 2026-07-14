import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services import financial_advisor_service as svc


def test_flags_loss_making_operation():
    result = svc.generate_advice(
        total_expense=100000, total_revenue=60000,
        expense_breakdown=[{"category": "seeds", "total": 40000}, {"category": "labor", "total": 60000}],
        crop_summary=[{"crop_name": "rice", "total_expense": 100000, "total_revenue": 60000, "profit": -40000}],
    )
    critical_items = [a for a in result["advice"] if a["priority"] == "critical"]
    assert len(critical_items) >= 1
    assert "loss" in critical_items[0]["title"].lower() or "loss" in critical_items[0]["description"].lower()


def test_flags_high_expense_category_outlier():
    result = svc.generate_advice(
        total_expense=100000, total_revenue=150000,
        expense_breakdown=[
            {"category": "labor", "total": 70000},
            {"category": "seeds", "total": 10000},
            {"category": "fertilizer", "total": 10000},
            {"category": "pesticide", "total": 10000},
        ],
        crop_summary=[{"crop_name": "cotton", "total_expense": 100000, "total_revenue": 150000, "profit": 50000}],
    )
    cost_reduction_items = [a for a in result["advice"] if a["advice_type"] == "cost_reduction"]
    assert len(cost_reduction_items) >= 1
    assert "labor" in cost_reduction_items[0]["title"].lower()


def test_identifies_underperforming_crops():
    result = svc.generate_advice(
        total_expense=200000, total_revenue=250000,
        expense_breakdown=[{"category": "seeds", "total": 200000}],
        crop_summary=[
            {"crop_name": "wheat", "total_expense": 100000, "total_revenue": 150000, "profit": 50000},
            {"crop_name": "maize", "total_expense": 100000, "total_revenue": 90000, "profit": -10000},
        ],
    )
    diversification_items = [a for a in result["advice"] if a["advice_type"] == "crop_diversification"]
    assert len(diversification_items) >= 1
    assert "maize" in diversification_items[0]["description"]


def test_healthy_finances_produce_positive_or_low_priority_advice():
    result = svc.generate_advice(
        total_expense=100000, total_revenue=140000,
        expense_breakdown=[{"category": "seeds", "total": 50000}, {"category": "labor", "total": 50000}],
        crop_summary=[
            {"crop_name": "rice", "total_expense": 50000, "total_revenue": 70000, "profit": 20000},
            {"crop_name": "wheat", "total_expense": 50000, "total_revenue": 70000, "profit": 20000},
        ],
    )
    critical_items = [a for a in result["advice"] if a["priority"] == "critical"]
    assert len(critical_items) == 0
