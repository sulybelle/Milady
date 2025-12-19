let coffeeItems = [];
let dessertItems = [];

let cart = [];
let currentItem = null;
let selectedSize = 'S';
let selectedMilk = 'Кәдімгі';
let selectedSyrup = 'Ваниль';
let quantity = 1;
let currentUser = null;
let selectedDistrict = '';
let addressStreet = '';
let addressNote = '';

const WHATSAPP_NUMBER = "77020292446"; 

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadUser();
    fetchMenuData(); 
    
    document.addEventListener('click', function(event) {
        const userMenu = document.querySelector('.user-menu');
        const userDropdown = document.getElementById('userDropdown');
        if (userMenu && userDropdown && userDropdown.classList.contains('active') && !userMenu.contains(event.target)) {
            closeUserDropdown();
        }
    });
});

function initializeEventListeners() {
    safeAddEvent('userAvatar', 'click', toggleUserDropdown);
    safeAddEvent('authButton', 'click', openAuthModal);
    safeAddEvent('myAddressButton', 'click', openAddressModal);
    safeAddEvent('logoutButton', 'click', logout);
    safeAddEvent('editAddressBtn', 'click', openAddressModal);
    
    safeAddEvent('cartButton', 'click', toggleCart);
    safeAddEvent('closeCart', 'click', toggleCart);
    safeAddEvent('checkoutBtn', 'click', checkout);
    safeAddEvent('changeAddressBtn', 'click', openAddressModal);

    safeAddEvent('closeAuthModal', 'click', closeAuthModal);
    safeAddEvent('closeAddressModal', 'click', closeAddressModal);
    safeAddEvent('closeOrderModal', 'click', closeModal);
    
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
    if (registerTab) registerTab.addEventListener('click', () => switchAuthTab('register'));
    
    safeAddEvent('loginButton', 'click', login);
    safeAddEvent('registerButton', 'click', register);
    safeAddEvent('resetPasswordButton', 'click', resetPassword);
    safeAddEvent('forgotPasswordLink', 'click', showForgotPassword);
    
    const backToLoginButton = document.getElementById('backToLoginButton');
    if (backToLoginButton) backToLoginButton.addEventListener('click', () => switchAuthTab('login'));
    
    safeAddEvent('saveAddressButton', 'click', saveAddress);
    
    document.querySelectorAll('.district-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDistrict(this.getAttribute('data-district'), this);
        });
    });
    
    safeAddEvent('addToCartButton', 'click', addToCart);
    
    const decreaseQuantity = document.getElementById('decreaseQuantity');
    if (decreaseQuantity) decreaseQuantity.addEventListener('click', () => changeQuantity(-1));
    
    const increaseQuantity = document.getElementById('increaseQuantity');
    if (increaseQuantity) increaseQuantity.addEventListener('click', () => changeQuantity(1));
    
    document.querySelectorAll('.option-btn[data-size]').forEach(btn => {
        btn.addEventListener('click', function() { selectSize(this.getAttribute('data-size'), this); });
    });
    
    document.querySelectorAll('.option-btn[data-milk]').forEach(btn => {
        btn.addEventListener('click', function() { selectOption('milk', this.getAttribute('data-milk'), this); });
    });
    
    document.querySelectorAll('.option-btn[data-syrup]').forEach(btn => {
        btn.addEventListener('click', function() { selectOption('syrup', this.getAttribute('data-syrup'), this); });
    });
}

