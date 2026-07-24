import json
import sys
import random

sys.stdout.reconfigure(encoding='utf-8')

def generate_all_categories():
    print("📦 Generating 104+ products for ALL 15 categories in SimplyStore...")

    all_categories = [
        ("Electronics", ["Apple", "Samsung", "Sony", "Dell", "Bose", "LG", "Asus", "Logitech", "Anker", "Canon"], ["Smart 4K TV", "Wireless Headphones", "Gaming Laptop", "Ultra Monitor", "Portable Speaker", "Camera 4K", "Smartwatch", "Keyboard RGB", "Wireless Mouse", "Power Bank"]),
        ("Fashion", ["Nike", "Adidas", "Puma", "Zara", "Levi's", "Gucci", "Uniqlo", "Ray-Ban", "Tommy", "Calvin Klein"], ["Running Sneakers", "Cotton T-Shirt", "Slim Denim Jeans", "Leather Jacket", "Polarized Sunglasses", "Casual Hoodie", "Formal Blazer", "Canvas Backpack", "Track Pants", "Watch"]),
        ("Home & Kitchen", ["Dyson", "Nespresso", "Instant Pot", "Philips", "KitchenAid", "IKEA", "Bosch", "Ninja", "Cuisinart", "Le Creuset"], ["Air Fryer Oven", "Espresso Machine", "HEPA Air Purifier", "Robot Vacuum", "Cast Iron Skillet", "Blender", "Office Chair", "LED Desk Lamp", "Cookware Set", "Electric Kettle"]),
        ("Sports", ["Peloton", "Wilson", "Callaway", "Manduka", "Bowflex", "Garmin", "Spalding", "TRX", "Nike", "Adidas"], ["Fitness Bike", "Tennis Racket", "Complete Golf Set", "PRO Yoga Mat", "Adjustable Dumbbell Set", "GPS Sports Watch", "NBA Basketball", "Suspension Trainer", "Jump Rope", "Foam Roller"]),
        ("Books", ["Penguin", "HarperCollins", "Random House", "Simon & Schuster", "O'Reilly", "Oxford", "MIT Press", "Pearson"], ["Atomic Habits Guide", "Psychology of Money", "Clean Code Engineering", "Steve Jobs Biography", "Dune Sci-Fi Epic", "Lean Startup Handbook", "Data Science Manual", "Creative Thinking"]),
        ("Beauty", ["Charlotte Tilbury", "Fenty Beauty", "Drunk Elephant", "Dyson", "La Mer", "Olaplex", "L'Oreal", "MAC"], ["Flawless Foundation", "Pro Matte Powder", "Vitamin C Serum", "Airwrap Styler", "Moisturizing Cream", "Hair Perfector No.3", "Lipstick Set", "Hydrating Cleanser"]),
        ("Toys", ["LEGO", "Hasbro", "Mattel", "Nerf", "Fisher-Price", "Barbie", "Hot Wheels", "Bandai"], ["Star Wars Building Kit", "Monopoly Board Game", "Remote Control Racer", "Blaster Elite", "Playhouse Set", "Collectible Action Figure", "Educational Puzzle", "Drone Quadcopter"]),
        ("Automotive", ["Michelin", "Bosch", "Meguiar's", "Garmin", "NOCO", "Castrol", "Thule", "Pioneer"], ["Dash Cam Pro 4K", "Car Battery Jump Starter", "Car Wash Wax Kit", "Tire Pressure Gauge", "GPS Car Navigator", "Roof Rack Cargo Carrier", "Bluetooth Car Receiver", "LED Headlight Kit"]),
        ("Garden", ["Greenworks", "Fiskars", "Miracle-Gro", "Weber", "Gardena", "Sun Joe", "Worx", "Husqvarna"], ["Electric Lawn Mower", "Cordless Grass Trimmer", "Charcoal Grill Smokeless", "Ergonomic Pruning Shears", "Automated Hose Reel", "Plant Food Fertilizer", "Outdoor Patio Bench", "Garden Tool Set"]),
        ("Health", ["Omron", "Waterpik", "Oral-B", "Philips Sonicare", "Theragun", "Fitbit", "Nature Made", "Centrum"], ["Smart Blood Pressure Monitor", "Water Flosser Pro", "Electric Toothbrush 9000", "Percussion Massage Gun", "Multivitamin Complex", "Pulse Oximeter", "Infrared Thermometer", "Heating Pad"]),
        ("Accessories", ["Ray-Ban", "Rolex", "Coach", "Anker", "Peak Design", "Bellroy", "Samsonite", "Fossil"], ["Aviator Classic Sunglasses", "Luxury Diver Watch", "Leather Bifold Wallet", "65W USB-C Charger", "Everyday Camera Backpack", "Minimalist Wristwatch", "Hard Shell Suitcase", "Keychain Organizer"]),
        ("Food & Grocery", ["Nespresso", "Lindt", "Ghirardelli", "Starbucks", "Twinings", "Ferrero", "Nutella", "Quaker"], ["Dark Chocolate Truffles", "Espresso Pods Pack", "Whole Bean Coffee", "Organic Green Tea Box", "Hazelnut Cocoa Spread", "Rolled Oats Organic", "Premium Olive Oil", "Artisanal Honey Jar"]),
        ("Office", ["Logitech", "Herman Miller", "Steelcase", "Moleskine", "Epson", "HP", "3M Post-it", "BIC"], ["Ergonomic Desk Chair", "Adjustable Standing Desk", "Wireless Laser Printer", "Hardcover Notebook", "Noise Masking Headset", "Desk Pad Organizer", "Gel Ink Pens Pack", "Document Shredder"]),
        ("Music", ["Yamaha", "Fender", "Gibson", "Roland", "Shure", "Audio-Technica", "Casio", "Korg"], ["Acoustic Guitar Bundle", "Electric Bass Guitar", "USB Studio Microphone", "Digital Piano 88-Key", "DJ Turntable System", "Studio Monitor Speakers", "MIDI Keyboard Controller", "Drum Machine Pad"]),
        ("Travel", ["Samsonite", "Travelpro", "Osprey", "Away", "Monos", "Roam", "Delsey", "Eagle Creek"], ["Carry-On Spinner Luggage", "Expandable Checked Suitcase", "Travel Neck Pillow Memory Foam", "Packing Cube Organizer 6-Set", "TSA Approved Cable Locks", "Toiletry Travel Bag", "Passport Holder Cover", "Luggage Weight Scale"])
    ]

    images_pool = [
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&auto=format&fit=crop&q=60"
    ]

    vendors = ["v1", "v2", "admin"]
    adjectives = ["Pro", "Ultra", "Deluxe", "Classic", "Smart", "Compact", "Premium", "Essential", "Heavy-Duty", "Modern"]

    products = []
    pid = 1

    for idx, (cat_name, brands, items) in enumerate(all_categories):
        img_url = images_pool[idx % len(images_pool)]
        for i in range(1, 105): # Generate 104 products per category (15 * 104 = 1,560 total products!)
            brand = random.choice(brands)
            item = random.choice(items)
            adj = random.choice(adjectives)
            
            name = f"{brand} {adj} {item} #{i}"
            price = round(random.uniform(12, 1400), 2)
            orig_price = round(price * random.uniform(1.1, 1.35), 2)
            discount = int(round((1 - (price / orig_price)) * 100))
            stock = random.randint(5, 95)
            rating_rate = round(random.uniform(4.0, 5.0), 1)
            rating_count = random.randint(15, 800)
            vendor = random.choice(vendors)

            products.append({
                "id": f"p{pid}",
                "name": name,
                "category": cat_name,
                "brand": brand,
                "price": price,
                "originalPrice": orig_price,
                "discount": discount,
                "stock": stock,
                "image": img_url,
                "description": f"High quality {name}. Engineered for maximum reliability, comfort, and premium performance in {cat_name}.",
                "rating": {
                    "rate": rating_rate,
                    "count": rating_count
                },
                "tags": [cat_name.lower().replace(" & ", "-"), brand.lower(), adj.lower()],
                "isFeatured": (i % 7 == 0),
                "isTrending": (i % 4 == 0),
                "colors": ["Black", "Silver", "Blue"] if cat_name in ["Electronics", "Fashion", "Accessories"] else [],
                "sizes": ["S", "M", "L", "XL"] if cat_name == "Fashion" else [],
                "vendorId": vendor
            })
            pid += 1

    print(f"✅ Generated total {len(products)} products across ALL {len(all_categories)} categories!")
    
    with open("backend/data/products.json", "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2)

    print("🎉 Saved expanded products catalog (1,560 items) to backend/data/products.json!")

if __name__ == "__main__":
    generate_all_categories()
