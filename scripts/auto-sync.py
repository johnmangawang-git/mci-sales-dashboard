import os
import time
import requests
import pandas as pd
from supabase import create_client, Client

# Configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
WATCH_FOLDER = os.environ.get('WATCH_FOLDER', './data')
UPLOAD_INTERVAL = 21600  # 6 hours in seconds

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_latest_file(folder):
    """Get the most recent Excel file in the folder"""
    files = [os.path.join(folder, f) for f in os.listdir(folder) 
             if f.endswith(('.xlsx', '.csv'))]
    return max(files, key=os.path.getctime) if files else None

def process_and_upload(file_path):
    """Process Excel file and upload to Supabase"""
    try:
        # Read the file
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
        else:
            df = pd.read_csv(file_path)
            
        # Transform data
        df['created_at'] = pd.to_datetime('now')
        df['updated_at'] = pd.to_datetime('now')
        
        # Convert to list of dictionaries
        records = df.to_dict('records')
        
        # Upload to Supabase
        response = supabase.table('sales_data').insert(records).execute()
        
        print(f"Uploaded {len(records)} records from {file_path}")
        return True
        
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

def main():
    """Main function to monitor folder and upload files"""
    print("Starting auto-sync process...")
    
    while True:
        latest_file = get_latest_file(WATCH_FOLDER)
        if latest_file:
            success = process_and_upload(latest_file)
            if success:
                # Move or archive the file after processing
                archive_path = os.path.join(WATCH_FOLDER, 'processed', os.path.basename(latest_file))
                os.makedirs(os.path.dirname(archive_path), exist_ok=True)
                os.rename(latest_file, archive_path)
        
        time.sleep(UPLOAD_INTERVAL)

if __name__ == "__main__":
    main()