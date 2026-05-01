from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load models
pancreatic_model = joblib.load('models/canary_pancreatic_model.pkl')
pancreatic_features = joblib.load('models/pancreatic_feature_names.pkl')

colon_model = joblib.load('models/canary_colon_model.pkl')
colon_features = joblib.load('models/colon_feature_names.pkl')

blood_model = joblib.load('models/canary_blood_model.pkl')
blood_labels = joblib.load('models/blood_label_encoder.pkl')

@app.route('/')
def home():
    return jsonify({'status': 'CANary API running ✅'})

@app.route('/predict/pancreatic', methods=['POST'])
def predict_pancreatic():
    data = request.json
    features = [
        data.get('age', 0),
        1 if data.get('sex', 'M') == 'M' else 0,
        data.get('plasma_CA19_9', 0),
        data.get('creatinine', 0),
        data.get('LYVE1', 0),
        data.get('REG1B', 0),
        data.get('TFF1', 0),
        data.get('REG1A', 0)
    ]
    prob = pancreatic_model.predict_proba([features])[0]
    return jsonify({
        'cancer_probability': round(float(prob[1]) * 100, 1),
        'no_cancer_probability': round(float(prob[0]) * 100, 1),
        'prediction': 'Cancer Detected' if prob[1] > 0.5 else 'No Cancer Detected'
    })

@app.route('/predict/colon', methods=['POST'])
def predict_colon():
    data = request.json
    features = [data.get(f, 0) for f in colon_features]
    prob = colon_model.predict_proba([features])[0]
    return jsonify({
        'malignant_probability': round(float(prob[1]) * 100, 1),
        'benign_probability': round(float(prob[0]) * 100, 1),
        'prediction': 'Malignant' if prob[1] > 0.5 else 'Benign'
    })

@app.route('/predict/blood', methods=['POST'])
def predict_blood():
    data = request.json
    features = [
        data.get('hemoglobin', 0),
        data.get('wbc', 0),
        data.get('rbc', 0),
        data.get('hematocrit', 0),
        data.get('mcv', 0),
        data.get('mch', 0),
        data.get('mchc', 0),
        data.get('platelet_count', 0),
        data.get('rdw', 0)
    ]
    prob = blood_model.predict_proba([features])[0]
    pred_idx = np.argmax(prob)
    return jsonify({
        'severity': blood_labels[pred_idx],
        'probabilities': {
            blood_labels[i]: round(float(prob[i]) * 100, 1)
            for i in range(len(blood_labels))
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
