from typing import Optional

from pydantic import BaseModel


class AnalyticsDateRange(BaseModel):
    days: Optional[int] = 30
    weeks: Optional[int] = 8
