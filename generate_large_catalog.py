import json
import sys
import random

sys.stdout.reconfigure(encoding='utf-8')

def generate_catalog():
    print("📦 Generating 100+ realistic products per category for SimplyStore...")

    # High quality Unsplash image pools per category
    images = {
        "Electronics": [
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1608248597263-00079e9603f0?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60"
        ],
        "Fashion": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=500&auto=format&fit=crop&q=60"
        ],
        "Home & Kitchen": [
            "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1517668808822-9e4288246ede?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=60"
        ],
        "Books & Media": [
            "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60"
        ],
        "Sports & Fitness": [
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60"
        ]
    }

    vendors = ["v1", "v2", "admin"]

    category_templates = {
        "Electronics": {
            "brands": ["Apple", "Samsung", "Sony", "Dell", "Bose", "LG", "Asus", "Logitech", "Anker", "Canon"],
            "items": ["Smart 4K TV", "Wireless Noise-Canceling Headphones", "Gaming Laptop Pro", "Ultra-Wide Monitor", "Bluetooth Portable Speaker", "Mirrorless Camera 4K", "Smartwatch Series X", "Mechanical RGB Keyboard", "Ergonomic Wireless Mouse", "Fast Charging Power Bank", "Solid State Drive 2TB", "Noise Isolating Earbuds", "VR Headset Pro", "Action Camera 5K", "Smart Home Hub"],
            "adjectives": ["Pro", "Ultra", "Max", "Studio", "Lite", "Elite", "Wireless", "Next-Gen", "Slim", "Turbo"]
        },
        "Fashion": {
            "brands": ["Nike", "Adidas", "Puma", "Zara", "Levi's", "Gucci", "Uniqlo", "Ray-Ban", "Tommy Hilfiger", "Calvin Klein"],
            "items": ["Running Sneakers", "Cotton Graphic T-Shirt", "Slim Fit Denim Jeans", "Leather Biker Jacket", "Polarized Sunglasses", "Casual Hoodie", "Formal Blazer", "Canvas Backpack", "Sports Track Pants", "Chronograph Wristwatch", "Ankle Boots", "Winter Puffer Coat", "Designer Crossbody Bag", "Performance Socks Pack", "Wool Knitted Beanie"],
            "adjectives": ["Premium", "Classic", "Vintage", "Urban", "Essential", "Comfort", "Sport", "Signature", "Modern", "Flex"]
        },
        "Home & Kitchen": {
            "brands": ["Dyson", "Nespresso", "Instant Pot", "Philips", "KitchenAid", "IKEA", "Bosch", "Ninja", "Cuisinart", "Le Creuset"],
            "items": ["Air Fryer Oven", "Espresso Coffee Machine", "HEPA Air Purifier", "Robot Vacuum Cleaner", "Cast Iron Dutch Oven", "Blender & Food Processor", "Ergonomic Office Chair", "Smart LED Desk Lamp", "Stainless Steel Cookware Set", "Weighted Cooling Blanket", "Electric Kettle", "Memory Foam Pillow", "Juicer Machine", "Non-Stick Frying Pan", "Bamboo Cutting Board"],
            "adjectives": ["Smart", "Chef's Edition", "Deluxe", "Compact", "Quiet", "Eco-Friendly", "Pro-Line", "Modern", "Heavy-Duty", "Precision"]
        },
        "Books & Media": {
            "brands": ["Penguin", "HarperCollins", "Random House", "Simon & Schuster", "O'Reilly", "Oxford", "MIT Press", "Pearson"],
            "items": ["Software Engineering Patterns", "Mastering React 19 & Node.js", "The Art of Clean Architecture", "Data Science & AI Handbook", "Psychology of Success", "Modern World History", "Financial Freedom Guide", "Creative Design Thinking", "Product Management 101", "The Quantum Mind"],
            "adjectives": ["Ultimate Guide", "Comprehensive Handbook", "Edition 2026", "Masterclass", "Practical Guide", "Complete Series", "Essentials", "In-Depth"]
        },
        "Sports & Fitness": {
            "brands": ["Under Armour", "Reebok", "Decathlon", "Bowflex", "Manduka", "Speedo", "Garmin", "Wilson"],
            "items": ["Non-Slip Yoga Mat", "Adjustable Dumbbell Set", "Smart Fitness Tracker", "Resistance Bands Kit", "High-Density Foam Roller", "Insulated Sports Bottle", "Hydration Running Vest", "Speed Jump Rope", "Deep Tissue Massage Gun", "Workout Bench"],
            "adjectives": ["Professional", "Ultra-Grip", "Heavy Duty", "Ergonomic", "High Performance", "Pro-Series", "Recovery", "Endurance"]
        }
    }

    products = []
    pid = 1

    for cat_name, template in category_templates.items():
        cat_images = images.get(cat_name, images["Electronics"])
        for i in range(1, 105): # Generate 104 products per category (520+ total!)
            brand = random.choice(template["brands"])
            item = random.choice(template["items"])
            adj = random.choice(template["adjectives"])
            
            name = f"{brand} {adj} {item} #{i}"
            price = round(random.uniform(15, 1200), 2)
            orig_price = round(price * random.uniform(1.1, 1.35), 2)
            discount = int(round((1 - (price / orig_price)) * 100))
            stock = random.randint(3, 85)
            rating_rate = round(random.uniform(4.0, 5.0), 1)
            rating_count = random.randint(12, 950)
            img = random.choice(cat_images)
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
                "image": img,
                "description": f"High quality {name}. Engineered with premium materials for optimum durability, comfort, and state-of-the-art performance.",
                "rating": {
                    "rate": rating_rate,
                    "count": rating_count
                },
                "tags": [cat_name.lower().replace(" & ", "-"), brand.lower(), adj.lower()],
                "isFeatured": (i % 8 == 0),
                "isTrending": (i % 5 == 0),
                "colors": ["Standard", "Black", "Silver", "Navy"] if cat_name in ["Electronics", "Fashion"] else [],
                "sizes": ["S", "M", "L", "XL"] if cat_name == "Fashion" else [],
                "vendorId": vendor
            })
            pid += 1

    print(f"✅ Generated total {len(products)} products across {len(category_templates)} categories!")
    
    with open("backend/data/products.json", "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2)

    print("🎉 Saved expanded products catalog to backend/data/products.json!")

if __name__ == "__main__":
    generate_catalog()
