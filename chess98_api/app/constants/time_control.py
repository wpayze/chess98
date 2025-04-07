from enum import Enum

class TimeControl(str, Enum):
    bullet_1_0 = "1+0"
    bullet_1_1 = "1+1"
    bullet_2_1 = "2+1"
    blitz_3_0 = "3+0"
    blitz_3_2 = "3+2"
    blitz_5_0 = "5+0"
    rapid_10_0 = "10+0"
    rapid_10_5 = "10+5"
    rapid_15_10 = "15+10"
    classical_30_0 = "30+0"
    classical_30_20 = "30+20"
    classical_30_30 = "30+30"