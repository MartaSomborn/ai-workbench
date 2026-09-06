from pathlib import Path

import numpy as np
import pandas as pd


# Make the dataset reproducible.
# Every time we run the script, we get the same data.
RANDOM_SEED = 42

# Number of rows to generate.
N_ROWS = 10_000


def generate_dataset(n_rows: int = N_ROWS) -> pd.DataFrame:
    rng = np.random.default_rng(RANDOM_SEED)

    # Generate hourly timestamps.
    timestamps = pd.date_range(
        start="2026-01-01",
        periods=n_rows,
        freq="h",
    )

    # Convert pandas datetime information to NumPy arrays.
    # This makes the values mutable and avoids pandas Index issues.
    hour = timestamps.hour.to_numpy()
    day_of_week = timestamps.dayofweek.to_numpy()
    day_of_year = timestamps.dayofyear.to_numpy()

    # -------------------------
    # Temperature
    # -------------------------
    # Temperature has:
    # - seasonal variation
    # - daily variation
    # - random noise
    seasonal_temperature = 10 + 12 * np.sin(
        2 * np.pi * (day_of_year - 80) / 365
    )

    daily_temperature = 4 * np.sin(
        2 * np.pi * (hour - 8) / 24
    )

    temperature = (
        seasonal_temperature
        + daily_temperature
        + rng.normal(0, 2, n_rows)
    )

    # -------------------------
    # Humidity
    # -------------------------
    # Humidity is somewhat negatively related
    # to temperature, with some random variation.
    humidity = (
        65
        - 0.7 * temperature
        + rng.normal(0, 5, n_rows)
    )

    # Keep humidity in a realistic range.
    humidity = np.clip(humidity, 25, 95)

    # -------------------------
    # Occupancy
    # -------------------------
    # Higher occupancy during working hours
    # on weekdays.
    working_hours = (
        (hour >= 8)
        & (hour <= 18)
        & (day_of_week < 5)
    )

    occupancy = np.where(
        working_hours,
        rng.normal(45, 10, n_rows),
        rng.normal(8, 4, n_rows),
    )

    # Occupancy cannot be negative or above 100.
    occupancy = np.clip(occupancy, 0, 100)

    # -------------------------
    # Energy consumption
    # -------------------------
    # Energy consumption depends on:
    # - baseline consumption
    # - temperature
    # - occupancy
    # - humidity
    # - random noise
    #
    # This creates relationships that our
    # analytics engine can discover later.
    energy_consumption = (
        250
        + 8 * np.abs(temperature - 18)
        + 4 * occupancy
        + 0.8 * humidity
        + rng.normal(0, 25, n_rows)
    )

    # -------------------------
    # Add anomalies
    # -------------------------
    # Create 20 unusual observations where
    # energy consumption suddenly increases.
    anomaly_indices = rng.choice(
        n_rows,
        size=20,
        replace=False,
    )

    energy_consumption[anomaly_indices] *= rng.uniform(
        1.8,
        2.5,
        size=len(anomaly_indices),
    )

    # -------------------------
    # Create DataFrame
    # -------------------------
    df = pd.DataFrame(
        {
            "timestamp": timestamps,
            "temperature": np.round(temperature, 2),
            "humidity": np.round(humidity, 2),
            "energy_consumption": np.round(
                energy_consumption,
                2,
            ),
            "occupancy": np.round(occupancy, 0).astype(int),
        }
    )

    # -------------------------
    # Add missing values
    # -------------------------
    # Deliberately introduce a small amount
    # of missing data so our application can
    # demonstrate data-quality checks.
    for column in ["temperature", "humidity"]:
        missing_indices = rng.choice(
            n_rows,
            size=10,
            replace=False,
        )

        df.loc[missing_indices, column] = np.nan

    return df


def main() -> None:
    df = generate_dataset()

    # Save the generated dataset next to this script.
    output_path = Path(__file__).parent / "sample_energy.csv"

    df.to_csv(output_path, index=False)

    print(f"Generated {len(df):,} rows.")
    print(f"Saved to: {output_path}")
    print()
    print("First 5 rows:")
    print(df.head())
    print()
    print("Missing values:")
    print(df.isna().sum())


if __name__ == "__main__":
    main()