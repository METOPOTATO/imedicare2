import os
import shutil
from datetime import datetime

def create_folder_if_not_exist(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"Folder '{folder_path}' created successfully.")
    else:
        print(f"Folder '{folder_path}' already exists.")

def copy_file():
    source_file = 'db.sqlite3'
    # destination_folder = '/home/light/Desktop/Projects/imedicare2/mbackup/'
    destination_folder = '/home/imedicare/Cofee/backup'
    # Tạo thư mục đích nếu chưa tồn tại
    create_folder_if_not_exist(destination_folder)

    try:
        shutil.copy(source_file, destination_folder)
        print(f"{datetime.now()}: File copied successfully.")
    except Exception as e:
        print(f"{datetime.now()}: Error copying file - {e}")

if __name__ == "__main__":
    copy_file()


