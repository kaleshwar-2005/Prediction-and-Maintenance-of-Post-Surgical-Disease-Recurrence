import argparse
import os
import io
import json
import urllib.request
import urllib.parse

def test_api(image_path):
    url = "http://127.0.0.1:8000/predict"
    
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    print(f"Sending {image_path} to {url}...")
    
    # Python's urllib is a bit verbose for multipart/form-data, 
    # but this avoids external dependencies like 'requests'.
    boundary = '---BOUNDARY'
    headers = {
        'Content-Type': f'multipart/form-data; boundary={boundary}'
    }

    try:
        with open(image_path, 'rb') as f:
            file_content = f.read()

        body = []
        body.append(f'--{boundary}'.encode())
        body.append(f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(image_path)}"'.encode())
        body.append('Content-Type: image/jpeg\r\n'.encode())
        body.append(file_content)
        body.append(f'\r\n--{boundary}--'.encode())
        
        data = b'\r\n'.join(body)
        
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        with urllib.request.urlopen(req) as response:
            result = json.load(response)
            print("Response:")
            print(json.dumps(result, indent=2))
            
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
    except urllib.error.URLError as e:
        print(f"Connection Error: {e.reason}")
        print("Is the server running? (uvicorn src.api.app:app --reload)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path", help="Path to an image file to test")
    args = parser.parse_args()
    
    test_api(args.image_path)
