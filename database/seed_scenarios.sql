-- Sample Scenarios for Coach AI Testing
-- Run this to populate the database with test scenarios

-- Scenario 1: Acute Chest Pain (Cardiology)
INSERT INTO scenarios (
    scenario_id,
    title,
    description,
    specialty,
    difficulty,
    status,
    patient_profile,
    dialogue_tree,
    learning_objectives,
    correct_diagnosis,
    differential_diagnoses,
    assessment_rubric,
    created_by
) VALUES (
    'scenario-chest-pain-001',
    'Acute Chest Pain in a 58-Year-Old Male',
    'A 58-year-old male presents to A&E with sudden onset severe chest pain. Practice history taking, risk assessment, and diagnosis of acute coronary syndrome.',
    'Cardiology',
    'intermediate',
    'published',
    '{
        "age": 58,
        "gender": "male",
        "name": "Mr. Robert Thompson",
        "presenting_complaint": "Severe chest pain for 2 hours",
        "voice_profile": {
            "accent": "British",
            "gender": "male",
            "emotional_state": "anxious"
        }
    }'::jsonb,
    '{
        "root": {
            "node_id": "greeting",
            "patient_says": "Doctor, I have this terrible pain in my chest. It started about 2 hours ago and it''s really worrying me.",
            "branches": {
                "pain_location": {
                    "triggers": ["where", "location", "chest"],
                    "patient_says": "It''s right here in the center of my chest, and it feels like a heavy pressure, like an elephant sitting on my chest.",
                    "next_nodes": ["pain_radiation"]
                },
                "pain_character": {
                    "triggers": ["what", "describe", "feel", "type"],
                    "patient_says": "It''s a crushing, heavy pain. I''ve never felt anything like this before. It''s constant and quite severe.",
                    "next_nodes": ["pain_severity"]
                },
                "associated_symptoms": {
                    "triggers": ["other symptoms", "nausea", "sweating", "breathing"],
                    "patient_says": "Yes, I''ve been feeling quite short of breath and I''m sweating a lot. I also feel a bit sick to my stomach.",
                    "next_nodes": ["risk_factors"]
                },
                "past_medical_history": {
                    "triggers": ["medical history", "conditions", "health problems"],
                    "patient_says": "I have high blood pressure and high cholesterol. I''ve been on medication for about 5 years now.",
                    "next_nodes": ["medications"]
                },
                "medications": {
                    "triggers": ["medication", "tablets", "pills", "drugs"],
                    "patient_says": "I take ramipril 5mg and atorvastatin 20mg daily. Oh, and aspirin 75mg.",
                    "next_nodes": ["social_history"]
                },
                "social_history": {
                    "triggers": ["smoke", "drink", "alcohol", "lifestyle"],
                    "patient_says": "I used to smoke about 20 cigarettes a day for 30 years, but I quit 2 years ago. I have a drink or two on weekends.",
                    "next_nodes": []
                }
            }
        }
    }'::jsonb,
    '["Recognize acute coronary syndrome presentation", "Assess cardiovascular risk factors", "Identify red flag symptoms", "Develop appropriate management plan"]'::jsonb,
    'Acute Myocardial Infarction (STEMI)',
    '["Unstable Angina", "Pulmonary Embolism", "Aortic Dissection", "GERD/Esophageal Spasm"]'::jsonb,
    '{
        "must_ask_questions": [
            "Pain location and radiation",
            "Pain character (crushing/pressure)",
            "Associated symptoms (SOB, nausea, sweating)",
            "Cardiovascular risk factors",
            "Past medical history",
            "Current medications",
            "Smoking history"
        ],
        "red_flags": [
            "Crushing chest pain",
            "Radiation to arm/jaw",
            "Shortness of breath",
            "Diaphoresis (sweating)",
            "Previous cardiac history"
        ],
        "expected_management": [
            "Immediate ECG",
            "Bloods including troponin",
            "Aspirin 300mg",
            "GTN spray",
            "Oxygen if sats <94%",
            "Call cardiology/cath lab"
        ]
    }'::jsonb,
    'system'
);

