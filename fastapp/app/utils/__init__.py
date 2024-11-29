import asyncio
from .cbv import cbv
from .pagination import paginate

from decimal import Decimal
from typing import Union

class Precision:
    precision: int
    min_move: float
    def __init__(self, precision: int, min_move: float):
        self.precision = precision
        self.min_move = min_move


def get_precision_and_minmove(number: Union[float, str]) -> Precision:
    """
    Tính precision và min_move của một số.
    
    :param number: Số đầu vào, dạng float hoặc string.
    :return: Dictionary chứa precision (số chữ số thập phân) và min_move (bước nhảy nhỏ nhất).
    """
    # Chuyển đổi số sang kiểu Decimal để tính chính xác
    dec_number = Decimal(str(number))
    
    # Tính precision (số chữ số thập phân)
    if dec_number == dec_number.to_integral():
        precision = 0  # Nếu là số nguyên
    else:
        precision = abs(dec_number.as_tuple().exponent)
    
    # Tính min_move dựa trên precision 
    min_move = 10 ** -precision
    
    return Precision(precision, min_move)


async def keepAlive(max: int=None):
    """
    Giữ cho chương trình sống
    """
    # print("max=", max)
    count = 0
    while count != max:
        count+=1
        # print(count)
        await asyncio.sleep(10)
        