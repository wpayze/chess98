from enum import Enum

class TimeControl(str, Enum):
    bullet_1_0 = "1+0"
    bullet_2_1 = "2+1"
    blitz_3_0 = "3+0"
    blitz_3_2 = "3+2"
    blitz_5_0 = "5+0"
    blitz_5_5 = "5+5"
    rapid_10_0 = "10+0"
    rapid_10_5 = "10+5"
    classical_15_10 = "15+10"