function safeAddEvent(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

async function fetchMenuData() {
    try {
        const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/api';
        const coffeeResponse = await fetch(`${baseUrl}/coffee/`);
        const dessertResponse = await fetch(`${baseUrl}/desserts/`);
        
        if (coffeeResponse.ok && dessertResponse.ok) {
            coffeeItems = await coffeeResponse.json();
            dessertItems = await dessertResponse.json();
            renderMenu();
        } else {
            throw new Error('API Error');
        }
    } catch (error) {
        console.log('Using default data...');
        loadDefaultData();
    }
}

function loadDefaultData() {
    coffeeItems = [
        { id: 1, name: 'Латте', description: 'Сүт пен кофе', base_price: 1450, image: 'https://images.pexels.com/photos/27524209/pexels-photo-27524209.jpeg' }
    ];
    dessertItems = [];
    renderMenu();
}

function renderMenu() {
    const coffeeMenu = document.getElementById('coffeeMenu');
    const dessertsMenu = document.getElementById('dessertsMenu');

    if (coffeeMenu) {
        coffeeMenu.innerHTML = coffeeItems.map(item => {
            
            const base = parseInt(item.base_price || item.basePrice);
            const safeBase = isNaN(base) ? 0 : base;

            return `
            <div class="menu-item">
                <div class="menu-item-image" style="background-image: url('${item.image_url || item.image || 'https://images.pexels.com/photos/27524209/pexels-photo-27524209.jpeg'}')">
                    <button class="add-btn" data-id="${item.id}" data-type="coffee">+</button>
                </div>
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="price">
                        S: ${safeBase}₸ | 
                        M: ${safeBase + 200}₸ | 
                        L: ${safeBase + 400}₸
                    </div>
                </div>
            </div>
        `}).join('');
    }

    if (dessertsMenu) {
        dessertsMenu.innerHTML = dessertItems.map(item => {
            const price = parseInt(item.price);
            return `
            <div class="menu-item">
                <div class="menu-item-image" style="background-image: url('${item.image_url || item.image}')">
                    <button class="add-btn" data-id="${item.id}" data-type="dessert">+</button>
                </div>
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="price">${price}₸</div>
                </div>
            </div>
        `}).join('');
    }
    
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const type = this.getAttribute('data-type');
            if (type === 'coffee') openOrderModal(id);
            else addDessertToCart(id);
        });
    });
}

function updatePrice() {
    if (!currentItem) return;
    
    const base = parseInt(currentItem.base_price || currentItem.basePrice);
    const safeBase = isNaN(base) ? 0 : base;
    
    const prices = { 
        S: safeBase, 
        M: safeBase + 200, 
        L: safeBase + 400 
    };
    
    const total = prices[selectedSize] * quantity;
    
    const totalPriceElement = document.getElementById('totalPrice');
    if (totalPriceElement) {
        totalPriceElement.textContent = total + '₸';
    }
}

function addToCart() {
    if (!currentItem) return;
    
    const base = parseInt(currentItem.base_price || currentItem.basePrice);
    const safeBase = isNaN(base) ? 0 : base;
    
    const prices = { S: safeBase, M: safeBase + 200, L: safeBase + 400 };
    
    cart.push({
        id: Date.now(),
        name: currentItem.name,
        size: selectedSize,
        milk: selectedMilk,
        syrup: selectedSyrup,
        quantity: quantity,
        price: prices[selectedSize],
        image: currentItem.image_url || currentItem.image
    });
    
    updateCart();
    closeModal();
    showSuccessMessage('Тауар себетке қосылды');
}

function addDessertToCart(id) {
    const item = dessertItems.find(d => d.id === id);
    if (!item) return;
    
    const price = parseInt(item.price);
    cart.push({
        id: Date.now(),
        name: item.name,
        quantity: 1,
        price: price,
        image: item.image_url || item.image
    });
    updateCart();
    showSuccessMessage('Тауар себетке қосылды');
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('active');
}

async function loadUser() {
    const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/api';
    try {
        const response = await fetch(`${baseUrl}/user/current/`, { credentials: 'include' });
        if (response.ok) {
            const userData = await response.json();
            if (userData.is_authenticated) {
                currentUser = {
                    name: userData.username,
                    email: userData.email,
                    phone: userData.phone || ''
                };
                
                const addressResponse = await fetch(`${baseUrl}/address/current/`, { credentials: 'include' });
                if (addressResponse.ok) {
                    const addressData = await addressResponse.json();
                    if (addressData) {
                        selectedDistrict = addressData.district || '';
                        addressStreet = addressData.street || '';
                        addressNote = addressData.note || '';
                    }
                }
                updateUserUI();
                updateAddressDisplay();
                return;
            }
        }
    } catch (e) { console.log('Using local storage for user'); }
    
    const user = localStorage.getItem('milady_user');
    if (user) {
        currentUser = JSON.parse(user);
        updateUserUI();
        const savedAddress = localStorage.getItem(`milady_address_${currentUser.email}`);
        if (savedAddress) {
            const address = JSON.parse(savedAddress);
            selectedDistrict = address.district || '';
            addressStreet = address.street || '';
            addressNote = address.note || '';
            updateAddressDisplay();
        }
    }
}

function updateUserUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAddressDisplay = document.getElementById('userAddressDisplay');
    const addressText = document.getElementById('addressText');
    const editAddressBtn = document.getElementById('editAddressBtn');
    const authButton = document.getElementById('authButton');
    const myAddressButton = document.getElementById('myAddressButton');
    const logoutButton = document.getElementById('logoutButton');

    if (currentUser) {
        if (userAvatar) userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        if (userName) userName.textContent = currentUser.name;
        if (userEmail) userEmail.textContent = currentUser.email;
        if (authButton) authButton.style.display = 'none';
        if (myAddressButton) myAddressButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'block';
        
        if (addressStreet) {
            if (userAddressDisplay) userAddressDisplay.style.display = 'block';
            if (editAddressBtn) editAddressBtn.style.display = 'block';
            if (addressText) addressText.textContent = `${selectedDistrict}, ${addressStreet}`;
        } else {
            if (userAddressDisplay) userAddressDisplay.style.display = 'none';
            if (editAddressBtn) editAddressBtn.style.display = 'none';
        }
    } else {
        if (userAvatar) userAvatar.textContent = '?';
        if (userName) userName.textContent = 'Қонақ';
        if (userEmail) userEmail.textContent = '';
        if (authButton) authButton.style.display = 'block';
        if (myAddressButton) myAddressButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
        if (userAddressDisplay) userAddressDisplay.style.display = 'none';
        if (editAddressBtn) editAddressBtn.style.display = 'none';
    }
}

function updateAddressDisplay() {
    const currentAddressDisplay = document.getElementById('currentAddressDisplay');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (addressStreet && currentAddressDisplay) {
        let displayText = `<strong>${selectedDistrict}</strong><br>${addressStreet}`;
        if (addressNote) {
            displayText += `<br><small>Ескерту: ${addressNote}</small>`;
        }
        currentAddressDisplay.innerHTML = displayText;

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
    } else if (currentAddressDisplay) {
        currentAddressDisplay.innerHTML = '<span style="color: #ef4444;">Адрес көрсетілмеген</span>';
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
        }
    }
}

function openAuthModal() {
    closeUserDropdown();
    document.getElementById('authModal').classList.add('active');
    switchAuthTab('login');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    clearErrors();
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    if (tab === 'login') {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
    document.getElementById('forgotPasswordForm').style.display = 'none';
    clearErrors();
}

function showForgotPassword() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
    clearErrors();
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
        el.classList.remove('active');
        el.textContent = '';
    });
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('active');
    }
}

async function login() {
    const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/api';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    let isValid = true;

    clearErrors();
    if (!email) { showError('loginEmailError', 'Электронды поштаны енгізіңіз'); isValid = false; }
    if (!password) { showError('loginPasswordError', 'Құпия сөзді енгізіңіз'); isValid = false; }
    if (!isValid) return;

    try {
        const response = await fetch(`${baseUrl}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = { name: data.username, email: data.email, phone: data.phone || '' };
            await loadUser();
            updateUserUI();
            closeAuthModal();
            showSuccessMessage('Сәтті кірдіңіз!');
        } else {
             // Offline fallback
             const users = JSON.parse(localStorage.getItem('milady_users') || '[]');
             const user = users.find(u => u.email === email && u.password === password);
             if (user) {
                 currentUser = { name: user.name, email: user.email, phone: user.phone || '' };
                 localStorage.setItem('milady_user', JSON.stringify(currentUser));
                 loadUser();
                 closeAuthModal();
                 showSuccessMessage('Сәтті кірдіңіз (Local)!');
             } else {
                 showError('loginPasswordError', data.error || 'Қате электронды пошта немесе құпия сөз');
             }
        }
    } catch (error) {
        const users = JSON.parse(localStorage.getItem('milady_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            currentUser = { name: user.name, email: user.email, phone: user.phone || '' };
            localStorage.setItem('milady_user', JSON.stringify(currentUser));
            loadUser();
            closeAuthModal();
            showSuccessMessage('Сәтті кірдіңіз (Offline)!');
        } else {
            showError('loginPasswordError', 'Қате электронды пошта немесе құпия сөз');
        }
    }
}

async function register() {
    const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/api';
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    
    if (!name || !email || !password || !phone) {
        if(!name) showError('registerNameError', 'Аты-жөніңізді енгізіңіз');
        return;
    }

    try {
        const response = await fetch(`${baseUrl}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: name, email, password, first_name: name, phone }),
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentUser = { name: data.username, email: data.email, phone: data.phone || '' };
            updateUserUI();
            closeAuthModal();
            showSuccessMessage('Тіркелу сәтті аяқталды!');
            setTimeout(openAddressModal, 1000);
        } else {
            registerInLocalStorage(name, email, password, phone);
        }
    } catch (error) {
        registerInLocalStorage(name, email, password, phone);
    }
}

