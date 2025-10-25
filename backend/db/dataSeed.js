const bcrypt = require('bcryptjs');

async function seedData(conn) {
  console.log('🌱 Seeding database with extensive international menu...');

  // Use a transaction to ensure data integrity
  await conn.beginTransaction();
  try {

    // Unified password for all seed users
    const pwd = 'password123';
    const hash = await bcrypt.hash(pwd, 10);

    // --- USERS ---
    // Seed the database with a variety of user roles.
    await conn.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ?',
      [[
        ['Alice Student',  'alice@student.edu',  hash, null, 'student'],     // ID 1
        ['Mia Student',    'mia@student.edu',    hash, null, 'student'],     // ID 2
        ['Jeffery Student','jeffery@student.edu',hash, null, 'student'],     // ID 3
        ['Charlie Student','charlie@student.edu',hash, null, 'student'],     // ID 4
        ['Diana Student',  'diana@student.edu',  hash, null, 'student'],     // ID 5
        ['Frank Faculty',  'frank@faculty.edu',  hash, null, 'faculty'],     // ID 6
        ['Grace Faculty',  'grace@faculty.edu',  hash, null, 'faculty'],     // ID 7
        ['Bob Staff',      'bob@cafeteria.edu',  hash, null, 'staff'],       // ID 8
        ['Admin Root',     'admin@campus.edu',   hash, null, 'admin'],       // ID 9
      ]]
    );

    // --- MENUS ---
    // Seed the database with a comprehensive and international menu.
    await conn.query(`
      INSERT INTO menus (name, description, price, image, category, stock, is_available) VALUES
      -- Starters (ID 1-10)
      ('Caesar Salad', 'Fresh romaine lettuce, parmesan, croutons, Caesar dressing', 9.00, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 'Starters', 120, TRUE),
      ('Bruschetta', 'Grilled baguette with diced tomatoes, garlic, basil, and olive oil', 8.00, 'https://images.pexels.com/photos/4409496/pexels-photo-4409496.jpeg', 'Starters', 100, TRUE),
      ('Garlic Butter Prawns', 'Pan-seared prawns with garlic butter and a lemon wedge', 12.00, 'https://images.pexels.com/photos/1123252/pexels-photo-1123252.jpeg', 'Starters', 60, TRUE),
      ('Spinach Artichoke Dip', 'Creamy dip with spinach, artichoke hearts, and cheese, served with tortilla chips', 11.00, 'https://images.pexels.com/photos/6544374/pexels-photo-6544374.jpeg', 'Starters', 80, TRUE),
      ('Fried Calamari', 'Lightly battered and fried squid, served with marinara sauce', 13.00, 'https://images.pexels.com/photos/9765354/pexels-photo-9765354.jpeg', 'Starters', 70, TRUE),
      ('Mozzarella Sticks', 'Fried cheese sticks served with a side of marinara sauce', 9.00, 'https://images.pexels.com/photos/9650081/pexels-photo-9650081.jpeg', 'Starters', 150, TRUE),
      ('Chicken Satay Skewers (4 pcs)', 'Grilled chicken skewers marinated in a peanut sauce', 10.00, 'https://images.pexels.com/photos/9056984/pexels-photo-9056984.jpeg', 'Starters', 90, TRUE),
      ('Shrimp Cocktail', 'Chilled jumbo shrimp served with a tangy cocktail sauce', 14.00, 'https://images.pexels.com/photos/17478661/pexels-photo-17478661.jpeg', 'Starters', 50, TRUE),
      ('Stuffed Mushrooms', 'Mushroom caps filled with sausage, breadcrumbs, and herbs', 10.00, 'https://images.pexels.com/photos/10359397/pexels-photo-10359397.jpeg', 'Starters', 75, TRUE),
      ('Spring Rolls (4 pcs)', 'Crispy rolls filled with vegetables and sometimes meat', 7.00, 'https://images.pexels.com/photos/3569706/pexels-photo-3569706.jpeg', 'Starters', 150, TRUE),

      -- Soups (ID 11-20)
      ('Cream of Mushroom Soup', 'Creamy mushroom soup with herbs', 7.00, 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', 'Soups', 80, TRUE),
      ('French Onion Soup', 'Caramelized onion broth topped with melted cheese and crouton', 9.00, 'https://images.pexels.com/photos/5949884/pexels-photo-5949884.jpeg', 'Soups', 70, TRUE),
      ('Lobster Bisque', 'Rich lobster broth with a touch of brandy', 14.00, 'https://images.pexels.com/photos/17598231/pexels-photo-17598231.jpeg', 'Soups', 40, TRUE),
      ('Tomato Basil Soup', 'A classic, smooth tomato soup infused with fresh basil', 6.00, 'https://images.pexels.com/photos/3493579/pexels-photo-3493579.jpeg', 'Soups', 100, TRUE),
      ('Chicken Noodle Soup', 'Homestyle soup with chicken, vegetables, and egg noodles', 8.00, 'https://images.pexels.com/photos/30392957/pexels-photo-30392957.jpeg', 'Soups', 90, TRUE),
      ('Minestrone', 'A hearty Italian vegetable soup with pasta and beans', 7.00, 'https://images.pexels.com/photos/27098514/pexels-photo-27098514.jpeg', 'Soups', 85, TRUE),
      ('Butternut Squash Soup', 'A creamy and slightly sweet soup, perfect for autumn', 8.00, 'https://images.pexels.com/photos/10110910/pexels-photo-10110910.jpeg', 'Soups', 60, TRUE),
      ('Tom Yum Goong', 'A hot and sour Thai soup with shrimp, lemongrass, and galangal', 12.00, 'https://images.pexels.com/photos/5030168/pexels-photo-5030168.jpeg', 'Soups', 50, TRUE),
      ('New England Clam Chowder', 'A thick, cream-based chowder with clams and potatoes', 10.00, 'https://images.pexels.com/photos/30649002/pexels-photo-30649002.jpeg', 'Soups', 65, TRUE),
      ('Hot and Sour Soup', 'A soup with mushrooms, tofu, and bamboo shoots, with a spicy and sour taste', 7.00, 'https://images.pexels.com/photos/12561892/pexels-photo-12561892.jpeg', 'Soups', 90, TRUE),
      
      -- Fast Food (ID 21-30)
      ('Classic Cheeseburger', 'Angus beef patty, cheddar cheese, lettuce, tomato, special sauce', 13.00, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', 'Fast Food', 150, TRUE),
      ('BBQ Pulled Pork Sandwich', 'Slow-cooked pulled pork with BBQ sauce on a toasted bun', 14.00, 'https://images.pexels.com/photos/5981144/pexels-photo-5981144.jpeg', 'Fast Food', 120, TRUE),
      ('Crispy Chicken Tenders', 'Served with honey mustard and BBQ sauce', 11.00, 'https://images.pexels.com/photos/14537698/pexels-photo-14537698.jpeg', 'Fast Food', 180, TRUE),
      ('Philly Cheesesteak', 'Thinly sliced beef steak and melted cheese in a hoagie roll', 15.00, 'https://images.pexels.com/photos/29839696/pexels-photo-29839696.jpeg', 'Fast Food', 90, TRUE),
      ('Loaded Nachos', 'Corn tortilla chips, cheese, jalapeños, sour cream, salsa', 12.00, 'https://images.pexels.com/photos/5836768/pexels-photo-5836768.jpeg', 'Fast Food', 100, TRUE),
      ('Onion Rings Tower', 'A tower of crispy, beer-battered onion rings', 8.00, 'https://images.pexels.com/photos/33406/pexels-photo.jpg', 'Fast Food', 130, TRUE),
      ('Spicy Buffalo Wings (6 pcs)', 'Tossed in a spicy buffalo sauce, served with blue cheese dip', 10.00, 'https://images.pexels.com/photos/9500198/pexels-photo-9500198.jpeg', 'Fast Food', 200, TRUE),
      ('Classic Hot Dog', 'Grilled all-beef hot dog in a soft bun with ketchup and mustard', 7.00, 'https://images.pexels.com/photos/4676403/pexels-photo-4676403.jpeg', 'Fast Food', 250, TRUE),
      ('Thick Chocolate Milkshake', 'Creamy chocolate ice cream blended into a thick milkshake', 6.00, 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg', 'Fast Food', 150, TRUE),
      ('Fish and Chips', 'Battered fried fish fillets with a side of crispy french fries', 16.00, 'https://images.pexels.com/photos/1123250/pexels-photo-1123250.jpeg', 'Fast Food', 100, TRUE),

      -- Italian Cuisine (ID 31-40)
      ('Spaghetti Carbonara', 'Pasta with bacon, egg yolk sauce, and parmesan cheese', 16.00, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', 'Italian Cuisine', 120, TRUE),
      ('Margherita Pizza', 'Tomato sauce, mozzarella, and fresh basil', 14.00, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', 'Italian Cuisine', 110, TRUE),
      ('Vegetable Lasagna', 'Layers of pasta with vegetables, ricotta, and marinara sauce', 18.00, 'https://images.pexels.com/photos/28321262/pexels-photo-28321262.jpeg', 'Italian Cuisine', 75, TRUE),
      ('Fettuccine Alfredo', 'Fettuccine pasta in a creamy parmesan sauce', 17.00, 'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg', 'Italian Cuisine', 100, TRUE),
      ('Mushroom Risotto', 'Creamy Arborio rice cooked with wild mushrooms and parmesan', 19.00, 'https://images.pexels.com/photos/11190138/pexels-photo-11190138.jpeg', 'Italian Cuisine', 60, TRUE),
      ('Chicken Parmigiana', 'Breaded chicken breast topped with marinara sauce and mozzarella', 22.00, 'https://images.pexels.com/photos/13443376/pexels-photo-13443376.jpeg', 'Italian Cuisine', 80, TRUE),
      ('Caprese Salad', 'Fresh mozzarella, tomatoes, and basil, with salt and olive oil', 10.00, 'https://images.pexels.com/photos/1633572/pexels-photo-1633572.jpeg', 'Italian Cuisine', 90, TRUE),
      ('Ravioli with Sage Butter', 'Cheese-filled ravioli in a simple sage and butter sauce', 18.00, 'https://images.pexels.com/photos/13563237/pexels-photo-13563237.jpeg', 'Italian Cuisine', 70, TRUE),
      ('Tiramisu', 'Classic Italian dessert with coffee and mascarpone', 9.00, 'https://images.pexels.com/photos/1190165/pexels-photo-1190165.jpeg', 'Italian Cuisine', 90, TRUE),
      ('Panna Cotta', 'Italian dessert of sweetened cream thickened with gelatin', 8.00, 'https://images.pexels.com/photos/574111/pexels-photo-574111.jpeg', 'Italian Cuisine', 60, TRUE),
      
      -- Chinese Cuisine (ID 41-50)
      ('Kung Pao Chicken', 'A spicy, stir-fried dish with chicken, peanuts, and chili peppers', 16.00, 'https://images.pexels.com/photos/30708204/pexels-photo-30708204.jpeg', 'Chinese Cuisine', 85, TRUE),
      ('Sweet and Sour Pork', 'Crispy pork pieces in a sweet and tangy sauce', 17.00, 'https://images.pexels.com/photos/5848495/pexels-photo-5848495.jpeg', 'Chinese Cuisine', 90, TRUE),
      ('Mapo Tofu', 'A popular dish from Sichuan province with tofu set in a spicy sauce', 14.00, 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg', 'Chinese Cuisine', 100, TRUE),
      ('Peking Duck (Half)', 'Famous dish from Beijing, prized for its thin, crisp skin', 35.00, 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg', 'Chinese Cuisine', 40, TRUE),
      ('Wonton Soup', 'A clear broth with filled wonton dumplings', 8.00, 'https://images.pexels.com/photos/1927314/pexels-photo-1927314.jpeg', 'Chinese Cuisine', 120, TRUE),
      ('Beef with Broccoli', 'Classic stir-fry of tender beef and fresh broccoli', 18.00, 'https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg', 'Chinese Cuisine', 110, TRUE),
      ('Dumplings (8 pcs)', 'Steamed or pan-fried dumplings filled with pork and chives', 12.00, 'https://images.pexels.com/photos/16845593/pexels-photo-16845593.jpeg', 'Chinese Cuisine', 200, TRUE),
      ('Yangzhou Fried Rice', 'A popular fried rice dish with shrimp, ham, and vegetables', 13.00, 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg', 'Chinese Cuisine', 130, TRUE),
      ('General Tso Chicken', 'Sweet and spicy deep-fried chicken dish', 17.00, 'https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg', 'Chinese Cuisine', 95, TRUE),
      ('Crab Rangoon (6 pcs)', 'Deep-fried wonton parcels filled with cream cheese and crab', 9.00, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', 'Chinese Cuisine', 110, TRUE),

      -- Japanese Cuisine (ID 51-60)
      ('Sushi Platter (12 pcs)', 'Assortment of nigiri and maki rolls', 28.00, 'https://images.pexels.com/photos/1052189/pexels-photo-1052189.jpeg', 'Japanese Cuisine', 60, TRUE),
      ('Tonkotsu Ramen', 'Rich pork bone broth noodle soup, topped with chashu pork', 16.00, 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg', 'Japanese Cuisine', 100, TRUE),
      ('Chicken Katsu Curry', 'Breaded chicken cutlet with a rich curry sauce and rice', 17.00, 'https://images.pexels.com/photos/1059943/pexels-photo-1059943.jpeg', 'Japanese Cuisine', 80, TRUE),
      ('Shrimp Tempura (5 pcs)', 'Lightly battered and deep-fried shrimp', 13.00, 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg', 'Japanese Cuisine', 90, TRUE),
      ('Gyoza (6 pcs)', 'Pan-fried Japanese dumplings, typically filled with pork', 9.00, 'https://images.pexels.com/photos/1860200/pexels-photo-1860200.jpeg', 'Japanese Cuisine', 120, TRUE),
      ('Chicken Teriyaki Don', 'Grilled chicken with teriyaki sauce served over rice', 15.00, 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg', 'Japanese Cuisine', 110, TRUE),
      ('Miso Soup', 'Traditional soup with tofu, seaweed, and dashi broth', 4.00, 'https://images.pexels.com/photos/248509/pexels-photo-248509.jpeg', 'Japanese Cuisine', 200, TRUE),
      ('Edamame', 'Steamed and salted young soybeans', 5.00, 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg', 'Japanese Cuisine', 150, TRUE),
      ('Unagi Don', 'Grilled eel fillets glazed with a sweetened soy-based sauce', 24.00, 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg', 'Japanese Cuisine', 50, TRUE),
      ('Matcha Ice Cream', 'Green tea flavored ice cream', 6.00, 'https://images.pexels.com/photos/2373520/pexels-photo-2373520.jpeg', 'Japanese Cuisine', 100, TRUE),
      
      -- Mexican Cuisine (ID 61-70)
      ('Beef Tacos (3 pcs)', 'Soft corn tortillas with seasoned ground beef and pico de gallo', 15.00, 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', 'Mexican Cuisine', 90, TRUE),
      ('Chicken Quesadilla', 'Flour tortilla with chicken and cheese, served with sour cream', 12.00, 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg', 'Mexican Cuisine', 130, TRUE),
      ('Guacamole & Chips', 'Freshly made guacamole with crispy tortilla chips', 9.00, 'https://images.pexels.com/photos/2531546/pexels-photo-2531546.jpeg', 'Mexican Cuisine', 110, TRUE),
      ('Beef Burrito', 'A large flour tortilla wrapped around beef, rice, beans, and cheese', 14.00, 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', 'Mexican Cuisine', 100, TRUE),
      ('Chicken Enchiladas', 'Corn tortillas rolled around chicken filling, covered with sauce', 16.00, 'https://images.pexels.com/photos/34014196/pexels-photo-34014196.jpg', 'Mexican Cuisine', 80, TRUE),
      ('Churros with Chocolate Sauce', 'Fried dough pastry with cinnamon sugar', 8.00, 'https://images.pexels.com/photos/372851/pexels-photo-372851.jpeg', 'Mexican Cuisine', 100, TRUE),
      ('Elote (Mexican Street Corn)', 'Grilled corn on the cob with a creamy, cheesy, chili-lime sauce', 6.00, 'https://images.pexels.com/photos/6133869/pexels-photo-6133869.jpeg', 'Mexican Cuisine', 120, TRUE),
      ('Pozole Soup', 'A traditional soup from Mexican cuisine, with pork and hominy corn', 11.00, 'https://images.pexels.com/photos/1059944/pexels-photo-1059944.jpeg', 'Mexican Cuisine', 70, TRUE),
      ('Huevos Rancheros', 'Fried eggs served on corn tortillas topped with a spicy tomato sauce', 10.00, 'https://images.pexels.com/photos/3926132/pexels-photo-3926132.jpeg', 'Mexican Cuisine', 90, TRUE),
      ('Horchata', 'A traditional Mexican drink made with rice, milk, vanilla, and cinnamon', 5.00, 'https://images.pexels.com/photos/1400172/pexels-photo-1400172.jpeg', 'Mexican Cuisine', 150, TRUE),

      -- Drinks (ID 71-82)
      ('Espresso', '', 4.00, 'https://images.pexels.com/photos/302901/pexels-photo-302901.jpeg', 'Drinks', 400, TRUE),
      ('Latte', '', 5.50, 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'Drinks', 350, TRUE),
      ('Fresh Orange Juice', '', 6.00, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', 'Drinks', 200, TRUE),
      ('Sparkling Water', '', 4.00, 'https://images.pexels.com/photos/9009821/pexels-photo-9009821.jpeg', 'Drinks', 500, TRUE),
      ('Red Wine (glass)', '', 12.00, 'https://images.pexels.com/photos/290316/pexels-photo-290316.jpeg', 'Drinks', 180, TRUE),
      ('Mojito Cocktail', '', 12.00, 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg', 'Drinks', 160, TRUE),
      ('Iced Tea', 'Freshly brewed black tea, served chilled', 3.50, 'https://images.pexels.com/photos/15153392/pexels-photo-15153392.jpeg', 'Drinks', 300, TRUE),
      ('Lemonade', 'Classic lemonade made with fresh lemons', 4.50, 'https://images.pexels.com/photos/16845291/pexels-photo-16845291.jpeg', 'Drinks', 250, TRUE),
      ('Coca-Cola', '330ml can', 2.50, 'https://images.pexels.com/photos/14773000/pexels-photo-14773000.jpeg', 'Drinks', 500, TRUE),
      ('Craft Beer (Pint)', 'Local IPA on draft', 8.00, 'https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg', 'Drinks', 150, TRUE),
      ('Margarita', 'Classic lime margarita on the rocks', 11.00, 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg', 'Drinks', 120, TRUE),
      ('Green Tea', 'Hot, brewed green tea', 3.00, 'https://images.pexels.com/photos/230490/pexels-photo-230490.jpeg', 'Drinks', 200, TRUE)
    `);

    // --- ORDERS ---
    // Seed a massive number of orders across all users and the last 7 days.
    await conn.query(`
      INSERT INTO orders (items, status, customer_id, customer_name, original_price, discount_amount, final_price, created_at) VALUES
      -- Day 6 Ago (10 orders)
      ('[{"id":1,"name":"Caesar Salad","price":9},{"id":31,"name":"Spaghetti Carbonara","price":16}]', 'completed', 1, 'Alice Student', 25.00, 5.00, 20.00, NOW() - INTERVAL 6 DAY),
      ('[{"id":61,"name":"Beef Tacos (3 pcs)","price":15},{"id":21,"name":"Classic Cheeseburger","price":13}]', 'completed', 6, 'Frank Faculty', 28.00, 0.00, 28.00, NOW() - INTERVAL 6 DAY),
      ('[{"id":30,"name":"Fish and Chips","price":16},{"id":29,"name":"Thick Chocolate Milkshake","price":6}]', 'completed', 2, 'Mia Student', 22.00, 4.40, 17.60, NOW() - INTERVAL 6 DAY),
      ('[{"id":53,"name":"Chicken Katsu Curry","price":17}]', 'completed', 7, 'Grace Faculty', 17.00, 0.00, 17.00, NOW() - INTERVAL 6 DAY),
      ('[{"id":41,"name":"Kung Pao Chicken","price":16}]', 'completed', 3, 'Jeffery Student', 16.00, 3.20, 12.80, NOW() - INTERVAL 6 DAY),
      ('[{"id":51,"name":"Sushi Platter (12 pcs)","price":28}]', 'completed', 4, 'Charlie Student', 28.00, 5.60, 22.40, NOW() - INTERVAL 6 DAY),
      ('[{"id":11,"name":"Cream of Mushroom Soup","price":7},{"id":22,"name":"BBQ Pulled Pork Sandwich","price":14}]', 'completed', 5, 'Diana Student', 21.00, 4.20, 16.80, NOW() - INTERVAL 6 DAY),
      ('[{"id":66,"name":"Churros with Chocolate Sauce","price":8}]', 'completed', 6, 'Frank Faculty', 8.00, 0.00, 8.00, NOW() - INTERVAL 6 DAY),
      ('[{"id":78,"name":"Coca-Cola","price":2.5}]', 'completed', 1, 'Alice Student', 2.50, 0.50, 2.00, NOW() - INTERVAL 6 DAY),
      ('[{"id":45,"name":"Wonton Soup","price":8}]', 'completed', 2, 'Mia Student', 8.00, 1.60, 6.40, NOW() - INTERVAL 6 DAY),

      -- Day 5 Ago (10 orders)
      ('[{"id":20,"name":"French Fries","price":5},{"id":23,"name":"Crispy Chicken Tenders","price":11}]', 'completed', 2, 'Mia Student', 16.00, 3.20, 12.80, NOW() - INTERVAL 5 DAY),
      ('[{"id":53,"name":"Chicken Katsu Curry","price":17}]', 'completed', 7, 'Grace Faculty', 17.00, 0.00, 17.00, NOW() - INTERVAL 5 DAY),
      ('[{"id":39,"name":"Tiramisu","price":9},{"id":71,"name":"Espresso","price":4}]', 'completed', 1, 'Alice Student', 13.00, 2.60, 10.40, NOW() - INTERVAL 5 DAY),
      ('[{"id":32,"name":"Margherita Pizza","price":14},{"id":73,"name":"Fresh Orange Juice","price":6}]', 'completed', 3, 'Jeffery Student', 20.00, 4.00, 16.00, NOW() - INTERVAL 5 DAY),
      ('[{"id":51,"name":"Sushi Platter (12 pcs)","price":28}]', 'completed', 4, 'Charlie Student', 28.00, 5.60, 22.40, NOW() - INTERVAL 5 DAY),
      ('[{"id":62,"name":"Chicken Quesadilla","price":12}]', 'completed', 5, 'Diana Student', 12.00, 2.40, 9.60, NOW() - INTERVAL 5 DAY),
      ('[{"id":12,"name":"French Onion Soup","price":9}]', 'completed', 6, 'Frank Faculty', 9.00, 0.00, 9.00, NOW() - INTERVAL 5 DAY),
      ('[{"id":27,"name":"Spicy Buffalo Wings (6 pcs)","price":10}]', 'completed', 7, 'Grace Faculty', 10.00, 0.00, 10.00, NOW() - INTERVAL 5 DAY),
      ('[{"id":47,"name":"Dumplings (8 pcs)","price":12}]', 'completed', 1, 'Alice Student', 12.00, 2.40, 9.60, NOW() - INTERVAL 5 DAY),
      ('[{"id":67,"name":"Elote (Mexican Street Corn)","price":6}]', 'completed', 2, 'Mia Student', 6.00, 1.20, 4.80, NOW() - INTERVAL 5 DAY),

      -- Day 4 Ago (10 orders)
      ('[{"id":52,"name":"Tonkotsu Ramen","price":16}]', 'completed', 3, 'Jeffery Student', 16.00, 3.20, 12.80, NOW() - INTERVAL 4 DAY),
      ('[{"id":64,"name":"Beef Burrito","price":14}]', 'completed', 4, 'Charlie Student', 14.00, 2.80, 11.20, NOW() - INTERVAL 4 DAY),
      ('[{"id":42,"name":"Sweet and Sour Pork","price":17},{"id":48,"name":"Yangzhou Fried Rice","price":13}]', 'completed', 5, 'Diana Student', 30.00, 6.00, 24.00, NOW() - INTERVAL 4 DAY),
      ('[{"id":24,"name":"Philly Cheesesteak","price":15}]', 'completed', 6, 'Frank Faculty', 15.00, 0.00, 15.00, NOW() - INTERVAL 4 DAY),
      ('[{"id":34,"name":"Fettuccine Alfredo","price":17}]', 'completed', 7, 'Grace Faculty', 17.00, 0.00, 17.00, NOW() - INTERVAL 4 DAY),
      ('[{"id":2,"name":"Bruschetta","price":8}]', 'completed', 1, 'Alice Student', 8.00, 1.60, 6.40, NOW() - INTERVAL 4 DAY),
      ('[{"id":15,"name":"Chicken Noodle Soup","price":8}]', 'completed', 2, 'Mia Student', 8.00, 1.60, 6.40, NOW() - INTERVAL 4 DAY),
      ('[{"id":30,"name":"Fish and Chips","price":16}]', 'completed', 3, 'Jeffery Student', 16.00, 3.20, 12.80, NOW() - INTERVAL 4 DAY),
      ('[{"id":55,"name":"Gyoza (6 pcs)","price":9}]', 'completed', 4, 'Charlie Student', 9.00, 1.80, 7.20, NOW() - INTERVAL 4 DAY),
      ('[{"id":70,"name":"Horchata","price":5}]', 'completed', 5, 'Diana Student', 5.00, 1.00, 4.00, NOW() - INTERVAL 4 DAY),

      -- Day 3 Ago (10 orders)
      ('[{"id":43,"name":"Mapo Tofu","price":14}]', 'completed', 1, 'Alice Student', 14.00, 2.80, 11.20, NOW() - INTERVAL 3 DAY),
      ('[{"id":59,"name":"Unagi Don","price":24}]', 'completed', 2, 'Mia Student', 24.00, 4.80, 19.20, NOW() - INTERVAL 3 DAY),
      ('[{"id":65,"name":"Chicken Enchiladas","price":16}]', 'completed', 3, 'Jeffery Student', 16.00, 3.20, 12.80, NOW() - INTERVAL 3 DAY),
      ('[{"id":81,"name":"Margarita","price":11}]', 'completed', 6, 'Frank Faculty', 11.00, 0.00, 11.00, NOW() - INTERVAL 3 DAY),
      ('[{"id":77,"name":"Iced Tea","price":3.5}]', 'completed', 7, 'Grace Faculty', 3.50, 0.00, 3.50, NOW() - INTERVAL 3 DAY),
      ('[{"id":1,"name":"Caesar Salad","price":9}]', 'completed', 4, 'Charlie Student', 9.00, 1.80, 7.20, NOW() - INTERVAL 3 DAY),
      ('[{"id":11,"name":"Cream of Mushroom Soup","price":7}]', 'completed', 5, 'Diana Student', 7.00, 1.40, 5.60, NOW() - INTERVAL 3 DAY),
      ('[{"id":21,"name":"Classic Cheeseburger","price":13}]', 'completed', 1, 'Alice Student', 13.00, 2.60, 10.40, NOW() - INTERVAL 3 DAY),
      ('[{"id":31,"name":"Spaghetti Carbonara","price":16}]', 'completed', 2, 'Mia Student', 16.00, 3.20, 12.80, NOW() - INTERVAL 3 DAY),
      ('[{"id":52,"name":"Tonkotsu Ramen","price":16}]', 'completed', 3, 'Jeffery Student', 16.00, 3.20, 12.80, NOW() - INTERVAL 3 DAY),

      -- Day 2 Ago (10 orders)
      ('[{"id":5,"name":"French Onion Soup","price":9},{"id":30,"name":"Fish and Chips","price":16},{"id":48,"name":"Yangzhou Fried Rice","price":13}]', 'completed', 3, 'Jeffery Student', 38.00, 7.60, 30.40, NOW() - INTERVAL 2 DAY),
      ('[{"id":27,"name":"Kung Pao Chicken","price":16},{"id":27,"name":"Kung Pao Chicken","price":16}]', 'completed', 5, 'Diana Student', 32.00, 6.40, 25.60, NOW() - INTERVAL 2 DAY),
      ('[{"id":6,"name":"Lobster Bisque","price":14},{"id":75,"name":"Red Wine (glass)","price":12}]', 'completed', 6, 'Frank Faculty', 26.00, 0.00, 26.00, NOW() - INTERVAL 2 DAY),
      ('[{"id":33,"name":"Vegetable Lasagna","price":18}]', 'completed', 7, 'Grace Faculty', 18.00, 0.00, 18.00, NOW() - INTERVAL 2 DAY),
      ('[{"id":54,"name":"Shrimp Tempura (5 pcs)","price":13}]', 'completed', 1, 'Alice Student', 13.00, 2.60, 10.40, NOW() - INTERVAL 2 DAY),
      ('[{"id":63,"name":"Guacamole & Chips","price":9}]', 'completed', 2, 'Mia Student', 9.00, 1.80, 7.20, NOW() - INTERVAL 2 DAY),
      ('[{"id":10,"name":"Spring Rolls (4 pcs)","price":7}]', 'completed', 3, 'Jeffery Student', 7.00, 1.40, 5.60, NOW() - INTERVAL 2 DAY),
      ('[{"id":25,"name":"Loaded Nachos","price":12}]', 'completed', 4, 'Charlie Student', 12.00, 2.40, 9.60, NOW() - INTERVAL 2 DAY),
      ('[{"id":46,"name":"Beef with Broccoli","price":18}]', 'completed', 5, 'Diana Student', 18.00, 3.60, 14.40, NOW() - INTERVAL 2 DAY),
      ('[{"id":58,"name":"Edamame","price":5}]', 'completed', 1, 'Alice Student', 5.00, 1.00, 4.00, NOW() - INTERVAL 2 DAY),

      -- Yesterday (10 orders)
      ('[{"id":37,"name":"Caprese Salad","price":10}]', 'completed', 6, 'Frank Faculty', 10.00, 0.00, 10.00, NOW() - INTERVAL 1 DAY),
      ('[{"id":49,"name":"General Tso Chicken","price":17}]', 'completed', 7, 'Grace Faculty', 17.00, 0.00, 17.00, NOW() - INTERVAL 1 DAY),
      ('[{"id":69,"name":"Huevos Rancheros","price":10}]', 'completed', 1, 'Alice Student', 10.00, 2.00, 8.00, NOW() - INTERVAL 1 DAY),
      ('[{"id":79,"name":"Craft Beer (Pint)","price":8}]', 'completed', 2, 'Mia Student', 8.00, 1.60, 6.40, NOW() - INTERVAL 1 DAY),
      ('[{"id":13,"name":"Spicy Buffalo Wings (6 pcs)","price":10}]', 'completed', 3, 'Jeffery Student', 10.00, 2.00, 8.00, NOW() - INTERVAL 1 DAY),
      ('[{"id":26,"name":"Onion Rings Tower","price":8}]', 'completed', 4, 'Charlie Student', 8.00, 1.60, 6.40, NOW() - INTERVAL 1 DAY),
      ('[{"id":36,"name":"Chicken Parmigiana","price":22}]', 'completed', 5, 'Diana Student', 22.00, 4.40, 17.60, NOW() - INTERVAL 1 DAY),
      ('[{"id":56,"name":"Chicken Teriyaki Don","price":15}]', 'completed', 1, 'Alice Student', 15.00, 3.00, 12.00, NOW() - INTERVAL 1 DAY),
      ('[{"id":68,"name":"Pozole Soup","price":11}]', 'completed', 2, 'Mia Student', 11.00, 2.20, 8.80, NOW() - INTERVAL 1 DAY),
      ('[{"id":18,"name":"Tom Yum Goong","price":12}]', 'completed', 3, 'Jeffery Student', 12.00, 2.40, 9.60, NOW() - INTERVAL 1 DAY),

      -- Today (10+ orders, some preparing)
      ('[{"id":31,"name":"Spaghetti Carbonara","price":16},{"id":20,"name":"French Fries","price":5}]', 'completed', 2, 'Mia Student', 21.00, 4.20, 16.80, NOW()),
      ('[{"id":52,"name":"Tonkotsu Ramen","price":16},{"id":55,"name":"Gyoza (6 pcs)","price":9}]', 'completed', 3, 'Jeffery Student', 25.00, 5.00, 20.00, NOW()),
      ('[{"id":61,"name":"Beef Tacos (3 pcs)","price":15},{"id":20,"name":"French Fries","price":5}]', 'completed', 1, 'Alice Student', 20.00, 4.00, 16.00, NOW()),
      ('[{"id":7,"name":"Classic Cheeseburger","price":13},{"id":29,"name":"Thick Chocolate Milkshake","price":6}]', 'completed', 4, 'Charlie Student', 19.00, 3.80, 15.20, NOW()),
      ('[{"id":41,"name":"Kung Pao Chicken","price":16}]', 'completed', 5, 'Diana Student', 16.00, 3.20, 12.80, NOW()),
      ('[{"id":35,"name":"Mushroom Risotto","price":19}]', 'completed', 6, 'Frank Faculty', 19.00, 0.00, 19.00, NOW()),
      ('[{"id":51,"name":"Sushi Platter (12 pcs)","price":28}]', 'completed', 7, 'Grace Faculty', 28.00, 0.00, 28.00, NOW()),
      ('[{"id":1,"name":"Caesar Salad","price":9}]', 'preparing', 1, 'Alice Student', 9.00, 1.80, 7.20, NOW()),
      ('[{"id":23,"name":"Crispy Chicken Tenders","price":11}]', 'preparing', 2, 'Mia Student', 11.00, 2.20, 8.80, NOW()),
      ('[{"id":47,"name":"Dumplings (8 pcs)","price":12}]', 'preparing', 3, 'Jeffery Student', 12.00, 2.40, 9.60, NOW()),
      ('[{"id":62,"name":"Chicken Quesadilla","price":12}]', 'preparing', 4, 'Charlie Student', 12.00, 2.40, 9.60, NOW())
    `);


    await conn.commit();
    console.log('✅ Data seeded successfully');
  } catch (err) {
    await conn.rollback();
    console.error('❌ Seed failed, rolled back.', err);
    throw err;
  }
}

module.exports = { seedData };

