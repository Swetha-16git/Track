"""
SMTP Email Utility
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config.settings import settings


def send_email(to_email: str, subject: str, body: str) -> None:
    """
    Sends an email using SMTP settings from .env (loaded via settings.py)
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP settings are missing. Please set SMTP_HOST/SMTP_USER/SMTP_PASSWORD in .env")

    msg = MIMEMultipart()
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
    server.starttls()
    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    server.send_message(msg)
    server.quit()