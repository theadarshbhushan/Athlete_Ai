from ml.prediction.injury_predictor import predict_injury_risk


def get_injury_prediction(
    training_load: float,
    prev_load: float,
    sleep_hours: float,
    soreness: int,
    pain_level: int = 0,
    resting_hr: int = 70,
    energy_level: int = 5,
) -> dict:
    return predict_injury_risk(
        training_load=training_load,
        prev_load=prev_load,
        sleep_hours=sleep_hours,
        soreness=soreness,
        pain_level=pain_level,
        resting_hr=resting_hr,
        energy_level=energy_level,
    )