-- Scenario 2: Abdominal Pain (General Medicine/Surgery)
INSERT INTO scenarios (
    scenario_id,
    title,
    description,
    specialty,
    difficulty,
    status,
    patient_profile,
    dialogue_tree,
    learning_objectives,
    correct_diagnosis,
    differential_diagnoses,
    assessment_rubric,
    created_by
) VALUES (
    'scenario-abdo-pain-001',
    'Right Lower Quadrant Pain in a Young Woman',
    'A 24-year-old female presents with acute right-sided abdominal pain. Differentiate between surgical and medical causes.',
    'General Surgery',
    'beginner',
    'published',
    '{
        "age": 24,
        "gender": "female",
        "name": "Miss Sarah Johnson",
        "presenting_complaint": "Right-sided tummy pain since yesterday",
        "voice_profile": {
            "accent": "British",
            "gender": "female",
            "emotional_state": "uncomfortable"
        }
    }'::jsonb,
    '{
        "root": {
            "node_id": "greeting",
            "patient_says": "Hi doctor, I''ve had this pain in my tummy since yesterday and it''s getting worse.",
            "branches": {
                "pain_location": {
                    "triggers": ["where", "location", "point"],
                    "patient_says": "It started around my belly button but now it''s moved to the lower right side. It hurts when I press on it.",
                    "next_nodes": ["pain_character"]
                },
                "pain_character": {
                    "triggers": ["what", "describe", "feel", "type"],
                    "patient_says": "It''s a sharp pain that''s constant now. Any movement makes it worse. I tried to cough earlier and it was really painful.",
                    "next_nodes": ["associated_symptoms"]
                },
                "associated_symptoms": {
                    "triggers": ["other symptoms", "nausea", "fever", "vomiting"],
                    "patient_says": "I felt sick this morning and was sick once. I don''t have much of an appetite. I think I might have a slight temperature.",
                    "next_nodes": ["bowel_habits"]
                },
                "bowel_habits": {
                    "triggers": ["bowel", "poo", "diarr", "constipat"],
                    "patient_says": "My bowels have been normal. No diarrhea or constipation.",
                    "next_nodes": ["gynae_history"]
                },
                "gynae_history": {
                    "triggers": ["period", "menstrual", "pregnant", "gynae", "last period"],
                    "patient_says": "My last period was about 2 weeks ago, completely normal. I''m on the contraceptive pill. Definitely not pregnant.",
                    "next_nodes": ["past_history"]
                },
                "past_medical_history": {
                    "triggers": ["medical history", "conditions", "health problems", "operations"],
                    "patient_says": "I''m normally fit and healthy. Never had any operations or serious illnesses.",
                    "next_nodes": []
                }
            }
        }
    }'::jsonb,
    '["Evaluate acute abdominal pain", "Perform systematic history taking", "Consider gynecological differentials", "Recognize appendicitis presentation"]'::jsonb,
    'Acute Appendicitis',
    '["Ectopic Pregnancy", "Ovarian Cyst/Torsion", "Urinary Tract Infection", "Gastroenteritis", "Pelvic Inflammatory Disease"]'::jsonb,
    '{
        "must_ask_questions": [
            "Pain location and migration",
            "Pain character and severity",
            "Nausea/vomiting",
            "Fever",
            "Bowel habits",
            "Last menstrual period",
            "Pregnancy possibility",
            "Past surgical history"
        ],
        "red_flags": [
            "Migratory pain (central to RIF)",
            "Rebound tenderness",
            "Fever",
            "Anorexia",
            "Nausea/vomiting"
        ],
        "expected_management": [
            "Bloods: FBC, CRP, U&E",
            "Pregnancy test",
            "Urinalysis",
            "Keep nil by mouth",
            "IV access and fluids",
            "Analgesia",
            "Surgical referral"
        ]
    }'::jsonb,
    'system'
);

