#!/usr/bin/env python3
"""Build the public, privacy-reviewed Chinese and English résumé PDFs."""

import json
from pathlib import Path
from xml.sax.saxutils import escape

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
CONTENT = json.loads((ROOT / "public/content/site.json").read_text(encoding="utf-8"))
OUTPUT = ROOT / "public/downloads"

pdfmetrics.registerFont(TTFont("ResumeCN", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"))
pdfmetrics.registerFont(TTFont("ResumeEN", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("ResumeENBold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))

INK = colors.HexColor("#192023")
SOFT = colors.HexColor("#4e5b60")
GREEN = colors.HexColor("#31594c")
LINE = colors.HexColor("#c8d4ce")


def translation(value, locale):
    return value[locale]


def build(locale, filename):
    is_chinese = locale == "zh"
    font = "ResumeCN" if is_chinese else "ResumeEN"
    bold_font = "ResumeCN" if is_chinese else "ResumeENBold"
    style = {
        "name": ParagraphStyle(
            "name", fontName=bold_font, fontSize=25, leading=30, textColor=INK, spaceAfter=1
        ),
        "role": ParagraphStyle(
            "role", fontName=bold_font, fontSize=10.5, leading=15, textColor=GREEN
        ),
        "contact": ParagraphStyle(
            "contact", fontName=font, fontSize=8.3, leading=12, textColor=SOFT
        ),
        "section": ParagraphStyle(
            "section", fontName=bold_font, fontSize=10.2, leading=15,
            textColor=GREEN, spaceBefore=11, spaceAfter=5
        ),
        "heading": ParagraphStyle(
            "heading", fontName=bold_font, fontSize=9.1, leading=13,
            textColor=INK, spaceAfter=2, wordWrap="CJK" if is_chinese else None
        ),
        "period": ParagraphStyle(
            "period", fontName=font, fontSize=8.4, leading=13,
            textColor=SOFT, alignment=TA_RIGHT
        ),
        "body": ParagraphStyle(
            "body", fontName=font, fontSize=8.7, leading=13.1,
            textColor=SOFT, spaceAfter=4, wordWrap="CJK" if is_chinese else None
        ),
    }

    def paragraph(value, kind="body"):
        return Paragraph(escape(value), style[kind])

    def section(value):
        story.append(paragraph(value, "section"))

    def entry(title, period, body):
        row = Table(
            [[paragraph(title, "heading"), paragraph(period, "period")]],
            colWidths=[395, 120],
            hAlign="LEFT",
        )
        row.setStyle(TableStyle([
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(row)
        story.append(paragraph(body))

    profile = CONTENT["profile"]
    story = [
        paragraph(translation(profile["name"], locale), "name"),
        paragraph(translation(profile["role"], locale), "role"),
        Spacer(1, 4),
        paragraph(
            f'{profile["email"]}   |   linkedin.com/in/qianmeihan   |   github.com/qianmeihan',
            "contact",
        ),
        Spacer(1, 8),
        HRFlowable(width="100%", thickness=1, color=LINE),
    ]

    section("职业概述" if is_chinese else "PROFILE")
    story.append(paragraph(
        "约 4 年机械结构设计与产品开发经验，熟悉冲压、压铸和注塑件开发、图纸输出、技术评审与量产问题闭环。"
        if is_chinese else
        "Mechanical and product engineer with approximately four years of structural development experience across stamped, die-cast, and injection-molded components, technical reviews, and production support."
    ))

    section("工作经历" if is_chinese else "EXPERIENCE")
    for item in CONTENT["experience"]:
        title = translation(item["role"], locale)
        if item["id"] == "bmw-brilliance-product-engineer":
            title += "  |  " + translation(item["context"], locale)
        entry(title, translation(item["period"], locale), translation(item["summary"], locale))

    section("代表项目" if is_chinese else "SELECTED PROJECTS")
    for item in CONTENT["projects"]:
        entry(translation(item["title"], locale), item["code"], translation(item["summary"], locale))

    section("公开专利" if is_chinese else "PUBLISHED PATENT")
    patent = CONTENT["patents"][0]
    entry(
        translation(patent["title"], locale),
        patent["number"],
        translation(patent["summary"], locale),
    )

    section("教育经历" if is_chinese else "EDUCATION")
    for item in CONTENT["education"]:
        entry(
            translation(item["institution"], locale),
            translation(item["period"], locale),
            translation(item["degree"], locale),
        )

    section("专业能力" if is_chinese else "SKILLS")
    skills = (
        "结构设计：冲压、压铸、注塑、安装与绝缘结构；方法与工具：GD&T、尺寸链、热分析、模流协同、CATIA、Creo、AutoCAD；语言：中文、英语、法语 B2。"
        if is_chinese else
        "Structures: stamped, die-cast, and molded components; Methods: GD&T, tolerance chains, thermal and mold-flow coordination; Tools: CATIA, Creo, AutoCAD; Languages: Chinese, English, French B2."
    )
    story.append(paragraph(skills))

    path = OUTPUT / filename
    doc = SimpleDocTemplate(
        str(path), pagesize=A4, leftMargin=40, rightMargin=40, topMargin=34, bottomMargin=30,
        title=f'Meihan Qian - {"Chinese" if is_chinese else "English"} Resume',
        author="Meihan Qian",
    )
    doc.build(story)
    if len(PdfReader(path).pages) != 1:
        raise RuntimeError(f"Expected one page: {path}")
    print(path)


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    build("zh", "meihan-qian-resume.pdf")
    build("en", "meihan-qian-resume-en.pdf")
