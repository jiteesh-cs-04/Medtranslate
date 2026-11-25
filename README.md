# MedTranslate AI

### AI-Powered Medical Document Understanding

MedTranslate AI is a web-based application designed to make medical documents easier to understand. It uses artificial intelligence to extract information from printed prescriptions and laboratory reports and present it in a more accessible, patient-friendly format.

The project combines document processing, Google Gemini AI, and DailyMed medicine information retrieval to help users understand the information already present in their medical documents.

> **Disclaimer:** MedTranslate is an educational project. It does not provide medical diagnoses, prescribe medicines, recommend dosage changes, or replace consultation with qualified healthcare professionals.

---

## About the Project

Medical prescriptions and laboratory reports often contain technical terminology, abbreviations, medicine information, and laboratory measurements that can be difficult for patients to interpret.

MedTranslate aims to simplify this experience by allowing users to upload supported medical documents and receive structured information with easy-to-understand explanations.

The application focuses on explaining existing document information rather than making independent medical decisions.

## Features

- **Medical Document Upload:** Upload printed prescriptions and laboratory reports.
- **AI Document Classification:** Identify whether an uploaded document is a prescription or laboratory report.
- **Information Extraction:** Extract explicitly written information from supported documents.
- **Medicine Information:** Retrieve publicly available medicine-label information through DailyMed.
- **Simple Explanations:** Generate patient-friendly explanations of extracted medicine information.
- **Language Selection:** Request explanations in a selected language.
- **Interactive Dashboard:** View extracted information and explanations in an organized interface.
- **Temporary File Processing:** Uploaded documents are processed temporarily and deleted after the request.

### Supported Documents

| Document type | Supported formats |
|---|---|
| Printed prescriptions | PDF, PNG, JPG, JPEG |
| Laboratory reports | PDF, PNG, JPG, JPEG |

Maximum upload size: **10 MB**.

Handwritten prescriptions are not included in the current supported scope.

---

## How It Works

MedTranslate follows a document-processing and AI-explanation workflow.

1. **Upload:** The user uploads a prescription or laboratory report.
2. **Validation:** The application validates the file format, size, and integrity.
3. **Document Processing:** PDF text is extracted where available, while scanned PDFs and images are prepared for AI processing.
4. **AI Classification:** Google Gemini identifies the document type.
5. **Information Extraction:** Relevant information explicitly present in the document is extracted into structured fields.
6. **Medicine Retrieval:** For prescription medicines, publicly available medicine-label information is retrieved through DailyMed where available.
7. **Explanation:** Extracted medicine information is converted into simpler language.
8. **Results:** The dashboard presents the extracted information, explanations, and available source links.

The application does not invent missing document information or independently classify laboratory values as normal or abnormal.

---

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Python |
| Web Framework | Flask |
| AI Model | Google Gemini API |
| Medicine Information | DailyMed |
| Document Processing | PyPDF, Pillow |
| Data Validation | Pydantic |
| Frontend | HTML, CSS, JavaScript |
| Testing | Pytest |
| Production Server | Gunicorn |

---

## Project Structure

```text
MedTranslate-AI/
│
├── app.py
├── requirements.txt
├── README.md
│
├── backend/
│   ├── __init__.py
│   ├── document_processor.py
│   ├── ai_processor.py
│   ├── medical_retriever.py
│   └── explanation_generator.py
│
├── static/
│   ├── css/
│   ├── js/
│   └── img/
│
├── templates/
│   ├── landing.html
│   ├── login.html
│   └── dashboard.html
│
└── tests/
    └── test_app.py
```

### Main Backend Modules

| File | Description |
|---|---|
| `app.py` | Flask application, routes, and API endpoints |
| `document_processor.py` | Document validation and preprocessing |
| `ai_processor.py` | Gemini-based document classification and extraction |
| `medical_retriever.py` | DailyMed medicine information retrieval |
| `explanation_generator.py` | Patient-friendly medicine explanations |

---

## Getting Started

Follow these instructions to run MedTranslate locally on Windows.

### Prerequisites

- Python 3.10 or newer
- Git
- Google Gemini API key
- Internet connection

### 1. Clone the Repository

Open PowerShell or the VS Code terminal:

```powershell
git clone https://github.com/rohityadav-RY/MedTranslate-AI.git
```

Navigate into the project directory:

```powershell
cd MedTranslate-AI
```

### 2. Create a Virtual Environment

```powershell
python -m venv .venv
```

### 3. Install Dependencies

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a file named `.env` in the project root, in the same folder as `app.py`.

Add your Gemini API configuration:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Replace `your_gemini_api_key` with your own API key.

You can obtain an API key through Google AI Studio:

https://aistudio.google.com/apikey

**Important:** Never upload your `.env` file or share your API key publicly.

### 5. Run the Application

Start the Flask application:

```powershell
.\.venv\Scripts\python.exe app.py
```

Open your browser and visit:

http://127.0.0.1:5000

MedTranslate should now be running locally.

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Demonstration sign-in page |
| `/dashboard` | Document upload and analysis dashboard |
| `/api/health` | Application health and AI configuration status |
| `/api/analyze` | Document analysis endpoint |

### API Usage

The document analysis endpoint accepts a `POST` request using multipart form data.

**Endpoint:**

`POST /api/analyze`

**Parameters:**

- `file` — PDF or supported image document.
- `language` — Optional explanation language.

The health endpoint can be accessed through:

`GET /api/health`

---

## Running Tests

The project includes automated tests using Pytest.

Run the test suite from the project root:

```powershell
.\.venv\Scripts\python.exe -m pytest tests
```

---

## Limitations and Safety

- MedTranslate is an educational demonstration, not a clinical decision-making system.
- The sign-in interface is a demonstration and does not provide real user authentication.
- AI-generated information can contain errors. Always verify extracted information against the original document.
- Medicine explanations are informational and should not replace advice from a doctor or pharmacist.
- The current backend does not independently determine whether laboratory values are normal or abnormal.
- Handwritten prescription interpretation is outside the current supported scope.
- AI processing requires a valid Gemini API key and internet connectivity.
- Use synthetic or sample documents for testing. Avoid uploading real patient records.

---

## Future Scope

Potential future improvements include:

- Improved document extraction accuracy.
- Expanded language support.
- More comprehensive laboratory report interpretation.
- Stronger authentication and user access controls.
- Improved automated testing and validation.
- Further accessibility and usability improvements.

---

## Repository

**GitHub:** https://github.com/rohityadav-RY/MedTranslate-AI

**Project Name:** MedTranslate AI

**Category:** Artificial Intelligence / Healthcare Technology

**Purpose:** Making medical documents easier to understand through AI-assisted explanations.

---

*Built as an educational project exploring artificial intelligence, document processing, and healthcare information accessibility.*
