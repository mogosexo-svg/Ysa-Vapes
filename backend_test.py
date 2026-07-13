#!/usr/bin/env python3
"""
Backend API Test Suite for Cloud District Vape Shop
Tests all endpoints with proper authentication and data validation
"""

import requests
import json
import sys
from datetime import datetime

# Load base URL from .env
BASE_URL = "https://cloud-vape-hub.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@clouddistrict.com"
ADMIN_PASSWORD = "admin123"

# Global token storage
auth_token = None
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def log_result(test_name, passed, message=""):
    """Log test result"""
    if passed:
        test_results["passed"].append(test_name)
        print(f"✅ {test_name}: PASSED {message}")
    else:
        test_results["failed"].append(test_name)
        print(f"❌ {test_name}: FAILED - {message}")

def log_warning(test_name, message):
    """Log warning"""
    test_results["warnings"].append(f"{test_name}: {message}")
    print(f"⚠️  {test_name}: WARNING - {message}")

def make_request(method, endpoint, data=None, auth=False, expect_status=200):
    """Make HTTP request with optional auth"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if auth and auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            return None, f"Unknown method: {method}"
        
        if response.status_code != expect_status:
            return None, f"Expected status {expect_status}, got {response.status_code}. Response: {response.text[:200]}"
        
        return response.json(), None
    except requests.exceptions.Timeout:
        return None, "Request timeout"
    except requests.exceptions.RequestException as e:
        return None, f"Request error: {str(e)}"
    except json.JSONDecodeError:
        return None, f"Invalid JSON response: {response.text[:200]}"

# ============ TEST SUITE ============

def test_auth_login():
    """Test POST /api/auth/login"""
    global auth_token
    
    # Test successful login
    data, error = make_request("POST", "/auth/login", {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    
    if error:
        log_result("AUTH: Login (valid credentials)", False, error)
        return False
    
    if not data.get("token"):
        log_result("AUTH: Login (valid credentials)", False, "No token in response")
        return False
    
    if data.get("email") != ADMIN_EMAIL:
        log_result("AUTH: Login (valid credentials)", False, f"Email mismatch: {data.get('email')}")
        return False
    
    if not data.get("role"):
        log_result("AUTH: Login (valid credentials)", False, "No role in response")
        return False
    
    auth_token = data["token"]
    log_result("AUTH: Login (valid credentials)", True, f"Token: {auth_token[:20]}...")
    
    # Test wrong password
    data, error = make_request("POST", "/auth/login", {
        "email": ADMIN_EMAIL,
        "password": "wrongpassword"
    }, expect_status=401)
    
    if error:
        log_result("AUTH: Login (wrong password returns 401)", False, error)
        return False
    
    log_result("AUTH: Login (wrong password returns 401)", True)
    return True

def test_auth_me():
    """Test GET /api/auth/me"""
    # Test with valid token
    data, error = make_request("GET", "/auth/me", auth=True)
    
    if error:
        log_result("AUTH: Get current user (with token)", False, error)
        return False
    
    if data.get("email") != ADMIN_EMAIL:
        log_result("AUTH: Get current user (with token)", False, f"Email mismatch: {data.get('email')}")
        return False
    
    log_result("AUTH: Get current user (with token)", True)
    
    # Test without token
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        if response.status_code != 401:
            log_result("AUTH: Get current user (without token returns 401)", False, f"Expected 401, got {response.status_code}")
            return False
        log_result("AUTH: Get current user (without token returns 401)", True)
    except Exception as e:
        log_result("AUTH: Get current user (without token returns 401)", False, str(e))
        return False
    
    return True

def test_auth_logout():
    """Test POST /api/auth/logout"""
    data, error = make_request("POST", "/auth/logout", auth=True)
    
    if error:
        log_result("AUTH: Logout", False, error)
        return False
    
    if not data.get("ok"):
        log_result("AUTH: Logout", False, "Response not ok")
        return False
    
    log_result("AUTH: Logout", True)
    return True

def test_settings_get():
    """Test GET /api/settings"""
    data, error = make_request("GET", "/settings")
    
    if error:
        log_result("SETTINGS: Get settings", False, error)
        return False
    
    if data.get("id") != "main":
        log_result("SETTINGS: Get settings", False, f"Settings id mismatch: {data.get('id')}")
        return False
    
    if not data.get("storeName"):
        log_result("SETTINGS: Get settings", False, "No storeName in response")
        return False
    
    # Check for MongoDB _id leak
    if "_id" in data:
        log_warning("SETTINGS: Get settings", "MongoDB _id field present in response")
    
    log_result("SETTINGS: Get settings", True, f"Store: {data.get('storeName')}")
    return True

def test_settings_update():
    """Test PUT /api/settings"""
    # Test without auth
    try:
        response = requests.put(f"{BASE_URL}/settings", 
                               json={"whatsappNumber": "5219999999"}, 
                               headers={"Content-Type": "application/json"}, 
                               timeout=10)
        if response.status_code != 401:
            log_result("SETTINGS: Update without auth returns 401", False, f"Expected 401, got {response.status_code}")
            return False
        log_result("SETTINGS: Update without auth returns 401", True)
    except Exception as e:
        log_result("SETTINGS: Update without auth returns 401", False, str(e))
        return False
    
    # Test with auth
    data, error = make_request("PUT", "/settings", {
        "whatsappNumber": "5219999999"
    }, auth=True)
    
    if error:
        log_result("SETTINGS: Update with auth", False, error)
        return False
    
    if data.get("whatsappNumber") != "5219999999":
        log_result("SETTINGS: Update with auth", False, f"WhatsApp number not updated: {data.get('whatsappNumber')}")
        return False
    
    log_result("SETTINGS: Update with auth", True)
    return True

def test_categories_crud():
    """Test Categories CRUD operations"""
    # GET categories
    data, error = make_request("GET", "/categories")
    
    if error:
        log_result("CATEGORIES: Get all", False, error)
        return False
    
    if not isinstance(data, list):
        log_result("CATEGORIES: Get all", False, "Response is not an array")
        return False
    
    if len(data) < 5:
        log_result("CATEGORIES: Get all", False, f"Expected at least 5 categories, got {len(data)}")
        return False
    
    # Check for _id leak
    if any("_id" in cat for cat in data):
        log_warning("CATEGORIES: Get all", "MongoDB _id field present in response")
    
    log_result("CATEGORIES: Get all", True, f"Found {len(data)} categories")
    
    # POST new category (requires auth)
    new_cat_data, error = make_request("POST", "/categories", {
        "name": "Test Category",
        "description": "Test description",
        "image": "https://example.com/test.jpg"
    }, auth=True)
    
    if error:
        log_result("CATEGORIES: Create new", False, error)
        return False
    
    if not new_cat_data.get("id"):
        log_result("CATEGORIES: Create new", False, "No id in response")
        return False
    
    if not new_cat_data.get("slug"):
        log_result("CATEGORIES: Create new", False, "No slug generated")
        return False
    
    if new_cat_data.get("slug") != "test-category":
        log_result("CATEGORIES: Create new", False, f"Slug mismatch: {new_cat_data.get('slug')}")
        return False
    
    cat_id = new_cat_data["id"]
    log_result("CATEGORIES: Create new", True, f"ID: {cat_id}")
    
    # PUT update category
    update_data, error = make_request("PUT", f"/categories/{cat_id}", {
        "name": "Updated Test Category"
    }, auth=True)
    
    if error:
        log_result("CATEGORIES: Update", False, error)
        return False
    
    if update_data.get("name") != "Updated Test Category":
        log_result("CATEGORIES: Update", False, f"Name not updated: {update_data.get('name')}")
        return False
    
    log_result("CATEGORIES: Update", True)
    
    # DELETE category
    delete_data, error = make_request("DELETE", f"/categories/{cat_id}", auth=True)
    
    if error:
        log_result("CATEGORIES: Delete", False, error)
        return False
    
    if not delete_data.get("ok"):
        log_result("CATEGORIES: Delete", False, "Response not ok")
        return False
    
    log_result("CATEGORIES: Delete", True)
    return True

def test_products_crud():
    """Test Products CRUD operations"""
    # GET products (active only)
    data, error = make_request("GET", "/products")
    
    if error:
        log_result("PRODUCTS: Get active products", False, error)
        return False
    
    if not isinstance(data, list):
        log_result("PRODUCTS: Get active products", False, "Response is not an array")
        return False
    
    active_count = len(data)
    log_result("PRODUCTS: Get active products", True, f"Found {active_count} active products")
    
    # GET all products (admin)
    all_data, error = make_request("GET", "/products?all=1", auth=True)
    
    if error:
        log_result("PRODUCTS: Get all products (admin)", False, error)
        return False
    
    log_result("PRODUCTS: Get all products (admin)", True, f"Found {len(all_data)} total products")
    
    # GET featured products
    featured_data, error = make_request("GET", "/products?featured=1")
    
    if error:
        log_result("PRODUCTS: Get featured products", False, error)
        return False
    
    if not all(p.get("featured") for p in featured_data):
        log_result("PRODUCTS: Get featured products", False, "Non-featured products in response")
        return False
    
    log_result("PRODUCTS: Get featured products", True, f"Found {len(featured_data)} featured")
    
    # GET slider products
    slider_data, error = make_request("GET", "/products?slider=1")
    
    if error:
        log_result("PRODUCTS: Get slider products", False, error)
        return False
    
    if not all(p.get("inSlider") for p in slider_data):
        log_result("PRODUCTS: Get slider products", False, "Non-slider products in response")
        return False
    
    # Check if sorted by sliderOrder
    orders = [p.get("sliderOrder", 999) for p in slider_data]
    if orders != sorted(orders):
        log_result("PRODUCTS: Get slider products (sorted)", False, f"Not sorted by sliderOrder: {orders}")
        return False
    
    log_result("PRODUCTS: Get slider products", True, f"Found {len(slider_data)} in slider, sorted correctly")
    
    # GET with search
    search_data, error = make_request("GET", "/products?search=nebula")
    
    if error:
        log_result("PRODUCTS: Search by name", False, error)
        return False
    
    if not all("nebula" in p.get("name", "").lower() for p in search_data):
        log_result("PRODUCTS: Search by name", False, "Non-matching products in search results")
        return False
    
    log_result("PRODUCTS: Search by name", True, f"Found {len(search_data)} matching 'nebula'")
    
    # GET with sort
    sort_data, error = make_request("GET", "/products?sort=price-asc")
    
    if error:
        log_result("PRODUCTS: Sort by price ascending", False, error)
        return False
    
    prices = [p.get("price", 0) for p in sort_data]
    if prices != sorted(prices):
        log_result("PRODUCTS: Sort by price ascending", False, f"Not sorted: {prices[:5]}")
        return False
    
    log_result("PRODUCTS: Sort by price ascending", True)
    
    # GET by slug
    slug_data, error = make_request("GET", "/products/slug/nebula-pro-x")
    
    if error:
        log_result("PRODUCTS: Get by slug", False, error)
        return False
    
    if slug_data.get("slug") != "nebula-pro-x":
        log_result("PRODUCTS: Get by slug", False, f"Slug mismatch: {slug_data.get('slug')}")
        return False
    
    initial_views = slug_data.get("views", 0)
    log_result("PRODUCTS: Get by slug", True, f"Views: {initial_views}")
    
    # Verify views increment
    slug_data2, error = make_request("GET", "/products/slug/nebula-pro-x")
    if not error and slug_data2.get("views", 0) > initial_views:
        log_result("PRODUCTS: Views increment on slug access", True, f"Views: {slug_data2.get('views')}")
    else:
        log_warning("PRODUCTS: Views increment", "Views did not increment")
    
    # POST new product
    new_product, error = make_request("POST", "/products", {
        "name": "Test Product",
        "price": 999,
        "stock": 5,
        "categoryId": data[0].get("categoryId") if data else None
    }, auth=True)
    
    if error:
        log_result("PRODUCTS: Create new", False, error)
        return False
    
    if not new_product.get("id"):
        log_result("PRODUCTS: Create new", False, "No id in response")
        return False
    
    if not new_product.get("slug"):
        log_result("PRODUCTS: Create new", False, "No slug generated")
        return False
    
    if new_product.get("stockStatus") != "ultimas-unidades":
        log_result("PRODUCTS: Create new (stock status)", False, f"Expected 'ultimas-unidades', got {new_product.get('stockStatus')}")
        return False
    
    product_id = new_product["id"]
    log_result("PRODUCTS: Create new", True, f"ID: {product_id}, stockStatus: {new_product.get('stockStatus')}")
    
    # PUT update product (set stock to 0)
    update_product, error = make_request("PUT", f"/products/{product_id}", {
        "price": 99,
        "stock": 0
    }, auth=True)
    
    if error:
        log_result("PRODUCTS: Update", False, error)
        return False
    
    if update_product.get("price") != 99:
        log_result("PRODUCTS: Update (price)", False, f"Price not updated: {update_product.get('price')}")
        return False
    
    if update_product.get("stock") != 0:
        log_result("PRODUCTS: Update (stock)", False, f"Stock not updated: {update_product.get('stock')}")
        return False
    
    if update_product.get("stockStatus") != "agotado":
        log_result("PRODUCTS: Update (stock status auto-computed)", False, f"Expected 'agotado', got {update_product.get('stockStatus')}")
        return False
    
    log_result("PRODUCTS: Update", True, f"stockStatus auto-computed to 'agotado'")
    
    # POST duplicate product
    dup_product, error = make_request("POST", f"/products/{product_id}/duplicate", auth=True)
    
    if error:
        log_result("PRODUCTS: Duplicate", False, error)
        return False
    
    if not dup_product.get("id"):
        log_result("PRODUCTS: Duplicate", False, "No id in response")
        return False
    
    if dup_product.get("id") == product_id:
        log_result("PRODUCTS: Duplicate", False, "Duplicate has same ID as original")
        return False
    
    if "(copia)" not in dup_product.get("name", ""):
        log_result("PRODUCTS: Duplicate", False, f"Name doesn't contain '(copia)': {dup_product.get('name')}")
        return False
    
    dup_id = dup_product["id"]
    log_result("PRODUCTS: Duplicate", True, f"Created copy with ID: {dup_id}")
    
    # DELETE products
    delete1, error = make_request("DELETE", f"/products/{product_id}", auth=True)
    if error or not delete1.get("ok"):
        log_result("PRODUCTS: Delete original", False, error or "Response not ok")
        return False
    
    delete2, error = make_request("DELETE", f"/products/{dup_id}", auth=True)
    if error or not delete2.get("ok"):
        log_result("PRODUCTS: Delete duplicate", False, error or "Response not ok")
        return False
    
    log_result("PRODUCTS: Delete", True, "Both products deleted")
    return True

def test_slider_update():
    """Test PUT /api/slider"""
    # Get current slider products
    slider_data, error = make_request("GET", "/products?slider=1")
    
    if error or not slider_data:
        log_result("SLIDER: Update order", False, "Cannot get current slider products")
        return False
    
    # Reverse the order
    items = [{"id": p["id"], "order": len(slider_data) - i - 1} for i, p in enumerate(slider_data)]
    
    update_data, error = make_request("PUT", "/slider", {
        "items": items,
        "removedIds": []
    }, auth=True)
    
    if error:
        log_result("SLIDER: Update order", False, error)
        return False
    
    if not update_data.get("ok"):
        log_result("SLIDER: Update order", False, "Response not ok")
        return False
    
    # Verify order changed
    new_slider, error = make_request("GET", "/products?slider=1")
    
    if error:
        log_result("SLIDER: Verify order update", False, error)
        return False
    
    # Check if first item is now last
    if new_slider[0]["id"] != slider_data[-1]["id"]:
        log_result("SLIDER: Verify order update", False, "Order not updated correctly")
        return False
    
    log_result("SLIDER: Update order", True, "Order reversed successfully")
    return True

def test_banners_crud():
    """Test Banners CRUD operations"""
    # GET banners
    data, error = make_request("GET", "/banners")
    
    if error:
        log_result("BANNERS: Get all", False, error)
        return False
    
    if not isinstance(data, list):
        log_result("BANNERS: Get all", False, "Response is not an array")
        return False
    
    log_result("BANNERS: Get all", True, f"Found {len(data)} banners")
    
    # POST new banner
    new_banner, error = make_request("POST", "/banners", {
        "title": "Test Banner",
        "text": "Test banner text",
        "buttonText": "Click me",
        "link": "#test",
        "gradient": "from-blue-500 to-purple-500",
        "active": True
    }, auth=True)
    
    if error:
        log_result("BANNERS: Create new", False, error)
        return False
    
    if not new_banner.get("id"):
        log_result("BANNERS: Create new", False, "No id in response")
        return False
    
    banner_id = new_banner["id"]
    log_result("BANNERS: Create new", True, f"ID: {banner_id}")
    
    # PUT update banner
    update_banner, error = make_request("PUT", f"/banners/{banner_id}", {
        "title": "Updated Test Banner"
    }, auth=True)
    
    if error:
        log_result("BANNERS: Update", False, error)
        return False
    
    if update_banner.get("title") != "Updated Test Banner":
        log_result("BANNERS: Update", False, f"Title not updated: {update_banner.get('title')}")
        return False
    
    log_result("BANNERS: Update", True)
    
    # DELETE banner
    delete_banner, error = make_request("DELETE", f"/banners/{banner_id}", auth=True)
    
    if error:
        log_result("BANNERS: Delete", False, error)
        return False
    
    if not delete_banner.get("ok"):
        log_result("BANNERS: Delete", False, "Response not ok")
        return False
    
    log_result("BANNERS: Delete", True)
    return True

def test_whatsapp_click():
    """Test POST /api/whatsapp-click"""
    # Get a product ID
    products, error = make_request("GET", "/products")
    
    if error or not products:
        log_result("WHATSAPP: Click tracking", False, "Cannot get products for testing")
        return False
    
    product = products[0]
    
    # POST click (no auth required)
    data, error = make_request("POST", "/whatsapp-click", {
        "productId": product["id"],
        "productName": product["name"],
        "source": "product-page",
        "device": "desktop"
    })
    
    if error:
        log_result("WHATSAPP: Click tracking", False, error)
        return False
    
    if not data.get("ok"):
        log_result("WHATSAPP: Click tracking", False, "Response not ok")
        return False
    
    log_result("WHATSAPP: Click tracking", True, f"Tracked click for {product['name']}")
    return True

def test_stats():
    """Test GET /api/stats"""
    # Test without auth
    try:
        response = requests.get(f"{BASE_URL}/stats", 
                               headers={"Content-Type": "application/json"}, 
                               timeout=10)
        if response.status_code != 401:
            log_result("STATS: Get without auth returns 401", False, f"Expected 401, got {response.status_code}")
            return False
        log_result("STATS: Get without auth returns 401", True)
    except Exception as e:
        log_result("STATS: Get without auth returns 401", False, str(e))
        return False
    
    # Test with auth
    data, error = make_request("GET", "/stats", auth=True)
    
    if error:
        log_result("STATS: Get dashboard stats", False, error)
        return False
    
    required_fields = [
        "totalProducts", "activeProducts", "outOfStock", "featured",
        "totalCategories", "totalClicks", "topProducts", "clicksByDay",
        "productsByCategory", "clicksByProduct"
    ]
    
    missing_fields = [f for f in required_fields if f not in data]
    if missing_fields:
        log_result("STATS: Get dashboard stats", False, f"Missing fields: {missing_fields}")
        return False
    
    if not isinstance(data["topProducts"], list):
        log_result("STATS: Get dashboard stats", False, "topProducts is not an array")
        return False
    
    if not isinstance(data["clicksByDay"], list):
        log_result("STATS: Get dashboard stats", False, "clicksByDay is not an array")
        return False
    
    log_result("STATS: Get dashboard stats", True, 
              f"Total products: {data['totalProducts']}, Active: {data['activeProducts']}, Clicks: {data['totalClicks']}")
    return True

def test_auto_seed():
    """Verify auto-seed functionality"""
    # Check settings exists
    settings, error = make_request("GET", "/settings")
    if error or settings.get("id") != "main":
        log_result("AUTO-SEED: Settings created", False, error or "Settings not found")
        return False
    
    log_result("AUTO-SEED: Settings created", True)
    
    # Check categories (should be 5)
    categories, error = make_request("GET", "/categories")
    if error or len(categories) < 5:
        log_result("AUTO-SEED: Categories created", False, f"Expected at least 5, got {len(categories) if categories else 0}")
        return False
    
    log_result("AUTO-SEED: Categories created", True, f"Found {len(categories)} categories")
    
    # Check products (should be 10)
    products, error = make_request("GET", "/products?all=1", auth=True)
    if error or len(products) < 10:
        log_result("AUTO-SEED: Products created", False, f"Expected at least 10, got {len(products) if products else 0}")
        return False
    
    log_result("AUTO-SEED: Products created", True, f"Found {len(products)} products")
    
    # Check banners (should be at least 1)
    banners, error = make_request("GET", "/banners")
    if error or len(banners) < 1:
        log_result("AUTO-SEED: Banners created", False, f"Expected at least 1, got {len(banners) if banners else 0}")
        return False
    
    log_result("AUTO-SEED: Banners created", True, f"Found {len(banners)} banners")
    
    return True

# ============ MAIN TEST RUNNER ============

def run_all_tests():
    """Run all backend tests"""
    print("=" * 80)
    print("CLOUD DISTRICT BACKEND API TEST SUITE")
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    # Test auto-seed first
    print("🔍 Testing Auto-Seed...")
    test_auto_seed()
    print()
    
    # Test authentication
    print("🔍 Testing Authentication...")
    test_auth_login()
    test_auth_me()
    test_auth_logout()
    
    # Re-login for subsequent tests
    print("\n🔄 Re-authenticating for remaining tests...")
    test_auth_login()
    print()
    
    # Test settings
    print("🔍 Testing Settings...")
    test_settings_get()
    test_settings_update()
    print()
    
    # Test categories
    print("🔍 Testing Categories...")
    test_categories_crud()
    print()
    
    # Test products
    print("🔍 Testing Products...")
    test_products_crud()
    print()
    
    # Test slider
    print("🔍 Testing Slider...")
    test_slider_update()
    print()
    
    # Test banners
    print("🔍 Testing Banners...")
    test_banners_crud()
    print()
    
    # Test WhatsApp click
    print("🔍 Testing WhatsApp Click Tracking...")
    test_whatsapp_click()
    print()
    
    # Test stats
    print("🔍 Testing Dashboard Stats...")
    test_stats()
    print()
    
    # Print summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"✅ Passed: {len(test_results['passed'])}")
    print(f"❌ Failed: {len(test_results['failed'])}")
    print(f"⚠️  Warnings: {len(test_results['warnings'])}")
    print()
    
    if test_results["failed"]:
        print("Failed tests:")
        for test in test_results["failed"]:
            print(f"  - {test}")
        print()
    
    if test_results["warnings"]:
        print("Warnings:")
        for warning in test_results["warnings"]:
            print(f"  - {warning}")
        print()
    
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # Exit with appropriate code
    sys.exit(0 if len(test_results["failed"]) == 0 else 1)

if __name__ == "__main__":
    run_all_tests()
