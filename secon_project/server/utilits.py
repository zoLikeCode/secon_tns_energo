import pandas as pd
import random
import string

def normalize_to_str(value):
    try:
        f = float(value)
        i = int(f)
        if f == i:
            return str(i)
        else:
            return str(f)
    except (ValueError, TypeError):
        return str(value)
    
def generate_password(length=8):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))