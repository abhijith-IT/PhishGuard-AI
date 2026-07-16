# 🛡️ PhishGuard AI

An AI-powered phishing detection system that analyzes emails, SMS messages, and URLs using **Google Gemini AI** with a **rule-based fallback mechanism**. The application helps users identify phishing attempts, maintain analysis history, and generate downloadable PDF reports.

---

## 📌 Problem Statement

Phishing attacks are one of the most common cybersecurity threats. Many users struggle to distinguish between legitimate and malicious messages, leading to credential theft, financial loss, and data breaches.

PhishGuard AI addresses this problem by providing intelligent phishing detection using Large Language Models (LLMs) while ensuring uninterrupted service through a rule-based fallback system.

---

# ✨ Features

- 🔍 AI-powered phishing detection using Google Gemini
- 🛡️ Automatic rule-based fallback when AI service is unavailable
- 📊 Risk level prediction (Low / Medium / High)
- 📈 Confidence score for every analysis
- 📝 Detailed reasons explaining the prediction
- 💡 Security recommendations
- 📚 Analysis history stored using SQLite
- 📄 Downloadable PDF reports
- 🐳 Dockerized backend and frontend
- ⚙️ Environment variable configuration
- 🔄 Auto-refreshing history after every analysis

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- CSS

## Backend

- FastAPI
- Python

## Database

- SQLite
- SQLAlchemy

## AI

- Google Gemini API
- Rule-Based Phishing Detection

## Reporting

- ReportLab

## Deployment

- Docker
- Docker Compose

---

# 📂 Project Structure

```
PhishGuard-AI
│
├── frontend
│   ├── src
│   ├── public
│   ├── Dockerfile
│   └── package.json
│
├── backend
│   ├── main.py
│   ├── detector.py
│   ├── crud.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── report.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/PhishGuard-AI.git
cd PhishGuard-AI
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows

```powershell
.venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file

```env
GEMINI_API_KEY=YOUR_API_KEY
DATABASE_URL=sqlite:///./phishguard.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Run Backend

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🐳 Docker

Run the complete application

```bash
docker compose up --build
```

Frontend

```
http://localhost:3000
```

Backend

```
http://localhost:8000
```

Swagger API

```
http://localhost:8000/docs
```

---

# 📡 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Health Check |
| POST | `/analyze` | Analyze phishing message |
| GET | `/history` | Retrieve analysis history |
| POST | `/download-report` | Generate PDF report |

---

# 🔄 System Workflow

1. User enters an Email, SMS, or URL.
2. React sends the request to FastAPI.
3. FastAPI attempts analysis using Google Gemini.
4. If Gemini is unavailable, the Rule-Based Detector is used.
5. Result is stored in SQLite.
6. History is automatically refreshed.
7. User can download a PDF report.

---

# 📸 Screenshots

## Home Page

<img width="448" height="705" alt="image" src="https://github.com/user-attachments/assets/79905133-9a27-409a-b516-446bbd986056" />


---

## Phishing Detection

<img width="459" height="904" alt="image" src="https://github.com/user-attachments/assets/6ec7daa5-6985-4553-8a70-806e679b5d3a" />


---

## History
<img width="456" height="914" alt="image" src="https://github.com/user-attachments/assets/f7266334-b3cc-4a4a-b107-ad056c4b7e36" />


---

## PDF Report
<img width="742" height="777" alt="image" src="https://github.com/user-attachments/assets/fcd8fd52-f2a5-4837-8c2d-45052de4b99c" />


---

## Docker

<img width="1625" height="902" alt="image" src="https://github.com/user-attachments/assets/f4d32689-864b-41b6-9673-89a322c19df1" />


---

# 🔒 Security Features

- Input validation using Pydantic
- Environment variable configuration
- Automatic AI fallback
- CORS protection
- SQLite persistent storage
- Structured API responses

---

# 🚀 Future Enhancements

- Multi-language phishing detection
- Browser extension
- Email inbox integration
- User authentication
- Threat intelligence integration
- Machine Learning model fine-tuning
- Cloud deployment (AWS/Azure)

---

# 👨‍💻 Team

**Abhijith**

Government Engineering College Barton Hill

Department of Information Technology

---

# 📜 License

This project is developed for educational and internship purposes.

---

# 🙏 Acknowledgements

- Google Gemini AI
- FastAPI
- React
- SQLAlchemy
- ReportLab
- Docker
