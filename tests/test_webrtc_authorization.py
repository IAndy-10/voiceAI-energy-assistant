from voice_agent.webrtc_runner import _pipeline_mode


def test_runner_starts_ai_only_for_a_consumed_ai_grant_and_global_permission():
    assert _pipeline_mode("ai", True) == "ai"
    assert _pipeline_mode("ai", False) == "minimal"


def test_runner_keeps_the_minimal_pipeline_for_missing_invalid_or_minimal_grants():
    assert _pipeline_mode(None, True) == "minimal"
    assert _pipeline_mode("minimal", True) == "minimal"
