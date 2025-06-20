# Zero-Shot Text Classifier API (FastAPI + Transformers)

This project provides a zero-shot classification REST API using FastAPI and Hugging Face's `facebook/bart-large-mnli` model. It classifies input text into pre-defined categories.

---

## Project Structure

```
.
├── classifier_api.py       # FastAPI application
├── Dockerfile              # Docker build configuration
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

## Features

- Zero-shot classification using Hugging Face Transformers
- Built with FastAPI
- Dockerized for easy deployment
- RESTful API interface with JSON input/output
- Thread-safe model initialization

---

---

## Pre-requisites

### For Local Setup
- Python 3.8+
- pip

### For Docker
- Docker installed and running

---

## Running the API (Without Docker)

### 1. Clone the repository

```bash
cd classifier_api
````

### 2. Create a virtual environment (optional)

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the FastAPI server

```bash
uvicorn classifier_api:app --host 0.0.0.0 --port 50000
```

### 5. Test the API

Use `curl`:

```bash
curl -X POST http://localhost:50000/classify \
     -H "Content-Type: application/json" \
     -d '{"text": "Python is a powerful language for machine learning."}'
```

---

## Running with Docker

### 0. Prequisite
Make sure Docker is installed and running on your system.

- If Docker is not installed, download and install it from the official site:  
  [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

- After installation, verify Docker is working:

### 1. Build the Docker image

```bash
docker build -t classifier-api .
```

### 2. Run the container

```bash
docker run -p 50000:50000 classifier-api
```

### 3. Test the API (same as local)

```bash
curl -X POST http://localhost:50000/classify \
     -H "Content-Type: application/json" \
     -d '{"text": "I love to travel and explore different cultures."}'
```

---

## Testing with Postman

### Step-by-step:

1. Open **Postman**

2. Set the method to `POST`

3. Set the URL to:

   ```
   http://localhost:50000/classify
   ```

4. Go to the **Headers** tab and add:

   * `Content-Type`: `application/json`

5. Go to the **Body** tab:

   * Choose `raw`
   * Select `JSON` format
   * Paste this example:

     ```json
     {
       "text": "Python is a great programming language for AI applications."
     }
     ```

6. Click **Send**

### Sample Response:

```json
{
  "response": {
    "status": 200,
    "statusText": "OK",
    "categories": [
      {
        "label": "Programming",
        "score": 0.9812
      },
      {
        "label": "Science and Technology",
        "score": 0.7563
      },
      ...
    ]
  }
}
```

---

## API Reference

### `POST /classify`

* **Request Body**:

  ```json
  {
    "text": "Any input text to classify"
  }
  ```

* **Response**:

  * Top predicted categories with confidence scores
  * Sorted in descending order