from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import threading
import uvicorn

app = FastAPI()

# Define the candidate labels for zero-shot classification
CANDIDATE_LABELS = [
    'programming',
    'health_and_fitness',
    'travel',
    'food_and_cooking',
    'music',
    'sports',
    'fashion',
    'art_and_design',
    'business_and_entrepreneurship',
    'education',
    'photography',
    'gaming',
    'science_and_technology',
    'parenting',
    'politics',
    'environment_and_sustainability',
    'beauty_and_skincare',
    'literature',
]

# Global classifier instance and lock for thread safety
classifier_lock = threading.Lock()
classifier = None

class TextRequest(BaseModel):
    text: str

# Initialize the zero-shot classification pipeline
def initialize_classifier():
    global classifier
    with classifier_lock:
        if classifier is None:
            try:
                classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    framework="pt",
                    batch_size=4,
                )
                print("Classifier initialized successfully")
            except Exception as e:
                print(f"Classifier initialization failed: {e}")

# Get the classifier instance, initializing it if necessary
def get_classifier():
    global classifier
    if classifier is None:
        initialize_classifier()
    return classifier

# FastAPI startup event to initialize the classifier
@app.on_event("startup")
def startup_event():
    initialize_classifier()

# Define the API endpoints
@app.get("/", status_code=200)
def index():
    return {"response": {"status": 200, "statusText": "OK"}}

# Endpoint for zero-shot classification
@app.post("/classify", status_code=200)
def classify_text(request: TextRequest):
    try:
        global classifier
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Ensure the classifier is initialized
        clf = get_classifier()
        result = clf(request.text, CANDIDATE_LABELS)
        labels = result.get('labels', [])
        scores = result.get('scores', [])

        if not labels or not scores:
            raise HTTPException(status_code=500, detail="No labels or scores returned from classifier")
        
        # Check if labels and scores are returned
        categories = [
            {"label": label.capitalize().replace("_", " "), "score": score}
            for label, score in zip(labels, scores)
        ]

        sorted_categories = sorted(categories, key=lambda x: x["score"], reverse=True)
        return {"response": {"status": 200, "statusText": "OK", "categories": sorted_categories}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=50000, log_level="info")