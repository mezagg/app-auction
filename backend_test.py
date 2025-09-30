#!/usr/bin/env python3
"""
Backend Testing Suite for Elite Auction Platform
Tests all backend API endpoints with realistic Spanish data
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://auctionhub-9.preview.emergentagent.com/api"
TIMEOUT = 30

class AuctionAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {
            "email": "carlos.mendoza@empresarial.mx",
            "full_name": "Carlos Mendoza García",
            "phone": "+52 81 1234 5678",
            "company": "Inversiones del Norte S.A. de C.V.",
            "password": "MiPassword123!"
        }
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response, error_message)"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if headers is None:
                headers = {}
            
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            headers["Content-Type"] = "application/json"
            
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=TIMEOUT)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=TIMEOUT)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=TIMEOUT)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=TIMEOUT)
            else:
                return False, None, f"Unsupported HTTP method: {method}"
            
            return True, response, ""
            
        except requests.exceptions.Timeout:
            return False, None, f"Request timeout after {TIMEOUT}s"
        except requests.exceptions.ConnectionError:
            return False, None, "Connection error - backend may be down"
        except Exception as e:
            return False, None, f"Request error: {str(e)}"

    def test_user_registration(self):
        """Test user registration endpoint"""
        print("\n=== Testing User Registration ===")
        
        success, response, error = self.make_request("POST", "/auth/register", self.test_user_data)
        
        if not success:
            self.log_result("User Registration", False, error)
            return False
        
        if response.status_code == 201 or response.status_code == 200:
            try:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("User Registration", True, f"Token received: {data['token_type']}")
                    return True
                else:
                    self.log_result("User Registration", False, "Missing token in response")
                    return False
            except json.JSONDecodeError:
                self.log_result("User Registration", False, "Invalid JSON response")
                return False
        elif response.status_code == 400:
            # User might already exist, try login instead
            print("   User may already exist, will try login...")
            return self.test_user_login()
        else:
            self.log_result("User Registration", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_user_login(self):
        """Test user login endpoint"""
        print("\n=== Testing User Login ===")
        
        login_data = {
            "email": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        
        success, response, error = self.make_request("POST", "/auth/login", login_data)
        
        if not success:
            self.log_result("User Login", False, error)
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("User Login", True, f"Login successful, token type: {data['token_type']}")
                    return True
                else:
                    self.log_result("User Login", False, "Missing token in response")
                    return False
            except json.JSONDecodeError:
                self.log_result("User Login", False, "Invalid JSON response")
                return False
        else:
            self.log_result("User Login", False, f"HTTP {response.status_code}: {response.text}")
            return False

    def test_get_auctions(self):
        """Test get all auctions endpoint"""
        print("\n=== Testing Get All Auctions ===")
        
        success, response, error = self.make_request("GET", "/auctions")
        
        if not success:
            self.log_result("Get All Auctions", False, error)
            return []
        
        if response.status_code == 200:
            try:
                auctions = response.json()
                if isinstance(auctions, list) and len(auctions) > 0:
                    self.log_result("Get All Auctions", True, f"Retrieved {len(auctions)} auctions")
                    
                    # Verify sample data companies
                    companies = [auction.get("company_name", "") for auction in auctions]
                    expected_companies = [
                        "Grupo Empresarial Monterrey",
                        "Hospital Regional San José", 
                        "Transportes del Norte"
                    ]
                    
                    found_companies = []
                    for expected in expected_companies:
                        for company in companies:
                            if expected in company:
                                found_companies.append(expected)
                                break
                    
                    if len(found_companies) >= 2:
                        print(f"   ✅ Sample companies found: {', '.join(found_companies)}")
                    else:
                        print(f"   ⚠️  Expected sample companies not fully found. Found: {companies}")
                    
                    return auctions
                else:
                    self.log_result("Get All Auctions", False, "No auctions returned or invalid format")
                    return []
            except json.JSONDecodeError:
                self.log_result("Get All Auctions", False, "Invalid JSON response")
                return []
        else:
            self.log_result("Get All Auctions", False, f"HTTP {response.status_code}: {response.text}")
            return []

    def test_get_auction_detail(self, auctions):
        """Test get auction detail endpoint"""
        print("\n=== Testing Get Auction Detail ===")
        
        if not auctions:
            self.log_result("Get Auction Detail", False, "No auctions available for testing")
            return
        
        auction_id = auctions[0].get("auction_id")
        if not auction_id:
            self.log_result("Get Auction Detail", False, "No auction_id found in auction data")
            return
        
        success, response, error = self.make_request("GET", f"/auctions/{auction_id}")
        
        if not success:
            self.log_result("Get Auction Detail", False, error)
            return
        
        if response.status_code == 200:
            try:
                auction = response.json()
                required_fields = ["title", "description", "company_name", "start_date", "end_date", "status"]
                missing_fields = [field for field in required_fields if field not in auction]
                
                if not missing_fields:
                    self.log_result("Get Auction Detail", True, f"Auction detail retrieved: {auction.get('title', 'Unknown')}")
                else:
                    self.log_result("Get Auction Detail", False, f"Missing fields: {missing_fields}")
            except json.JSONDecodeError:
                self.log_result("Get Auction Detail", False, "Invalid JSON response")
        else:
            self.log_result("Get Auction Detail", False, f"HTTP {response.status_code}: {response.text}")

    def test_get_auction_items(self, auctions):
        """Test get auction items endpoint"""
        print("\n=== Testing Get Auction Items ===")
        
        if not auctions:
            self.log_result("Get Auction Items", False, "No auctions available for testing")
            return []
        
        auction_id = auctions[0].get("auction_id")
        if not auction_id:
            self.log_result("Get Auction Items", False, "No auction_id found in auction data")
            return []
        
        success, response, error = self.make_request("GET", f"/auctions/{auction_id}/items")
        
        if not success:
            self.log_result("Get Auction Items", False, error)
            return []
        
        if response.status_code == 200:
            try:
                items = response.json()
                if isinstance(items, list):
                    self.log_result("Get Auction Items", True, f"Retrieved {len(items)} items for auction")
                    
                    # Check for expected categories
                    if items:
                        categories = [item.get("category", "") for item in items]
                        expected_categories = ["vehiculos", "camiones", "equipo_medico"]
                        found_categories = [cat for cat in expected_categories if cat in categories]
                        
                        if found_categories:
                            print(f"   ✅ Categories found: {', '.join(found_categories)}")
                        
                    return items
                else:
                    self.log_result("Get Auction Items", False, "Invalid response format")
                    return []
            except json.JSONDecodeError:
                self.log_result("Get Auction Items", False, "Invalid JSON response")
                return []
        else:
            self.log_result("Get Auction Items", False, f"HTTP {response.status_code}: {response.text}")
            return []

    def test_get_item_detail(self, items):
        """Test get item detail endpoint"""
        print("\n=== Testing Get Item Detail ===")
        
        if not items:
            self.log_result("Get Item Detail", False, "No items available for testing")
            return
        
        item_id = items[0].get("item_id")
        if not item_id:
            self.log_result("Get Item Detail", False, "No item_id found in item data")
            return
        
        success, response, error = self.make_request("GET", f"/items/{item_id}")
        
        if not success:
            self.log_result("Get Item Detail", False, error)
            return
        
        if response.status_code == 200:
            try:
                item = response.json()
                required_fields = ["name", "description", "category", "brand", "starting_price", "condition"]
                missing_fields = [field for field in required_fields if field not in item]
                
                if not missing_fields:
                    self.log_result("Get Item Detail", True, f"Item detail retrieved: {item.get('name', 'Unknown')}")
                else:
                    self.log_result("Get Item Detail", False, f"Missing fields: {missing_fields}")
            except json.JSONDecodeError:
                self.log_result("Get Item Detail", False, "Invalid JSON response")
        else:
            self.log_result("Get Item Detail", False, f"HTTP {response.status_code}: {response.text}")

    def test_search_auctions(self):
        """Test search auctions with filters"""
        print("\n=== Testing Search Auctions ===")
        
        # Test different search scenarios
        test_cases = [
            {"params": {"category": "vehiculos"}, "name": "Search by category (vehiculos)"},
            {"params": {"state": "Nuevo León"}, "name": "Search by state (Nuevo León)"},
            {"params": {"status": "proxima"}, "name": "Search by status (proxima)"},
            {"params": {"min_price": "100000", "max_price": "1000000"}, "name": "Search by price range"},
            {"params": {"category": "equipo_medico", "min_price": "2000000"}, "name": "Search medical equipment with min price"}
        ]
        
        for test_case in test_cases:
            params = test_case["params"]
            name = test_case["name"]
            
            # Build query string
            query_params = "&".join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/search/auctions?{query_params}"
            
            success, response, error = self.make_request("GET", endpoint)
            
            if not success:
                self.log_result(f"Search - {name}", False, error)
                continue
            
            if response.status_code == 200:
                try:
                    results = response.json()
                    if isinstance(results, list):
                        self.log_result(f"Search - {name}", True, f"Found {len(results)} results")
                    else:
                        self.log_result(f"Search - {name}", False, "Invalid response format")
                except json.JSONDecodeError:
                    self.log_result(f"Search - {name}", False, "Invalid JSON response")
            else:
                self.log_result(f"Search - {name}", False, f"HTTP {response.status_code}: {response.text}")

    def test_user_profile(self):
        """Test get user profile endpoint (requires authentication)"""
        print("\n=== Testing User Profile ===")
        
        if not self.auth_token:
            self.log_result("User Profile", False, "No authentication token available")
            return
        
        success, response, error = self.make_request("GET", "/user/profile")
        
        if not success:
            self.log_result("User Profile", False, error)
            return
        
        if response.status_code == 200:
            try:
                profile = response.json()
                required_fields = ["email", "full_name", "phone"]
                missing_fields = [field for field in required_fields if field not in profile]
                
                if not missing_fields:
                    self.log_result("User Profile", True, f"Profile retrieved for: {profile.get('full_name', 'Unknown')}")
                else:
                    self.log_result("User Profile", False, f"Missing fields: {missing_fields}")
            except json.JSONDecodeError:
                self.log_result("User Profile", False, "Invalid JSON response")
        elif response.status_code == 401:
            self.log_result("User Profile", False, "Authentication failed - invalid token")
        else:
            self.log_result("User Profile", False, f"HTTP {response.status_code}: {response.text}")

    def test_user_auctions(self):
        """Test get user auctions endpoint (requires authentication)"""
        print("\n=== Testing User Auctions ===")
        
        if not self.auth_token:
            self.log_result("User Auctions", False, "No authentication token available")
            return
        
        success, response, error = self.make_request("GET", "/user/auctions")
        
        if not success:
            self.log_result("User Auctions", False, error)
            return
        
        if response.status_code == 200:
            try:
                auctions = response.json()
                if isinstance(auctions, list):
                    self.log_result("User Auctions", True, f"Retrieved {len(auctions)} user auctions")
                else:
                    self.log_result("User Auctions", False, "Invalid response format")
            except json.JSONDecodeError:
                self.log_result("User Auctions", False, "Invalid JSON response")
        elif response.status_code == 401:
            self.log_result("User Auctions", False, "Authentication failed - invalid token")
        else:
            self.log_result("User Auctions", False, f"HTTP {response.status_code}: {response.text}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Elite Auction Platform Backend Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication tests
        auth_success = self.test_user_registration()
        if not auth_success:
            auth_success = self.test_user_login()
        
        # Core auction tests
        auctions = self.test_get_auctions()
        self.test_get_auction_detail(auctions)
        items = self.test_get_auction_items(auctions)
        self.test_get_item_detail(items)
        
        # Search tests
        self.test_search_auctions()
        
        # User profile tests (require authentication)
        if auth_success:
            self.test_user_profile()
            self.test_user_auctions()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {(self.results['passed'] / (self.results['passed'] + self.results['failed']) * 100):.1f}%")
        
        if self.results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = AuctionAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)