function registerInLocalStorage(name, email, password, phone) {
    const users = JSON.parse(localStorage.getItem('milady_users') || '[]');
    if (users.find(u => u.email === email)) {
        showError('registerEmailError', 'Бұл электронды пошта тіркелген');
        return;
    }
    users.push({ name, email, password, phone });
    localStorage.setItem('milady_users', JSON.stringify(users));
    currentUser = { name, email, phone };
    localStorage.setItem('milady_user', JSON.stringify(currentUser));
    updateUserUI();
    closeAuthModal();
    showSuccessMessage('Тіркелу сәтті (Offline)!');
    setTimeout(openAddressModal, 1000);
}

function resetPassword() {
    const email = document.getElementById('forgotEmail').value.trim();
    if (!email) { showError('forgotEmailError', 'Электронды поштаны енгізіңіз'); return; }
    showSuccessMessage('Құпия сөзді қалпына келтіру сілтемесі жіберілді');
    switchAuthTab('login');
}

async function logout() {
    const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/api';
    try {
        await fetch(`${baseUrl}/logout/`, { method: 'POST' });
    } catch (e) {}
    currentUser = null;
    localStorage.removeItem('milady_user');
    selectedDistrict = ''; addressStreet = ''; addressNote = '';
    updateUserUI(); updateAddressDisplay(); closeUserDropdown();
    showSuccessMessage('Сәтті шықтыңыз');
}

function openAddressModal() {
    closeUserDropdown(); closeAuthModal();
    const modal = document.getElementById('addressModal');
    if (selectedDistrict) {
        document.querySelectorAll('.district-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-district') === selectedDistrict);
        });
    }
    document.getElementById('addressStreet').value = addressStreet;
    document.getElementById('addressNote').value = addressNote;
    modal.classList.add('active');
}

function closeAddressModal() {
    document.getElementById('addressModal').classList.remove('active');
    clearErrors();
}