-- Scenario 3: Headache (Neurology)
INSERT INTO scenarios (
    scenario_id,
    title,
    description,
    specialty,
    difficulty,
    status,
    patient_profile,
    dialogue_tree,
    learning_objectives,
    correct_diagnosis,
    differential_diagnoses,
    assessment_rubric,
    created_by
) VALUES (
    'scenario-headache-001',
    'Severe Sudden-Onset Headache',
    'A 45-year-old presents with the worst headache of their life. Recognize red flags and manage appropriately.',
    'Neurology',
    'advanced',
    'published',
    '{
        "age": 45,
        "gender": "female",
        "name": "Mrs. Patricia Davies",
        "presenting_complaint": "Worst headache of my life",
        "voice_profile": {
            "accent": "British",
            "gender": "female",
            "emotional_state": "distressed"
        }
    }'::jsonb,
    '{
        "root": {
            "node_id": "greeting",
            "patient_says": "Doctor, I have the most awful headache. It came on so suddenly about an hour ago. I''ve never had anything like this before.",
            "branches": {
                "pain_onset": {
                    "triggers": ["when", "start", "sudden", "onset"],
                    "patient_says": "It was completely sudden. I was just making a cup of tea and suddenly felt this explosive pain in my head. The worst I''ve ever had.",
                    "next_nodes": ["pain_location"]
                },
                "pain_location": {
                    "triggers": ["where", "location"],
                    "patient_says": "It''s all over my head, but particularly bad at the back of my neck. It feels like my head is going to explode.",
                    "next_nodes": ["associated_symptoms"]
                },
                "associated_symptoms": {
                    "triggers": ["other symptoms", "vision", "nausea", "vomiting", "light", "neck"],
                    "patient_says": "I was sick twice. The light is bothering my eyes. And my neck feels quite stiff actually.",
                    "next_nodes": ["neurological_symptoms"]
                },
                "neurological_symptoms": {
                    "triggers": ["weakness", "numbness", "speech", "confusion", "seizure"],
                    "patient_says": "No, no weakness or numbness. I can speak fine as you can hear. No fits or anything like that.",
                    "next_nodes": ["headache_history"]
                },
                "headache_history": {
                    "triggers": ["headaches before", "migraine", "previous"],
                    "patient_says": "I occasionally get tension headaches from work stress, but nothing like this. This is completely different and much, much worse.",
                    "next_nodes": ["past_history"]
                },
                "past_medical_history": {
                    "triggers": ["medical history", "conditions", "health"],
                    "patient_says": "I have high blood pressure, for which I take amlodipine. Otherwise I''m healthy.",
                    "next_nodes": []
                }
            }
        }
    }'::jsonb,
    '["Identify thunderclap headache", "Recognize subarachnoid hemorrhage red flags", "Understand urgent neurological assessment", "Know appropriate emergency management"]'::jsonb,
    'Subarachnoid Hemorrhage',
    '["Meningitis", "Severe Migraine", "Intracerebral Hemorrhage", "Cerebral Venous Thrombosis"]'::jsonb,
    '{
        "must_ask_questions": [
            "Thunderclap onset (sudden, severe)",
            "Headache severity and character",
            "Neck stiffness",
            "Photophobia",
            "Vomiting",
            "Neurological symptoms",
            "Previous headache history",
            "Risk factors (hypertension, smoking)"
        ],
        "red_flags": [
            "Sudden severe headache (thunderclap)",
            "Worst headache ever",
            "Neck stiffness",
            "Photophobia",
            "Vomiting",
            "Altered consciousness"
        ],
        "expected_management": [
            "Immediate senior/neurology review",
            "Urgent CT head (non-contrast)",
            "If CT negative: LP for xanthochromia",
            "Bloods including clotting",
            "IV access",
            "Keep NBM",
            "Neurosurgical referral if SAH confirmed"
        ]
    }'::jsonb,
    'system'
);

-- Update the counts
SELECT COUNT(*) as total_scenarios FROM scenarios;
