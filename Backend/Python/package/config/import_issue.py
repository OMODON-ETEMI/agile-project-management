import pandas as pd 
from io import TextIOWrapper
import chardet

def import_issue(file, column_mapping: dict) -> list[dict]:
    """
    Imports issues from a CSV file, applies column mapping, and returns clean records.

    Args:
        file: File-like object (CSV)
        column_mapping: Dict of {CSV column -> internal DB field}

    Returns:
        List of cleaned issue dictionaries
    """
    try:
        def detect_encoding(file):
            raw_data = file.read(10000)
            result = chardet.detect(raw_data)
            print(f"Detected encoding: {result['encoding']}")
            file.seek(0)  
            return result['encoding']
        
        enconding = detect_encoding(file)
        if not enconding:
            raise ValueError("Could not detect file encoding")
        if enconding.lower() == 'ascii':
            enconding = 'cp1252'
            
        chunks = pd.read_csv(file, encoding=enconding, encoding_errors='ignore', chunksize=1000)    

        
        all_records = []
        for chunk in chunks:
            # Apply column mapping
            chunk.rename(columns=column_mapping, inplace=True)
            
            #drop unnamed columns
            # selected_col = [col for col in column_mapping.values() if col in chunk.columns]
            chunk = chunk[[col for col in column_mapping.values() if col in chunk.columns]]
            
            #clean Data
            cleaned = chunk.where(pd.notnull(chunk), None)
            
            # Convert to list of dicts
            rows = cleaned.to_dict(orient='records')
            all_records.extend(rows)
            
            pd.DataFrame(all_records).to_csv('processed_file.csv', index=False)
           
            
        
        return all_records
    except Exception as e:
        raise ValueError(f"Error importing issue data: {e}")