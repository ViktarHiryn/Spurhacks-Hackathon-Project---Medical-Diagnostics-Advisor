#!/usr/bin/env python3
"""
Test script for the Medical AI Chat Backend
"""

import requests
import json
import time

# API endpoints
BASE_URL = "http://localhost:8000"
CHAT_ENDPOINT = f"{BASE_URL}/api/chat"
TEST_ENDPOINT = f"{BASE_URL}/api/test-gemini"
HEALTH_ENDPOINT = f"{BASE_URL}/"

def test_health_check():
    """Test if the server is running"""
    print("🏥 Testing health check...")
    try:
        response = requests.get(HEALTH_ENDPOINT, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['message']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_gemini_connection():
    """Test Gemini API connection"""
    print("\n🤖 Testing Gemini connection...")
    try:
        response = requests.get(TEST_ENDPOINT, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Gemini connection successful")
                print(f"📝 Response: {data['response']}")
                return True
            else:
                print(f"❌ Gemini connection failed: {data.get('error')}")
                return False
        else:
            print(f"❌ Gemini test failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Gemini test failed: {e}")
        return False

def test_chat_message(message):
    """Test sending a chat message"""
    print(f"\n💬 Testing chat message: '{message}'")
    try:
        payload = {
            "message": message,
            "user_id": "test_user"
        }
        
        response = requests.post(
            CHAT_ENDPOINT, 
            json=payload, 
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Chat message successful")
                print(f"🤖 AI Response: {data['response'][:200]}...")
                return True
            else:
                print(f"❌ Chat message failed: {data.get('error')}")
                return False
        else:
            print(f"❌ Chat request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat request failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Medical AI Backend Test Suite")
    print("=" * 40)
    
    # Test 1: Health check
    if not test_health_check():
        print("\n❌ Server is not running. Start the backend first:")
        print("cd backend && python main.py")
        return
    
    # Test 2: Gemini connection
    if not test_gemini_connection():
        print("\n❌ Gemini API is not working. Check your .env file:")
        print("Make sure GEMINI_API_KEY is set correctly")
        return
    
    # Test 3: Chat messages
    test_messages = [
        "Hello, how are you?",
        "I have a headache, what should I do?",
        "What are the symptoms of the flu?",
        "Can you help me with my medication schedule?"
    ]
    
    success_count = 0
    for message in test_messages:
        if test_chat_message(message):
            success_count += 1
        time.sleep(1)  # Small delay between requests
    
    # Results
    print(f"\n📊 Test Results:")
    print(f"✅ Successful chat tests: {success_count}/{len(test_messages)}")
    
    if success_count == len(test_messages):
        print("\n🎉 All tests passed! Your backend is working correctly.")
        print("\nNext steps:")
        print("1. Start your React frontend")
        print("2. Try chatting with the AI doctor")
        print("3. Check that responses appear in the chat interface")
    else:
        print(f"\n⚠️  Some tests failed. Check the backend logs for errors.")

if __name__ == "__main__":
    main() 