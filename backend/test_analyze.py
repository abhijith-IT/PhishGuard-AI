import requests
import sqlite3

def run_test():
    url = "http://127.0.0.1:8000/analyze"
    payload = {
        "text": "Dear user, please reset your Microsoft password immediately at http://fake-microsoft-login.com"
    }
    
    print("Sending request to /analyze...")
    resp = requests.post(url, json=payload)
    if resp.status_code != 200:
        print("Error:", resp.text)
        return
        
    data = resp.json()
    print("Response from /analyze:")
    print("attack_type:", data.get("attack_type"))
    print("target_brand:", data.get("target_brand"))
    
    print("\nQuerying DB for latest record...")
    conn = sqlite3.connect("phishguard.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, message, timestamp, processing_time, attack_type, target_brand FROM analysis ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    print(f"Latest DB record ID {row[0]}:")
    print("timestamp:", row[2])
    print("processing_time:", row[3])
    print("attack_type:", row[4])
    print("target_brand:", row[5])
    
    conn.close()

if __name__ == "__main__":
    run_test()
