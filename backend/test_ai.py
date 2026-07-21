import ai_provider

def test_clean_json():
    raw = "```json\n{\"test\": 1}\n```"
    cleaned = ai_provider._clean_json_response(raw)
    assert cleaned == '{"test": 1}', f"Failed: {cleaned}"

def test_validate_schema():
    empty = {}
    validated = ai_provider._validate_schema(empty)
    assert validated["possible_attack"] == "None"
    assert validated["attack_confidence"] == 0
    assert validated["recommendation"] == "Exercise caution."

if __name__ == "__main__":
    test_clean_json()
    test_validate_schema()
    print("Tests passed!")