function selectDistrict(district, element) {
    selectedDistrict = district;
    document.querySelectorAll('.district-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

async function saveAddress() {
    const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/api';
    const street = document.getElementById('addressStreet').value.trim();
    if (!selectedDistrict) { showError('addressStreetError', 'Ауданды таңдаңыз'); return; }
    if (!street) { showError('addressStreetError', 'Мекенжайды жазыңыз'); return; }
    
    addressStreet = street;
    addressNote = document.getElementById('addressNote').value.trim();

    try {
        await fetch(`${baseUrl}/address/save/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ district: selectedDistrict, street: addressStreet, note: addressNote }),
            credentials: 'include'
        });
    } catch(e) {}

    if (currentUser) {
        localStorage.setItem(`milady_address_${currentUser.email}`, JSON.stringify({
            district: selectedDistrict, street: addressStreet, note: addressNote
        }));
    }
    
    updateAddressDisplay(); updateUserUI(); closeAddressModal();
    showSuccessMessage('Адрес сақталды');
}

function openOrderModal(id) {
    currentItem = coffeeItems.find(item => item.id === id);
    if (!currentItem) return;
    
    document.getElementById('modalImage').src = currentItem.image_url || currentItem.image;
    document.getElementById('modalTitle').textContent = currentItem.name;
    document.getElementById('modalDescription').textContent = currentItem.description;
    
    selectedSize = 'S'; selectedMilk = 'Кәдімгі'; selectedSyrup = 'Ваниль'; quantity = 1;
    
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-size="S"]').classList.add('active');
    document.querySelector('[data-milk="Кәдімгі"]').classList.add('active');
    document.querySelector('[data-syrup="Ваниль"]').classList.add('active');
    
    document.getElementById('quantity').textContent = quantity;
    updatePrice();
    document.getElementById('orderModal').classList.add('active');
}

function closeModal() {
    document.getElementById('orderModal').classList.remove('active');
}

function selectSize(size, element) {
    selectedSize = size;
    document.querySelectorAll('#sizeGroup .option-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    updatePrice();
}

function selectOption(type, value, element) {
    if (type === 'milk') selectedMilk = value;
    if (type === 'syrup') selectedSyrup = value;
    element.parentElement.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function changeQuantity(delta) {
    quantity = Math.max(1, quantity + delta);
    document.getElementById('quantity').textContent = quantity;
    updatePrice();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function updateCart() {
    const badge = document.getElementById('cartBadge');
    const count = document.getElementById('cartCount');
    if (badge) badge.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    if (count) count.textContent = cart.reduce((s, i) => s + i.quantity, 0);

    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><h3>Себет бос</h3><p>Тапсырыс беру үшін тауарларды қосыңыз</p></div>';
        const footer = document.getElementById('cartFooter');
        if(footer) footer.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
                <img src="${item.image}" alt="${item.name}">
                <div style="flex: 1;">
                    <h4>${item.name}</h4>
                    ${item.size ? `<p style="font-size: 0.85rem; color: #666;">${item.size} | ${item.milk} | ${item.syrup}</p>` : ''}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span>×${item.quantity}</span>
                        <span style="color: var(--gold); font-weight: 600;">${item.price * item.quantity}₸</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        const delivery = subtotal >= 10000 ? 0 : 1500;
        
        document.getElementById('cartTotal').textContent = subtotal + '₸';
        document.getElementById('deliveryFee').textContent = delivery === 0 ? 'Тегін' : delivery + '₸';
        document.getElementById('grandTotal').textContent = (subtotal + delivery) + '₸';
        
        document.getElementById('cartAddressSection').style.display = currentUser ? 'block' : 'none';
        document.getElementById('cartFooter').style.display = 'block';
        updateAddressDisplay();
    }
}

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('active');
    closeUserDropdown();
    if (document.getElementById('cartDrawer').classList.contains('active')) updateAddressDisplay();
}

async function checkout() {
    if (!currentUser) { toggleCart(); openAuthModal(); showSuccessMessage('Тапсырыс беру үшін жүйеге кіріңіз'); return; }
    if (cart.length === 0) { showSuccessMessage('Себет бос'); return; }
    if (!addressStreet) { showSuccessMessage('Мекенжайды көрсетіңіз'); openAddressModal(); return; }

    const baseUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/api';
    
    const orderData = {
        user: currentUser,
        address: { district: selectedDistrict, street: addressStreet, note: addressNote },
        items: cart,
        timestamp: new Date().toISOString(),
        total: cart.reduce((s, i) => s + (i.price * i.quantity), 0)
    };

    try {
        const response = await fetch(`${baseUrl}/orders/create/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
            credentials: 'include'
        });
        
        const data = await response.json();

        if (response.ok) {
            sendToWhatsApp(orderData);
            
            const orders = JSON.parse(localStorage.getItem('milady_orders') || '[]');
            orders.push(orderData);
            localStorage.setItem('milady_orders', JSON.stringify(orders));

            cart = []; 
            updateCart(); 
            toggleCart();
            showSuccessMessage('Тапсырыс қабылданды!');
        } else {
            showSuccessMessage('Қате: ' + (data.message || 'Белгісіз қате'));
        }

    } catch (e) {
        console.error(e);
        sendToWhatsApp(orderData);
        cart = []; updateCart(); toggleCart();
        showSuccessMessage('Тапсырыс (Offline) қабылданды!');
    }
}

function sendToWhatsApp(orderData) {
    const subtotal = orderData.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const delivery = subtotal >= 10000 ? 0 : 1500;
    const total = subtotal + delivery;
    
    let message = `*ЖАҢА ТАПСЫРЫС!* 🚀\n\n`;
    message += `*Тұтынушы:* ${orderData.user.name}\n*Тел:* ${orderData.user.phone}\n\n`;
    message += `*📦 Адрес:*\n${orderData.address.district}, ${orderData.address.street}\n`;
    if (orderData.address.note) message += `Ескерту: ${orderData.address.note}\n`;
    
    message += `\n*🛒 Тапсырыс:*\n`;
    orderData.items.forEach((item, i) => {
        message += `${i+1}. ${item.name}`;
        if (item.size) message += ` (${item.size}, ${item.milk}, ${item.syrup})`;
        message += ` ×${item.quantity} = ${item.price * item.quantity}₸\n`;
    });
    
    message += `\n*💰 Барлығы: ${total}₸*\n`;
    
    const url = `https://wa.me/${77020292446}?text=${encodeURIComponent(message)}`;
    
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        window.location.href = url;
    } else {
        window.open(url, '_blank');
    }
}

function showSuccessMessage(msg) {
    const el = document.getElementById('successMessage');
    if (el) {
        const div = el.querySelector('div');
        if (div) div.textContent = '✅ ' + msg;
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 3000);
    } else {
        alert(msg);
    }
}