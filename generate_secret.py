import secrets
import datetime

def generate_secret():
    # Generate a secure random hex token
    random_hex = secrets.token_hex(32)
    timestamp = datetime.datetime.now().strftime("%Y%m%d")
    return f"SmartTab_{random_hex}_FeedbackService_{timestamp}"

if __name__ == "__main__":
    print(generate_secret())
