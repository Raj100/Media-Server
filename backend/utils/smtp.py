import os
import smtplib
import argparse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from pydantic import EmailStr
from jose import jwt
from jinja2 import Environment, FileSystemLoader
from typing import Optional

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.app_base_url = os.getenv("APP_BASE_URL")
        
        self.template_env = Environment(
            loader=FileSystemLoader("templates/emails"),
            autoescape=True
        )
    def send_email(self, to_email: EmailStr, subject: str, body: str, is_html: bool = False, context:str = "" ) -> bool:
        msg = MIMEMultipart()
        msg['From'] = self.smtp_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach body
        if is_html:
            template = self.template_env.get_template(body)
            html_content = template.render(context)
            msg.attach(MIMEText(html_content, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()

                server.login(self.smtp_email, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False
    
    def send_reset_password_email(self, to_email: EmailStr, reset_link: str) -> bool:
        """
        Sends the password‐reset link. Expires in 1 hour by default (handled upstream).
        """
        context = {
            "email": to_email,
            "verification_url": reset_link,
            "expire_minutes": 15,
        }
        subject = "Reset Your Media Server Password"
        
        return self.send_email(
            to_email=to_email,
            subject=subject,
            body="fogot_password.html",
            is_html=True,
            context=context
        )