from __future__ import annotations

from typing import BinaryIO

import pandas as pd
from pandas.errors import EmptyDataError, ParserError


class CSVValidationError(ValueError):
    pass


def read_validated_csv(file_obj: BinaryIO) -> pd.DataFrame:
    try:
        df = pd.read_csv(file_obj)
    except EmptyDataError as exc:
        raise CSVValidationError("CSV file is empty.") from exc
    except ParserError as exc:
        raise CSVValidationError("CSV file could not be parsed.") from exc
    except UnicodeDecodeError as exc:
        raise CSVValidationError("CSV file encoding is not supported.") from exc

    if len(df.columns) == 0:
        raise CSVValidationError("CSV file has no columns.")

    if df.empty:
        raise CSVValidationError("CSV file has no data rows.")

    if df.dropna(how="all").empty:
        raise CSVValidationError("CSV file rows are empty.")

    if df.dropna(axis=1, how="all").empty:
        raise CSVValidationError("CSV file contains only missing values.")

    return df
