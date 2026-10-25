import unittest
import urllib.error
import json

from server import (
    RequestError,
    gemini_connection_error,
    gemini_error_message,
    gemini_request,
    validate_request,
)


def sample_request():
    return {
        "consent": True,
        "question": "Make a development plan.",
        "profile": {
            "currentRole": "Analyst",
            "targetRole": "Senior AI Analyst",
            "careerGoals": "Grow into leadership",
            "skills": {"Data analysis": 2, "Communication": 3},
            "esgSkills": {"Sustainability": 2, "Compliance": 3},
        },
        "history": [{"role": "user", "text": "Suggest next steps."}],
    }


class CoachRequestTests(unittest.TestCase):
    def test_builds_context_without_employee_name(self):
        data = sample_request()
        data["profile"]["name"] = "Private Name"

        contents = validate_request(data)

        self.assertEqual(contents[0]["role"], "user")
        self.assertIn("User question", contents[-1]["parts"][0]["text"])
        self.assertIn("Sustainability", contents[-1]["parts"][0]["text"])
        self.assertNotIn("Private Name", contents[-1]["parts"][0]["text"])

    def test_rejects_request_without_consent(self):
        data = sample_request()
        data["consent"] = False

        with self.assertRaises(RequestError):
            validate_request(data)

    def test_rejects_unknown_skill_or_out_of_range_rating(self):
        data = sample_request()
        data["profile"]["skills"] = {"Unknown skill": 3}

        with self.assertRaises(RequestError):
            validate_request(data)

    def test_rejects_unknown_or_invalid_esg_rating(self):
        data = sample_request()
        data["profile"]["esgSkills"] = {"Unknown competency": 3}

        with self.assertRaises(RequestError):
            validate_request(data)

        data["profile"]["esgSkills"] = {"Sustainability": 6}
        with self.assertRaises(RequestError):
            validate_request(data)

    def test_rejects_invalid_target_role(self):
        data = sample_request()
        data["profile"]["targetRole"] = "Chief Executive"

        with self.assertRaises(RequestError):
            validate_request(data)

    def test_gemini_api_key_is_in_header_not_url(self):
        request = gemini_request(validate_request(sample_request()), "test-secret")
        payload = json.loads(request.data)

        self.assertNotIn("test-secret", request.full_url)
        self.assertEqual(request.get_header("X-goog-api-key"), "test-secret")
        self.assertEqual(
            payload["generationConfig"]["thinkingConfig"]["thinkingLevel"],
            "low",
        )
        self.assertEqual(payload["generationConfig"]["maxOutputTokens"], 700)

    def test_gemini_auth_error_is_actionable(self):
        message = gemini_error_message(
            403,
            '{"error":{"message":"API key not authorized for this API"}}',
        )

        self.assertIn("API is enabled", message)
        self.assertIn("API key not authorized", message)

    def test_gemini_quota_error_is_actionable(self):
        message = gemini_error_message(
            429,
            '{"error":{"message":"Quota exceeded"}}',
        )

        self.assertIn("quota limit", message)
        self.assertIn("Quota exceeded", message)

    def test_gemini_timeout_is_not_reported_as_general_network_failure(self):
        message = gemini_connection_error(
            urllib.error.URLError(TimeoutError("timed out"))
        )

        self.assertIn("180 seconds", message)
        self.assertIn("try again", message)


if __name__ == "__main__":
    unittest.main()
