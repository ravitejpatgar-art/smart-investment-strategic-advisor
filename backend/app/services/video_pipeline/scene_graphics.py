"""
SmartVest P8 — Video Pipeline Scene Graphics Generator (Reference-Quality 8-Scene Edition)
Generates high-resolution 1920x1080 fintech educational cards, diagrams, charts, and overlay HUDs
for Lesson 1: 'What is Investment?'.
"""

import os
import math
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image, ImageDraw, ImageFont

# Brand Palette — Premium Dark Fintech
BG_DARK = (11, 19, 43)          # Deep Navy #0B132B
BG_CARD = (28, 37, 65)          # Slate Navy #1C2541
BG_CARD_BORDER = (58, 80, 107)  # Steel Blue #3A506B
ACCENT_CYAN = (6, 182, 212)     # Cyan #06B6D4
ACCENT_TEAL = (13, 148, 136)    # Teal #0D9488
ACCENT_EMERALD = (16, 185, 129) # Green #10B981
ACCENT_AMBER = (245, 158, 11)   # Gold #F59E0B
ACCENT_ROSE = (244, 63, 94)     # Red/Loss #F43F5E
ACCENT_PURPLE = (168, 85, 247)  # Purple #A855F7
TEXT_WHITE = (248, 250, 252)    # Pure Slate White
TEXT_MUTED = (148, 163, 184)    # Cool Gray
TEXT_ACCENT = (56, 189, 248)    # Light Blue


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Safely loads modern Windows system fonts with fallback."""
    font_name = "segoeuib.ttf" if bold else "segoeui.ttf"
    font_path = os.path.join(r"C:\Windows\Fonts", font_name)
    if os.path.exists(font_path):
        try:
            return ImageFont.truetype(font_path, size)
        except Exception:
            pass
    arial_name = "arialbd.ttf" if bold else "arial.ttf"
    arial_path = os.path.join(r"C:\Windows\Fonts", arial_name)
    if os.path.exists(arial_path):
        try:
            return ImageFont.truetype(arial_path, size)
        except Exception:
            pass
    return ImageFont.load_default()


def create_base_canvas(width: int = 1920, height: int = 1080, has_header: bool = True) -> Tuple[Image.Image, ImageDraw.ImageDraw]:
    """Creates a sleek, modern fintech 1080p background canvas with gradient and subtle grid."""
    img = Image.new("RGB", (width, height), BG_DARK)
    draw = ImageDraw.Draw(img)

    # Subtle vertical gradient
    for y in range(height):
        ratio = y / height
        r = int(BG_DARK[0] + (18 - BG_DARK[0]) * ratio)
        g = int(BG_DARK[1] + (30 - BG_DARK[1]) * ratio)
        b = int(BG_DARK[2] + (60 - BG_DARK[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Subtle grid lines
    grid_color = (20, 32, 60)
    for x in range(0, width, 120):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 120):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)

    if has_header:
        draw.rectangle([(60, 40), (width - 60, 100)], fill=BG_CARD, outline=BG_CARD_BORDER, width=2)
        font_brand = get_font(28, bold=True)
        font_cat = get_font(22, bold=False)
        draw.text((90, 52), "SMARTVEST ACADEMY", fill=ACCENT_CYAN, font=font_brand)
        draw.text((width - 340, 56), "FINANCIAL EDUCATION", fill=TEXT_MUTED, font=font_cat)

    return img, draw


def generate_lesson1_scenes(output_dir: str) -> Dict[str, str]:
    """
    Generates high-resolution scene graphics for Lesson 1: 'What is Investment?'.
    Synchronized with the 8-part educational narrative:
      1. What Investment Means (Presenter + HUD Intro)
      2. Saving vs. Investing Comparison
      3. Why Inflation Matters (Purchasing Power Erosion)
      4. The ₹10,000 Timeline & Growth Chart
      5. Types of Investments (Stocks, Mutual Funds, ETFs, Bonds, FD, Gold)
      6. Risk vs. Return Spectrum Chart
      7. The 3 Pillars: Goal, Risk & Time Horizon
      8. Presenter Summary & Golden Rule Outro
    """
    os.makedirs(output_dir, exist_ok=True)
    results = {}

    title_font = get_font(40, bold=True)
    sub_font = get_font(22)
    h_font = get_font(30, bold=True)
    body_font = get_font(22)

    # -------------------------------------------------------------
    # SCENE 1: Presenter Intro HUD Overlay (1920x1080 transparent PNG)
    # -------------------------------------------------------------
    hud_img = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    hud_draw = ImageDraw.Draw(hud_img)

    hud_draw.rounded_rectangle([(60, 40), (450, 100)], radius=12, fill=(11, 19, 43, 220), outline=ACCENT_CYAN, width=2)
    hud_draw.text((90, 54), "SMARTVEST ACADEMY", fill=ACCENT_CYAN, font=get_font(26, bold=True))

    hud_draw.rounded_rectangle([(60, 840), (840, 990)], radius=16, fill=(11, 19, 43, 235), outline=BG_CARD_BORDER, width=2)
    hud_draw.text((90, 860), "LESSON 01", fill=ACCENT_CYAN, font=get_font(22, bold=True))
    hud_draw.text((90, 895), "WHAT IS INVESTMENT?", fill=TEXT_WHITE, font=get_font(44, bold=True))
    hud_draw.text((90, 948), "Deploying Capital into Productive Assets", fill=TEXT_MUTED, font=get_font(20))

    s1_path = os.path.join(output_dir, "scene1_intro_hud.png")
    hud_img.save(s1_path, "PNG")
    results["scene1_intro_hud"] = s1_path

    # -------------------------------------------------------------
    # SCENE 2: Saving vs. Investing Comparison (Full Screen 1920x1080)
    # -------------------------------------------------------------
    s2_img, s2_draw = create_base_canvas()
    s2_draw.text((90, 125), "Core Comparison: Saving vs. Investing", fill=TEXT_WHITE, font=title_font)
    s2_draw.text((90, 175), "Understanding why idle cash loses purchasing power while productive capital grows", fill=TEXT_MUTED, font=sub_font)

    # Left: SAVING
    s2_draw.rounded_rectangle([(90, 230), (920, 940)], radius=20, fill=BG_CARD, outline=ACCENT_AMBER, width=3)
    s2_draw.rectangle([(90, 230), (920, 310)], fill=(40, 50, 80))
    s2_draw.text((120, 250), "SAVING  (Capital Preservation)", fill=ACCENT_AMBER, font=h_font)

    saving_items = [
        ("Location:", "Bank savings accounts, cash locker, short FD"),
        ("Primary Goal:", "Short-term liquidity & emergency protection"),
        ("Return Rate:", "Low or fixed (3% to 6% per annum)"),
        ("Hidden Threat:", "INFLATION quietly destroys purchasing power"),
        ("Nominal Cash:", "₹10,000 stays ₹10,000 nominally"),
        ("Real Value:", "Buys 40% to 50% fewer goods over a decade"),
        ("Best For:", "3 to 6 months emergency emergency fund"),
    ]
    y_pos = 340
    for label, desc in saving_items:
        s2_draw.text((120, y_pos), label, fill=ACCENT_AMBER, font=get_font(22, bold=True))
        s2_draw.text((120, y_pos + 30), desc, fill=TEXT_WHITE, font=get_font(20))
        y_pos += 85

    # Right: INVESTING
    s2_draw.rounded_rectangle([(1000, 230), (1830, 940)], radius=20, fill=BG_CARD, outline=ACCENT_EMERALD, width=3)
    s2_draw.rectangle([(1000, 230), (1830, 310)], fill=(20, 60, 60))
    s2_draw.text((1030, 250), "INVESTING  (Wealth Compounding)", fill=ACCENT_EMERALD, font=h_font)

    investing_items = [
        ("Location:", "Stocks, Mutual Funds, ETFs, Bonds, Real Estate"),
        ("Primary Goal:", "Long-term wealth building & outpacing inflation"),
        ("Return Rate:", "Higher growth via business profits & dividends"),
        ("Economic Role:", "Deploys capital into growing real economy"),
        ("Volatility:", "Prices fluctuate in the short term"),
        ("Real Value:", "Outpaces inflation to build substantial wealth"),
        ("Best For:", "Financial freedom, retirement, life goals"),
    ]
    y_pos = 340
    for label, desc in investing_items:
        s2_draw.text((1030, y_pos), label, fill=ACCENT_EMERALD, font=get_font(22, bold=True))
        s2_draw.text((1030, y_pos + 30), desc, fill=TEXT_WHITE, font=get_font(20))
        y_pos += 85

    s2_path = os.path.join(output_dir, "scene2_saving_vs_investing.png")
    s2_img.save(s2_path, "PNG")
    results["scene2_saving_vs_investing"] = s2_path

    # -------------------------------------------------------------
    # SCENE 3: Why Inflation Matters (Diagram + Split layout friendly)
    # -------------------------------------------------------------
    s3_img, s3_draw = create_base_canvas()
    # Left area for presenter (0 to 860)
    s3_draw.rectangle([(0, 0), (860, 1080)], fill=(8, 14, 30))

    s3_draw.text((900, 125), "Why Inflation Matters", fill=TEXT_WHITE, font=title_font)
    s3_draw.text((900, 175), "Inflation is the steady rise in prices that erodes idle money", fill=TEXT_MUTED, font=sub_font)

    # 3 visual stages showing the erosion of purchasing power
    stages = [
        ("THE INFLATION REALITY", "Price of the same household basket over time:", [
            ("Year 2005", "₹1,000", "Baseline grocery basket"),
            ("Year 2015", "₹1,800", "+80% price increase"),
            ("Year 2026", "₹3,200", "Same goods cost over 3x!"),
        ], ACCENT_ROSE),
        ("THE IDLE CASH TRAP", "If money sits without earning real return:", [
            ("Locker Cash", "₹10,000 stays ₹10,000", "Nominal face value unchanged"),
            ("Purchasing Power", "Drops to ₹5,580 in 10 yrs", "Purchasing power halved"),
            ("The Verdict", "Holding cash is NOT risk-free", "Guaranteed loss of value"),
        ], ACCENT_AMBER),
    ]
    y_box = 240
    for box_title, subtitle, rows, color in stages:
        s3_draw.rounded_rectangle([(900, y_box), (1830, y_box + 310)], radius=16, fill=BG_CARD, outline=color, width=2)
        s3_draw.text((930, y_box + 20), box_title, fill=color, font=get_font(24, bold=True))
        s3_draw.text((930, y_box + 55), subtitle, fill=TEXT_MUTED, font=get_font(18))
        
        y_r = y_box + 95
        for col1, col2, col3 in rows:
            s3_draw.rounded_rectangle([(930, y_r), (1800, y_r + 55)], radius=8, fill=(18, 26, 48))
            s3_draw.text((950, y_r + 15), col1, fill=TEXT_WHITE, font=get_font(20, bold=True))
            s3_draw.text((1180, y_r + 15), col2, fill=color, font=get_font(20, bold=True))
            s3_draw.text((1450, y_r + 17), col3, fill=TEXT_MUTED, font=get_font(17))
            y_r += 65
        y_box += 335

    # Bottom alert bar
    s3_draw.rounded_rectangle([(900, 925), (1830, 985)], radius=12, fill=(35, 20, 30), outline=ACCENT_ROSE, width=1)
    s3_draw.text((930, 942), "CRITICAL RULE: If investment returns < inflation, your real wealth is shrinking.", fill=ACCENT_ROSE, font=get_font(19, bold=True))

    s3_path = os.path.join(output_dir, "scene3_inflation.png")
    s3_img.save(s3_path, "PNG")
    results["scene3_inflation"] = s3_path

    # -------------------------------------------------------------
    # SCENE 4: ₹10,000 Example & Timeline Chart
    # -------------------------------------------------------------
    s4_img, s4_draw = create_base_canvas()
    s4_draw.text((90, 125), "₹10,000 Example: The 10-Year Reality Check", fill=TEXT_WHITE, font=title_font)
    s4_draw.text((90, 175), "Idle Locker Cash vs. 6% Inflation vs. Productive Investment at 10% CAGR", fill=TEXT_MUTED, font=sub_font)

    # Chart Frame
    cx1, cy1, cx2, cy2 = 120, 250, 1380, 880
    s4_draw.rounded_rectangle([(cx1, cy1), (cx2, cy2)], radius=16, fill=BG_CARD, outline=BG_CARD_BORDER, width=2)

    # Grid lines & Axis labels
    years = [0, 2, 4, 6, 8, 10]
    for i, yr in enumerate(years):
        gx = cx1 + 90 + i * 215
        s4_draw.line([(gx, cy1 + 40), (gx, cy2 - 60)], fill=(38, 50, 80), width=1)
        s4_draw.text((gx - 30, cy2 - 45), f"Year {yr}", fill=TEXT_MUTED, font=get_font(20))

    # Y-axis labels
    y_values = ["₹30,000", "₹25,000", "₹20,000", "₹15,000", "₹10,000", "₹5,000"]
    for i, val in enumerate(y_values):
        gy = cy1 + 50 + i * 88
        s4_draw.line([(cx1 + 70, gy), (cx2 - 40, gy)], fill=(38, 50, 80), width=1)
        s4_draw.text((cx1 + 10, gy - 12), val, fill=TEXT_MUTED, font=get_font(18))

    # Curve 1: Productive Investment (10% CAGR: ₹10k -> ₹25,937)
    inv_vals = [10000, 12100, 14641, 17715, 21435, 25937]
    pts_inv = []
    for i, iv in enumerate(inv_vals):
        ix = cx1 + 90 + i * 215
        iy = (cy2 - 60) - int((iv - 5000) / 25000.0 * 440)
        pts_inv.append((ix, iy))
    for i in range(len(pts_inv) - 1):
        s4_draw.line([pts_inv[i], pts_inv[i+1]], fill=ACCENT_EMERALD, width=6)
        s4_draw.ellipse([(pts_inv[i][0]-7, pts_inv[i][1]-7), (pts_inv[i][0]+7, pts_inv[i][1]+7)], fill=ACCENT_EMERALD)
    s4_draw.ellipse([(pts_inv[-1][0]-9, pts_inv[-1][1]-9), (pts_inv[-1][0]+9, pts_inv[-1][1]+9)], fill=ACCENT_EMERALD)
    s4_draw.text((pts_inv[-1][0] - 130, pts_inv[-1][1] - 35), "₹25,937 (+159%)", fill=ACCENT_EMERALD, font=get_font(20, bold=True))

    # Curve 2: Cost of Same Goods at 6% Inflation (₹10k -> ₹17,908)
    cost_vals = [10000, 11236, 12625, 14185, 15938, 17908]
    pts_cost = []
    for i, cv in enumerate(cost_vals):
        ix = cx1 + 90 + i * 215
        iy = (cy2 - 60) - int((cv - 5000) / 25000.0 * 440)
        pts_cost.append((ix, iy))
    for i in range(len(pts_cost) - 1):
        s4_draw.line([pts_cost[i], pts_cost[i+1]], fill=ACCENT_AMBER, width=4)
        s4_draw.ellipse([(pts_cost[i][0]-5, pts_cost[i][1]-5), (pts_cost[i][0]+5, pts_cost[i][1]+5)], fill=ACCENT_AMBER)
    s4_draw.text((pts_cost[-1][0] - 140, pts_cost[-1][1] + 15), "Goods cost: ₹17,908", fill=ACCENT_AMBER, font=get_font(18, bold=True))

    # Curve 3: Idle Cash Real Purchasing Power (₹10k -> ₹5,584)
    cash_vals = [10000, 8900, 7920, 7050, 6270, 5580]
    pts_cash = []
    for i, cv in enumerate(cash_vals):
        ix = cx1 + 90 + i * 215
        iy = (cy2 - 60) - int((cv - 5000) / 25000.0 * 440)
        pts_cash.append((ix, iy))
    for i in range(len(pts_cash) - 1):
        s4_draw.line([pts_cash[i], pts_cash[i+1]], fill=ACCENT_ROSE, width=5)
        s4_draw.ellipse([(pts_cash[i][0]-6, pts_cash[i][1]-6), (pts_cash[i][0]+6, pts_cash[i][1]+6)], fill=ACCENT_ROSE)
    s4_draw.ellipse([(pts_cash[-1][0]-8, pts_cash[-1][1]-8), (pts_cash[-1][0]+8, pts_cash[-1][1]+8)], fill=ACCENT_ROSE)
    s4_draw.text((pts_cash[-1][0] - 130, pts_cash[-1][1] - 32), "Real Value: ₹5,580", fill=ACCENT_ROSE, font=get_font(20, bold=True))

    # Right side KPI Cards
    s4_draw.rounded_rectangle([(1420, 250), (1830, 880)], radius=16, fill=BG_CARD, outline=BG_CARD_BORDER, width=2)
    s4_draw.text((1450, 280), "THE ₹10,000 LESSON", fill=ACCENT_CYAN, font=get_font(22, bold=True))

    kpis = [
        ("Idle Locker Cash", "Nominal: ₹10,000\nReal Value: ₹5,580\nLoss: -44.2%", ACCENT_ROSE),
        ("Inflation Impact", "Goods costing ₹10,000\nnow cost ₹17,908\nInflation: 6% per yr", ACCENT_AMBER),
        ("Productive Growth", "Invested at 10% CAGR\nFinal: ₹25,937\nGain: +159%", ACCENT_EMERALD),
    ]
    y_kpi = 330
    for title_k, desc_k, color_k in kpis:
        s4_draw.rounded_rectangle([(1450, y_kpi), (1800, y_kpi + 155)], radius=12, fill=(18, 26, 48), outline=color_k, width=2)
        s4_draw.text((1470, y_kpi + 15), title_k, fill=color_k, font=get_font(20, bold=True))
        s4_draw.text((1470, y_kpi + 45), desc_k, fill=TEXT_WHITE, font=get_font(18))
        y_kpi += 180

    # Mandatory Financial Safety Disclaimer
    s4_draw.rounded_rectangle([(120, 910), (1830, 970)], radius=10, fill=(20, 30, 50), outline=BG_CARD_BORDER, width=1)
    s4_draw.text((150, 930), "Hypothetical illustration — not a guaranteed return.", fill=ACCENT_AMBER, font=get_font(18, bold=True))
    s4_draw.text((630, 930), "Illustrative model only. Equities and market instruments carry risk and fluctuate.", fill=TEXT_MUTED, font=get_font(18))

    s4_path = os.path.join(output_dir, "scene4_chart.png")
    s4_img.save(s4_path, "PNG")
    results["scene4_chart"] = s4_path

    # -------------------------------------------------------------
    # SCENE 5: Types of Investments (Stocks / MF / ETF / Bonds / FD / Gold)
    # -------------------------------------------------------------
    s5_img, s5_draw = create_base_canvas()
    # Left area for presenter (0 to 860)
    s5_draw.rectangle([(0, 0), (860, 1080)], fill=(8, 14, 30))

    s5_draw.text((900, 125), "Core Asset Classes", fill=TEXT_WHITE, font=title_font)
    s5_draw.text((900, 175), "Deploying capital across diverse economic building blocks", fill=TEXT_MUTED, font=sub_font)

    # 6 cards in a 2-column x 3-row grid (900 to 1830)
    assets = [
        ("1. Company Shares / Stocks", "Ownership stake in businesses; capital gains & dividends", ACCENT_CYAN),
        ("2. Mutual Funds", "Baskets managed by professional fund managers", ACCENT_EMERALD),
        ("3. ETFs (Exchange Traded Funds)", "Low-cost index funds traded live on exchanges", ACCENT_TEAL),
        ("4. Government & Corporate Bonds", "Fixed income lending with regular interest payouts", ACCENT_AMBER),
        ("5. Fixed Deposits (FD)", "Capital safety and guaranteed bank interest", (200, 200, 220)),
        ("6. Sovereign Gold / Precious Metals", "Traditional store of value and crisis hedge", (234, 179, 8)),
    ]
    card_w = 440
    card_h = 220
    for idx, (head, desc, col) in enumerate(assets):
        col_idx = idx % 2
        row_idx = idx // 2
        x_c = 900 + col_idx * (card_w + 30)
        y_c = 240 + row_idx * (card_h + 25)
        s5_draw.rounded_rectangle([(x_c, y_c), (x_c + card_w, y_c + card_h)], radius=14, fill=BG_CARD, outline=col, width=2)
        s5_draw.text((x_c + 20, y_c + 20), head, fill=col, font=get_font(21, bold=True))
        s5_draw.text((x_c + 20, y_c + 75), desc, fill=TEXT_WHITE, font=get_font(18))

    s5_path = os.path.join(output_dir, "scene5_asset_classes.png")
    s5_img.save(s5_path, "PNG")
    results["scene5_asset_classes"] = s5_path

    # -------------------------------------------------------------
    # SCENE 6: Risk vs. Return Spectrum Chart
    # -------------------------------------------------------------
    s6_img, s6_draw = create_base_canvas()
    s6_draw.text((90, 125), "Risk & Return Walk Hand in Hand", fill=TEXT_WHITE, font=title_font)
    s6_draw.text((90, 175), "Understanding the fundamental financial trade-off before investing", fill=TEXT_MUTED, font=sub_font)

    # Coordinate chart frame
    rx1, ry1, rx2, ry2 = 120, 250, 1380, 880
    s6_draw.rounded_rectangle([(rx1, ry1), (rx2, ry2)], radius=16, fill=BG_CARD, outline=BG_CARD_BORDER, width=2)

    # Axes
    s6_draw.line([(rx1 + 100, ry2 - 80), (rx2 - 60, ry2 - 80)], fill=ACCENT_CYAN, width=3) # X axis: Risk
    s6_draw.line([(rx1 + 100, ry2 - 80), (rx1 + 100, ry1 + 60)], fill=ACCENT_CYAN, width=3) # Y axis: Return
    s6_draw.text((rx2 - 240, ry2 - 50), "RISK & VOLATILITY →", fill=ACCENT_CYAN, font=get_font(20, bold=True))
    s6_draw.text((rx1 + 30, ry1 + 30), "POTENTIAL RETURN ↑", fill=ACCENT_CYAN, font=get_font(20, bold=True))

    # Plotted Assets on the Risk-Return Curve
    points = [
        ("Savings / Cash", 160, ry2 - 120, ACCENT_AMBER, "Low Risk / Low Return"),
        ("Fixed Deposits (FD)", 360, ry2 - 200, (200, 200, 220), "Guaranteed / Modest Return"),
        ("Govt & Corp Bonds", 580, ry2 - 310, ACCENT_TEAL, "Moderate Risk / Steady Yield"),
        ("Gold & Real Estate", 780, ry2 - 420, (234, 179, 8), "Inflation Cushion / Moderate"),
        ("Mutual Funds & ETFs", 990, ry2 - 540, ACCENT_EMERALD, "Market Risk / High Compounding"),
        ("Individual Stocks", 1220, ry2 - 680, ACCENT_ROSE, "High Volatility / Highest Growth"),
    ]
    # Draw connecting trend curve
    trend_pts = [(p[1], p[2]) for p in points]
    for i in range(len(trend_pts) - 1):
        s6_draw.line([trend_pts[i], trend_pts[i+1]], fill=(100, 150, 220), width=3)

    for name, px, py, pcol, pdesc in points:
        s6_draw.ellipse([(px - 9, py - 9), (px + 9, py + 9)], fill=pcol, outline=TEXT_WHITE, width=2)
        s6_draw.text((px + 18, py - 20), name, fill=TEXT_WHITE, font=get_font(20, bold=True))
        s6_draw.text((px + 18, py + 5), pdesc, fill=TEXT_MUTED, font=get_font(16))

    # Right side takeaway card
    s6_draw.rounded_rectangle([(1420, 250), (1830, 880)], radius=16, fill=BG_CARD, outline=BG_CARD_BORDER, width=2)
    s6_draw.text((1450, 280), "CORE PRINCIPLE", fill=ACCENT_CYAN, font=get_font(22, bold=True))
    s6_draw.text((1450, 320), "No Free Lunch\nin Finance", fill=TEXT_WHITE, font=get_font(30, bold=True))

    takeaways = [
        ("Low Risk = Modest Return", "Safe instruments protect nominal balance, but rarely build true long-term wealth.", ACCENT_AMBER),
        ("Higher Return = Volatility", "Equities offer wealth compounding, but require endurance during market drops.", ACCENT_EMERALD),
        ("The Solution: Diversification", "Spread investments across asset classes to optimize your risk-adjusted return.", ACCENT_CYAN),
    ]
    y_t = 420
    for t_head, t_body, t_col in takeaways:
        s6_draw.rounded_rectangle([(1450, y_t), (1800, y_t + 130)], radius=12, fill=(18, 26, 48), outline=t_col, width=1)
        s6_draw.text((1470, y_t + 15), t_head, fill=t_col, font=get_font(19, bold=True))
        s6_draw.text((1470, y_t + 45), t_body, fill=TEXT_MUTED, font=get_font(17))
        y_t += 150

    s6_path = os.path.join(output_dir, "scene6_risk_return.png")
    s6_img.save(s6_path, "PNG")
    results["scene6_risk_return"] = s6_path

    # -------------------------------------------------------------
    # SCENE 7: The 3 Pillars: Goal, Risk & Time Horizon
    # -------------------------------------------------------------
    s7_img, s7_draw = create_base_canvas()
    # Left area for presenter (0 to 860)
    s7_draw.rectangle([(0, 0), (860, 1080)], fill=(8, 14, 30))

    s7_draw.text((900, 125), "The 3 Pillars of Investing", fill=TEXT_WHITE, font=title_font)
    s7_draw.text((900, 175), "Every sound financial decision is grounded on these three foundations", fill=TEXT_MUTED, font=sub_font)

    pillars = [
        ("PILLAR 1: FINANCIAL GOAL", "What are you investing for?", "Retirement, children's education, buying a home, or financial freedom. Your goal defines your target amount and required return rate.", ACCENT_CYAN),
        ("PILLAR 2: RISK TOLERANCE", "How much volatility can you endure?", "Your ability and willingness to stay calm during market corrections without panic selling your investments.", ACCENT_AMBER),
        ("PILLAR 3: TIME HORIZON", "How long can your money stay invested?", "Short-term (< 3 yrs), medium (3-7 yrs), or long-term (7+ yrs). Long horizons smooth out market swings and unlock compounding.", ACCENT_EMERALD),
    ]
    y_p = 250
    for p_title, p_sub, p_desc, p_col in pillars:
        s7_draw.rounded_rectangle([(900, y_p), (1830, y_p + 210)], radius=16, fill=BG_CARD, outline=p_col, width=2)
        s7_draw.text((930, y_p + 20), p_title, fill=p_col, font=get_font(24, bold=True))
        s7_draw.text((930, y_p + 60), p_sub, fill=TEXT_WHITE, font=get_font(20, bold=True))
        s7_draw.text((930, y_p + 100), p_desc, fill=TEXT_MUTED, font=get_font(18))
        y_p += 235

    s7_path = os.path.join(output_dir, "scene7_three_pillars.png")
    s7_img.save(s7_path, "PNG")
    results["scene7_three_pillars"] = s7_path

    # -------------------------------------------------------------
    # SCENE 8: Presenter Summary & Golden Rule Outro HUD
    # -------------------------------------------------------------
    s8_hud = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    s8_draw = ImageDraw.Draw(s8_hud)

    # Top brand badge
    s8_draw.rounded_rectangle([(60, 40), (450, 100)], radius=12, fill=(11, 19, 43, 230), outline=ACCENT_CYAN, width=2)
    s8_draw.text((90, 54), "SMARTVEST ACADEMY", fill=ACCENT_CYAN, font=get_font(26, bold=True))

    # Bottom Golden Rule Banner
    s8_draw.rounded_rectangle([(60, 780), (1860, 990)], radius=20, fill=(11, 19, 43, 245), outline=ACCENT_CYAN, width=3)
    s8_draw.text((100, 810), "THE GOLDEN RULE OF SMARTVEST", fill=ACCENT_CYAN, font=get_font(22, bold=True))
    s8_draw.text((100, 850), "“Learn first. Invest with understanding.”", fill=TEXT_WHITE, font=get_font(44, bold=True))
    s8_draw.text((100, 920), "Save for short-term emergencies • Invest for long-term goals • Control risk through knowledge", fill=TEXT_MUTED, font=get_font(22))
    s8_draw.text((1480, 920), "Next: What is a Stock? →", fill=ACCENT_EMERALD, font=get_font(22, bold=True))

    s8_path = os.path.join(output_dir, "scene8_summary_outro.png")
    s8_hud.save(s8_path, "PNG")
    results["scene8_summary_outro"] = s8_path

    return results
