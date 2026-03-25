/* ===================================================
   Bar Absinthe - バー管理システム
   app.js - メインアプリケーションロジック
=================================================== */

// ===== ユーティリティ =====

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatPrice(n) {
  return '¥' + n.toLocaleString('ja-JP');
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function thisMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

function isoToDateStr(iso) {
  // ローカル時刻で日付を取得（UTC変換による日付ズレを防ぐ）
  const d = new Date(iso);
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function isoToMonthStr(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

// ===== LocalStorage =====

const KEYS = {
  MENU: 'bar_menu_items',
  ORDERS: 'bar_orders',
};

function loadMenu() {
  return JSON.parse(localStorage.getItem(KEYS.MENU) || '[]');
}

function saveMenu(items) {
  localStorage.setItem(KEYS.MENU, JSON.stringify(items));
}

function loadOrders() {
  return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
}

// ===== カテゴリ定義 =====

const MENU_CATEGORIES = [
  { key: 'シャンパン', label: '🥂 シャンパン', cssClass: 'champagne-label' },
  { key: 'ボトル',    label: '🍾 ボトル',    cssClass: 'bottle-label' },
  { key: 'ショット',  label: '🥃 ショット',  cssClass: 'shot-label' },
  { key: 'ドリンク',  label: '🍹 ドリンク',  cssClass: 'drink-label' },
  { key: 'フード',    label: '🍽️ フード',    cssClass: 'food-label' },
  { key: 'システム',  label: '⚙️ システム',  cssClass: 'system-label' },
];

// ===== デフォルトメニュー（初回起動時） =====

function getDefaultMenuItems() {
  return [
    // シャンパン
    { id: genId(), name: 'MAVAM',                  price: 10000,  category: 'シャンパン' },
    { id: genId(), name: 'プーブグリコ イエロー',  price: 18000,  category: 'シャンパン' },
    { id: genId(), name: 'プーブグリコ 白',        price: 20000,  category: 'シャンパン' },
    { id: genId(), name: 'モエネクター',            price: 20000,  category: 'シャンパン' },
    { id: genId(), name: 'モエアイス',              price: 25000,  category: 'シャンパン' },
    { id: genId(), name: 'ソウメイ',                price: 65000,  category: 'シャンパン' },
    { id: genId(), name: 'エンジェル',              price: 130000, category: 'シャンパン' },
    { id: genId(), name: 'アルマンド',              price: 160000, category: 'シャンパン' },
    // ボトル
    { id: genId(), name: 'ウイスキー',              price: 25000,  category: 'ボトル' },
    { id: genId(), name: 'ワイン',                  price: 15000,  category: 'ボトル' },
    { id: genId(), name: '焼酎',                    price: 6500,   category: 'ボトル' },
    // ショット
    { id: genId(), name: '1800アネホ',              price: 700,    category: 'ショット' },
    { id: genId(), name: 'コカレロ',                price: 700,    category: 'ショット' },
    { id: genId(), name: 'コカボム',                price: 700,    category: 'ショット' },
    { id: genId(), name: 'イエガー',                price: 700,    category: 'ショット' },
    { id: genId(), name: 'ズブロッカ',              price: 700,    category: 'ショット' },
    { id: genId(), name: 'テキーラローズ',          price: 700,    category: 'ショット' },
    { id: genId(), name: 'クライナー',              price: 700,    category: 'ショット' },
    { id: genId(), name: 'ケンスペ',                price: 900,    category: 'ショット' },
    { id: genId(), name: 'アブサン',                price: 1000,   category: 'ショット' },
    { id: genId(), name: 'アブボム',                price: 1200,   category: 'ショット' },
    // システム
    { id: genId(), name: '飲み放題・歌い放題 60分', price: 1980,   category: 'システム' },
    { id: genId(), name: '延長 30分',               price: 980,    category: 'システム' },
    { id: genId(), name: 'ポップコーン',            price: 500,    category: 'システム' },
    { id: genId(), name: 'ダーツ 1ゲーム',         price: 100,    category: 'システム' },
    // フード（価格未設定は要確認）
    { id: genId(), name: 'フライドポテト 塩/BBQ',  price: 0,      category: 'フード' },
    { id: genId(), name: 'マルゲリータ',            price: 0,      category: 'フード' },
    { id: genId(), name: '照り焼きピザ',            price: 0,      category: 'フード' },
    { id: genId(), name: 'ペペロンチーノ',          price: 0,      category: 'フード' },
    { id: genId(), name: 'カルボナーラ',            price: 0,      category: 'フード' },
    { id: genId(), name: 'アヒージョ',              price: 0,      category: 'フード' },
    { id: genId(), name: 'ステーキ',                price: 0,      category: 'フード' },
    { id: genId(), name: 'ソーセージ',              price: 0,      category: 'フード' },
    { id: genId(), name: '醤油ラーメン',            price: 0,      category: 'フード' },
    { id: genId(), name: 'しじみ汁',                price: 0,      category: 'フード' },
    { id: genId(), name: 'チーズ',                  price: 0,      category: 'フード' },
    { id: genId(), name: 'ビーフジャーキー',        price: 0,      category: 'フード' },
    { id: genId(), name: 'チョコレート',            price: 0,      category: 'フード' },
    { id: genId(), name: 'ナッツ',                  price: 0,      category: 'フード' },
    { id: genId(), name: 'おしんこ',                price: 0,      category: 'フード' },
    { id: genId(), name: '枝豆',                    price: 0,      category: 'フード' },
    { id: genId(), name: 'Birthdayプレート',        price: 4000,   category: 'フード' },
  ];
}

function initDefaultMenu() {
  if (loadMenu().length === 0) {
    saveMenu(getDefaultMenuItems());
  }
}

function resetToDefaultMenu() {
  if (!confirm('現在のメニューをすべて削除し、実際のメニューに置き換えますか？')) return;
  saveMenu(getDefaultMenuItems());
  renderMenuList();
  showToast('メニューを読み込みました');
}

// ===== トースト通知 =====

let toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2200);
}

// ===== タブナビゲーション =====

function initTabs() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
      });
      const el = document.getElementById('tab-' + tab);
      el.classList.remove('hidden');
      el.classList.add('active');

      if (tab === 'orders') renderOrdersList();
      if (tab === 'menu') renderMenuList();
      if (tab === 'checkout') renderCheckoutList();
      if (tab === 'reports') initReports();
    });
  });
}

// ===================================================
//   伝票管理タブ
// ===================================================

let activeOrderId = null; // 現在編集中の伝票
let expandedOrderId = null; // 展開中のカード
let menuSelectorCategory = 'all';

function renderOrdersList() {
  const orders = loadOrders().filter(o => o.status === 'open');
  const container = document.getElementById('orders-list');
  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">🍸</span>オープン中の伝票はありません</div>';
    return;
  }

  orders.forEach(order => {
    const isExpanded = expandedOrderId === order.id;
    const card = document.createElement('div');
    card.className = 'order-card' + (isExpanded ? ' expanded' : '');
    card.dataset.id = order.id;

    const count = order.items.reduce((s, i) => s + i.quantity, 0);

    if (isExpanded) {
      const itemsHtml = order.items.length === 0
        ? `<div class="card-no-items">注文なし</div>`
        : order.items.map(item => `
          <div class="card-item-row">
            <span class="card-item-time">${item.addedAt ? formatTime(item.addedAt) : '--:--'}</span>
            <span class="card-item-name">${escHtml(item.name)} × ${item.quantity}</span>
            <span class="card-item-price">${formatPrice(item.price * item.quantity)}</span>
          </div>`).join('');

      card.innerHTML = `
        <div class="card-expand-header">
          <div class="card-expand-info">
            <span class="card-table-badge">テーブル ${escHtml(order.tableNumber)}</span>
            <span class="card-time-badge">${formatTime(order.createdAt)} 〜</span>
          </div>
          <span class="card-expand-total">${formatPrice(order.total)}</span>
          <button class="card-collapse-btn" title="閉じる">∧</button>
        </div>
        <div class="card-items-list">${itemsHtml}</div>
        <div class="card-footer-actions">
          <button class="btn btn-primary btn-sm" data-action="edit">＋ 追加注文</button>
          <button class="btn btn-checkout btn-sm" data-action="checkout">お会計へ</button>
        </div>
      `;

      card.querySelector('.card-expand-header').addEventListener('click', () => {
        expandedOrderId = null;
        renderOrdersList();
      });
      card.querySelector('.card-collapse-btn').addEventListener('click', e => {
        e.stopPropagation();
        expandedOrderId = null;
        renderOrdersList();
      });
      card.querySelector('[data-action="edit"]').addEventListener('click', e => {
        e.stopPropagation();
        openOrderDetail(order.id);
      });
      card.querySelector('[data-action="checkout"]').addEventListener('click', e => {
        e.stopPropagation();
        const oid = order.id;
        expandedOrderId = null;
        closeOrderDetail();
        document.querySelector('[data-tab="checkout"]').click();
        setTimeout(() => openCheckoutModal(oid), 100);
      });
    } else {
      card.innerHTML = `
        <div class="table-label">テーブル</div>
        <div class="table-number">${escHtml(order.tableNumber)}</div>
        <div class="order-count">${count} 品</div>
        <div class="order-total">${formatPrice(order.total)}</div>
        <div class="order-time">${formatTime(order.createdAt)} 〜</div>
      `;
      card.addEventListener('click', () => {
        expandedOrderId = order.id;
        renderOrdersList();
      });
    }

    container.appendChild(card);
  });
}

function openOrderDetail(orderId) {
  activeOrderId = orderId;
  const panel = document.getElementById('order-detail-panel');
  panel.classList.remove('hidden');

  const order = loadOrders().find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('order-detail-title').textContent = `テーブル ${order.tableNumber}`;
  renderMenuSelectorList();
  renderOrderItemsList();
}

function closeOrderDetail() {
  // 「注文確定」→ サムネイルに直接折りたたむ
  expandedOrderId = null;
  activeOrderId = null;
  document.getElementById('order-detail-panel').classList.add('hidden');
  renderOrdersList();
  showToast('注文を受け付けました');
}

// --- メニューセレクター ---

function renderMenuSelectorList() {
  const menu = loadMenu();
  const list = document.getElementById('menu-selector-list');
  list.innerHTML = '';

  const filtered = menuSelectorCategory === 'all'
    ? menu
    : menu.filter(m => m.category === menuSelectorCategory);

  if (filtered.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:12px;">メニューがありません</div>';
    return;
  }

  filtered.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'menu-item-btn';
    btn.innerHTML = `<span class="item-name">${escHtml(item.name)}</span><span class="item-price">${formatPrice(item.price)}</span>`;
    btn.addEventListener('click', () => addItemToOrder(item));
    list.appendChild(btn);
  });
}

function addItemToOrder(menuItem) {
  if (!activeOrderId) return;
  const orders = loadOrders();
  const order = orders.find(o => o.id === activeOrderId);
  if (!order) return;

  const existing = order.items.find(i => i.menuItemId === menuItem.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    order.items.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      addedAt: new Date().toISOString(),
    });
  }
  order.total = calcOrderTotal(order.items);
  saveOrders(orders);
  renderOrderItemsList();
}

function calcOrderTotal(items) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

// --- 注文アイテムリスト ---

function renderOrderItemsList() {
  if (!activeOrderId) return;
  const order = loadOrders().find(o => o.id === activeOrderId);
  if (!order) return;

  const list = document.getElementById('order-items-list');
  list.innerHTML = '';

  if (order.items.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:16px 0;">左のメニューから追加してください</div>';
    document.getElementById('order-detail-total').textContent = '¥0';
    return;
  }

  order.items.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'order-item-row';
    row.innerHTML = `
      <span class="order-item-time">${item.addedAt ? formatTime(item.addedAt) : ''}</span>
      <span class="order-item-name">${escHtml(item.name)}</span>
      <div class="qty-controls">
        <button class="qty-btn" data-action="minus" data-idx="${idx}">－</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" data-action="plus" data-idx="${idx}">＋</button>
      </div>
      <span class="order-item-subtotal">${formatPrice(item.price * item.quantity)}</span>
    `;
    list.appendChild(row);
  });

  document.getElementById('order-detail-total').textContent = formatPrice(order.total);

  list.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const action = btn.dataset.action;
      changeItemQty(idx, action);
    });
  });
}

function changeItemQty(idx, action) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === activeOrderId);
  if (!order) return;

  if (action === 'plus') {
    order.items[idx].quantity += 1;
  } else {
    order.items[idx].quantity -= 1;
    if (order.items[idx].quantity <= 0) {
      order.items.splice(idx, 1);
    }
  }
  order.total = calcOrderTotal(order.items);
  saveOrders(orders);
  renderOrderItemsList();
}

// --- 新規伝票作成 ---

function initOrdersTab() {
  document.getElementById('btn-new-order').addEventListener('click', () => {
    document.getElementById('new-order-form').classList.remove('hidden');
    document.getElementById('new-table-number').focus();
  });

  document.getElementById('btn-cancel-new-order').addEventListener('click', () => {
    document.getElementById('new-order-form').classList.add('hidden');
    document.getElementById('new-table-number').value = '';
  });

  document.getElementById('btn-create-order').addEventListener('click', createNewOrder);
  document.getElementById('new-table-number').addEventListener('keydown', e => {
    if (e.key === 'Enter') createNewOrder();
  });

  document.getElementById('btn-close-order-detail').addEventListener('click', closeOrderDetail);

  // カテゴリタブ
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      menuSelectorCategory = btn.dataset.cat;
      renderMenuSelectorList();
    });
  });

  // お会計ボタン（詳細パネル内）
  document.getElementById('btn-checkout-order').addEventListener('click', () => {
    if (!activeOrderId) return;
    const oid = activeOrderId;
    expandedOrderId = null;
    closeOrderDetail();
    document.querySelector('[data-tab="checkout"]').click();
    setTimeout(() => openCheckoutModal(oid), 100);
  });
}

function findLastOpenOrder() {
  const orders = loadOrders().filter(o => o.status === 'open');
  return orders.length > 0 ? orders[orders.length - 1].id : null;
}

function createNewOrder() {
  const tableInput = document.getElementById('new-table-number');
  const tableNumber = tableInput.value.trim();
  if (!tableNumber) {
    showToast('テーブル番号を入力してください');
    tableInput.focus();
    return;
  }

  const orders = loadOrders();
  // 同じテーブルでオープン中の伝票があるか確認
  const duplicate = orders.find(o => o.status === 'open' && o.tableNumber === tableNumber);
  if (duplicate) {
    showToast(`テーブル ${tableNumber} はすでにオープン中です`);
    return;
  }

  const newOrder = {
    id: genId(),
    tableNumber,
    items: [],
    status: 'open',
    createdAt: new Date().toISOString(),
    closedAt: null,
    total: 0,
  };
  orders.push(newOrder);
  saveOrders(orders);

  tableInput.value = '';
  document.getElementById('new-order-form').classList.add('hidden');
  renderOrdersList();
  showToast(`テーブル ${tableNumber} の伝票を作成しました`);
  openOrderDetail(newOrder.id);
}

// ===================================================
//   メニュー管理タブ
// ===================================================

function renderMenuList() {
  const menu = loadMenu();
  const container = document.getElementById('menu-categories-container');
  container.innerHTML = '';

  const knownKeys = MENU_CATEGORIES.map(c => c.key);

  MENU_CATEGORIES.forEach(({ key, label, cssClass }) => {
    const items = menu.filter(m => m.category === key);
    if (items.length === 0) return;
    const section = document.createElement('div');
    section.className = 'menu-category-section';
    section.innerHTML = `
      <h3 class="category-label ${cssClass}">${label}</h3>
      <div id="menu-list-${key}" class="menu-list"></div>
    `;
    container.appendChild(section);
    renderMenuCategory(`menu-list-${key}`, items);
  });

  // 未知カテゴリも表示
  const others = menu.filter(m => !knownKeys.includes(m.category));
  if (others.length > 0) {
    const section = document.createElement('div');
    section.className = 'menu-category-section';
    section.innerHTML = `<h3 class="category-label">その他</h3><div id="menu-list-other" class="menu-list"></div>`;
    container.appendChild(section);
    renderMenuCategory('menu-list-other', others);
  }
}

function renderMenuCategory(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:10px 0;">商品がありません</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.innerHTML = `
      <div class="item-info">
        <div class="name">${escHtml(item.name)}</div>
        <div class="price">${formatPrice(item.price)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-icon edit" data-id="${item.id}">編集</button>
        <button class="btn-icon delete" data-id="${item.id}">削除</button>
      </div>
    `;
    card.querySelector('.btn-icon.edit').addEventListener('click', () => openMenuEditForm(item.id));
    card.querySelector('.btn-icon.delete').addEventListener('click', () => deleteMenuItem(item.id));
    container.appendChild(card);
  });
}

function openMenuAddForm() {
  document.getElementById('menu-form-title').textContent = '商品追加';
  document.getElementById('menu-edit-id').value = '';
  document.getElementById('menu-name').value = '';
  document.getElementById('menu-price').value = '';
  document.getElementById('menu-category').value = 'ドリンク';
  document.getElementById('menu-form').classList.remove('hidden');
  document.getElementById('menu-name').focus();
}

function openMenuEditForm(id) {
  const item = loadMenu().find(m => m.id === id);
  if (!item) return;
  document.getElementById('menu-form-title').textContent = '商品編集';
  document.getElementById('menu-edit-id').value = id;
  document.getElementById('menu-name').value = item.name;
  document.getElementById('menu-price').value = item.price;
  document.getElementById('menu-category').value = item.category;
  document.getElementById('menu-form').classList.remove('hidden');
  document.getElementById('menu-name').focus();
}

function saveMenuForm() {
  const name = document.getElementById('menu-name').value.trim();
  const priceStr = document.getElementById('menu-price').value.trim();
  const category = document.getElementById('menu-category').value;
  const editId = document.getElementById('menu-edit-id').value;

  if (!name) { showToast('商品名を入力してください'); return; }
  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price < 0) { showToast('正しい価格を入力してください'); return; }

  const menu = loadMenu();

  if (editId) {
    const idx = menu.findIndex(m => m.id === editId);
    if (idx >= 0) {
      menu[idx] = { ...menu[idx], name, price, category };
      showToast('商品を更新しました');
    }
  } else {
    menu.push({ id: genId(), name, price, category });
    showToast('商品を追加しました');
  }

  saveMenu(menu);
  cancelMenuForm();
  renderMenuList();
}

function cancelMenuForm() {
  document.getElementById('menu-form').classList.add('hidden');
  document.getElementById('menu-edit-id').value = '';
  document.getElementById('menu-name').value = '';
  document.getElementById('menu-price').value = '';
}

function deleteMenuItem(id) {
  if (!confirm('この商品を削除しますか？')) return;
  const menu = loadMenu().filter(m => m.id !== id);
  saveMenu(menu);
  renderMenuList();
  showToast('商品を削除しました');
}

function initMenuTab() {
  document.getElementById('btn-add-menu').addEventListener('click', openMenuAddForm);
  document.getElementById('btn-reset-menu').addEventListener('click', resetToDefaultMenu);
  document.getElementById('btn-save-menu').addEventListener('click', saveMenuForm);
  document.getElementById('btn-cancel-menu').addEventListener('click', cancelMenuForm);
}

// ===================================================
//   お会計タブ
// ===================================================

let checkoutTargetOrderId = null;
let checkoutGuestType = 'returning'; // 'new' | 'returning'
let checkoutPaymentMethod = 'cash';  // 'cash' | 'card'

function renderCheckoutList() {
  const orders = loadOrders().filter(o => o.status === 'open');
  const container = document.getElementById('checkout-list');
  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">✅</span>会計待ちの伝票はありません</div>';
    return;
  }

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.dataset.id = order.id;

    const count = order.items.reduce((s, i) => s + i.quantity, 0);
    card.innerHTML = `
      <div class="checkout-badge">会計</div>
      <div class="table-label">テーブル</div>
      <div class="table-number">${escHtml(order.tableNumber)}</div>
      <div class="order-count">${count} 品</div>
      <div class="order-total">${formatPrice(order.total)}</div>
      <div class="order-time">${formatTime(order.createdAt)} 〜</div>
    `;
    card.addEventListener('click', () => openCheckoutModal(order.id));
    container.appendChild(card);
  });
}

function openCheckoutModal(orderId) {
  if (!orderId) return;
  const order = loadOrders().find(o => o.id === orderId);
  if (!order) return;

  checkoutTargetOrderId = orderId;

  document.getElementById('checkout-modal-table').textContent = `テーブル ${order.tableNumber}`;

  const itemsContainer = document.getElementById('checkout-modal-items');
  itemsContainer.innerHTML = '';
  order.items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'checkout-item-row';
    row.innerHTML = `
      <span>${escHtml(item.name)} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    `;
    itemsContainer.appendChild(row);
  });

  document.getElementById('checkout-modal-total').textContent = formatPrice(order.total);
  document.getElementById('checkout-received').value = '';
  document.getElementById('checkout-change-row').classList.add('hidden');

  // 人数・客種別・支払方法リセット
  document.getElementById('checkout-guest-count').value = '1';
  checkoutGuestType = 'returning';
  checkoutPaymentMethod = 'cash';
  document.querySelectorAll('#guest-type-group .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === 'returning');
  });
  document.querySelectorAll('#payment-method-group .toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.method === 'cash');
  });

  document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
  checkoutTargetOrderId = null;
  document.getElementById('checkout-modal').classList.add('hidden');
}

function confirmCheckout() {
  if (!checkoutTargetOrderId) return;
  const orders = loadOrders();
  const order = orders.find(o => o.id === checkoutTargetOrderId);
  if (!order) return;

  if (order.items.length === 0) {
    showToast('注文がありません');
    return;
  }

  const guestCount = parseInt(document.getElementById('checkout-guest-count').value, 10) || 1;
  order.status = 'closed';
  order.closedAt = new Date().toISOString();
  order.guestCount = guestCount;
  order.isNew = checkoutGuestType === 'new';
  order.paymentMethod = checkoutPaymentMethod;
  saveOrders(orders);

  closeCheckoutModal();
  renderCheckoutList();
  showToast(`テーブル ${order.tableNumber} の会計が完了しました`);
}

function initCheckoutTab() {
  document.getElementById('btn-confirm-checkout').addEventListener('click', confirmCheckout);
  document.getElementById('btn-cancel-checkout').addEventListener('click', closeCheckoutModal);

  // お釣り計算
  document.getElementById('checkout-received').addEventListener('input', () => {
    if (!checkoutTargetOrderId) return;
    const order = loadOrders().find(o => o.id === checkoutTargetOrderId);
    if (!order) return;

    const received = parseInt(document.getElementById('checkout-received').value, 10);
    const changeRow = document.getElementById('checkout-change-row');
    if (!isNaN(received) && received >= 0) {
      const change = received - order.total;
      document.getElementById('checkout-change').textContent = formatPrice(Math.max(0, change));
      changeRow.classList.remove('hidden');
    } else {
      changeRow.classList.add('hidden');
    }
  });

  // 客種別トグル
  document.querySelectorAll('#guest-type-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      checkoutGuestType = btn.dataset.type;
      document.querySelectorAll('#guest-type-group .toggle-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === checkoutGuestType);
      });
    });
  });

  // 支払方法トグル
  document.querySelectorAll('#payment-method-group .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      checkoutPaymentMethod = btn.dataset.method;
      document.querySelectorAll('#payment-method-group .toggle-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.method === checkoutPaymentMethod);
      });
    });
  });

  // モーダル外クリックで閉じる
  document.getElementById('checkout-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('checkout-modal')) {
      closeCheckoutModal();
    }
  });
}

// ===================================================
//   集計タブ
// ===================================================

function initReports() {
  // 日付デフォルト
  const dateInput = document.getElementById('report-date');
  if (!dateInput.value) dateInput.value = todayStr();
  const monthInput = document.getElementById('report-month');
  if (!monthInput.value) monthInput.value = thisMonthStr();

  renderDailyReport();
}

function renderDailyReport() {
  const dateStr = document.getElementById('report-date').value;
  const orders = loadOrders().filter(o => o.status === 'closed' && isoToDateStr(o.closedAt) === dateStr);

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const totalPeople = orders.reduce((s, o) => s + (o.guestCount || 0), 0);
  const newOrders = orders.filter(o => o.isNew).length;
  const returningOrders = orders.filter(o => !o.isNew).length;
  const newPeople = orders.filter(o => o.isNew).reduce((s, o) => s + (o.guestCount || 0), 0);
  const returningPeople = orders.filter(o => !o.isNew).reduce((s, o) => s + (o.guestCount || 0), 0);
  const cashSales = orders.filter(o => o.paymentMethod === 'cash' || o.paymentMethod == null).reduce((s, o) => s + o.total, 0);
  const cardSales = orders.filter(o => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0);
  const avgPerGroup = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const avgPerPerson = totalPeople > 0 ? Math.round(totalSales / totalPeople) : 0;

  const summaryEl = document.getElementById('daily-summary');
  summaryEl.innerHTML = `
    <div class="report-sections">
      <div class="report-section">
        <div class="report-section-title">■ 売上高</div>
        <div class="report-data-row"><span class="label">総売上</span><span class="value">${formatPrice(totalSales)}</span></div>
        <div class="report-data-row"><span class="label">客単価（組）</span><span class="value">${formatPrice(avgPerGroup)}</span></div>
        <div class="report-data-row"><span class="label">客単価（人数）</span><span class="value">${formatPrice(avgPerPerson)}</span></div>
      </div>
      <div class="report-section">
        <div class="report-section-title">■ 内訳</div>
        <div class="report-data-row"><span class="label">現金</span><span class="value">${formatPrice(cashSales)}</span></div>
        <div class="report-data-row"><span class="label">CL</span><span class="value">${formatPrice(cardSales)}</span></div>
      </div>
      <div class="report-section">
        <div class="report-section-title">■ 組数</div>
        <div class="report-data-row"><span class="label">（累計）</span><span class="value">${totalOrders} 組</span></div>
        <div class="report-data-row"><span class="label">（新規）</span><span class="value">${newOrders} 組</span></div>
        <div class="report-data-row"><span class="label">（再来）</span><span class="value">${returningOrders} 組</span></div>
      </div>
      <div class="report-section">
        <div class="report-section-title">■ 人数</div>
        <div class="report-data-row"><span class="label">（累計）</span><span class="value">${totalPeople} 人</span></div>
        <div class="report-data-row"><span class="label">（新規）</span><span class="value">${newPeople} 人</span></div>
        <div class="report-data-row"><span class="label">（再来）</span><span class="value">${returningPeople} 人</span></div>
      </div>
    </div>
  `;

  const listEl = document.getElementById('daily-orders-list');
  listEl.innerHTML = '';

  if (orders.length === 0) {
    listEl.innerHTML = '<div class="empty-state" style="padding:30px 0;"><span class="empty-icon">📊</span>この日の売上データはありません</div>';
    return;
  }

  orders.sort((a, b) => new Date(a.closedAt) - new Date(b.closedAt));
  orders.forEach(order => {
    const count = order.items.reduce((s, i) => s + i.quantity, 0);
    const guestLabel = order.isNew ? '新規' : '再来';
    const payLabel = order.paymentMethod === 'card' ? 'CL' : '現金';
    const row = document.createElement('div');
    row.className = 'report-order-row';
    row.innerHTML = `
      <span class="time">${formatTime(order.closedAt)}</span>
      <span class="table">TB: ${escHtml(order.tableNumber)}</span>
      <span class="items-count">${order.guestCount || '-'} 人 / ${guestLabel} / ${payLabel}</span>
      <span class="amount">${formatPrice(order.total)}</span>
    `;
    listEl.appendChild(row);
  });
}

function renderMonthlyReport() {
  const monthStr = document.getElementById('report-month').value;
  const orders = loadOrders().filter(o => o.status === 'closed' && isoToMonthStr(o.closedAt) === monthStr);

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const totalPeople = orders.reduce((s, o) => s + (o.guestCount || 0), 0);
  const newOrders = orders.filter(o => o.isNew).length;
  const returningOrders = orders.filter(o => !o.isNew).length;
  const newPeople = orders.filter(o => o.isNew).reduce((s, o) => s + (o.guestCount || 0), 0);
  const returningPeople = orders.filter(o => !o.isNew).reduce((s, o) => s + (o.guestCount || 0), 0);
  const cashSales = orders.filter(o => o.paymentMethod === 'cash' || o.paymentMethod == null).reduce((s, o) => s + o.total, 0);
  const cardSales = orders.filter(o => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0);
  const avgPerGroup = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const avgPerPerson = totalPeople > 0 ? Math.round(totalSales / totalPeople) : 0;

  const summaryEl = document.getElementById('monthly-summary');
  summaryEl.innerHTML = `
    <div class="report-sections">
      <div class="report-section">
        <div class="report-section-title">■ 売上高（月次）</div>
        <div class="report-data-row"><span class="label">総売上</span><span class="value">${formatPrice(totalSales)}</span></div>
        <div class="report-data-row"><span class="label">客単価（組）</span><span class="value">${formatPrice(avgPerGroup)}</span></div>
        <div class="report-data-row"><span class="label">客単価（人数）</span><span class="value">${formatPrice(avgPerPerson)}</span></div>
        <div class="report-data-row"><span class="label">営業日数</span><span class="value">${countUniqueDays(orders)} 日</span></div>
      </div>
      <div class="report-section">
        <div class="report-section-title">■ 内訳（月次）</div>
        <div class="report-data-row"><span class="label">現金</span><span class="value">${formatPrice(cashSales)}</span></div>
        <div class="report-data-row"><span class="label">CL</span><span class="value">${formatPrice(cardSales)}</span></div>
      </div>
      <div class="report-section">
        <div class="report-section-title">■ 組数（月次）</div>
        <div class="report-data-row"><span class="label">（累計）</span><span class="value">${totalOrders} 組</span></div>
        <div class="report-data-row"><span class="label">（新規）</span><span class="value">${newOrders} 組</span></div>
        <div class="report-data-row"><span class="label">（再来）</span><span class="value">${returningOrders} 組</span></div>
      </div>
      <div class="report-section">
        <div class="report-section-title">■ 人数（月次）</div>
        <div class="report-data-row"><span class="label">（累計）</span><span class="value">${totalPeople} 人</span></div>
        <div class="report-data-row"><span class="label">（新規）</span><span class="value">${newPeople} 人</span></div>
        <div class="report-data-row"><span class="label">（再来）</span><span class="value">${returningPeople} 人</span></div>
      </div>
    </div>
  `;

  // 日別内訳
  const byDay = {};
  orders.forEach(o => {
    const d = isoToDateStr(o.closedAt);
    if (!byDay[d]) byDay[d] = { total: 0, count: 0 };
    byDay[d].total += o.total;
    byDay[d].count += 1;
  });

  const listEl = document.getElementById('monthly-daily-breakdown');
  listEl.innerHTML = '';

  if (Object.keys(byDay).length === 0) {
    listEl.innerHTML = '<div class="empty-state" style="padding:30px 0;"><span class="empty-icon">📊</span>この月の売上データはありません</div>';
    return;
  }

  Object.keys(byDay).sort().forEach(d => {
    const { total, count } = byDay[d];
    const row = document.createElement('div');
    row.className = 'report-day-row';
    const [, m, day] = d.split('-');
    row.innerHTML = `
      <span class="day">${parseInt(m, 10)}月${parseInt(day, 10)}日</span>
      <span class="count">${count} 件</span>
      <span class="amount">${formatPrice(total)}</span>
    `;
    listEl.appendChild(row);
  });
}

function countUniqueDays(orders) {
  return new Set(orders.map(o => isoToDateStr(o.closedAt))).size;
}

function initReportsTab() {
  // 日次/月次タブ切り替え
  document.querySelectorAll('.report-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.report-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.report;
      document.getElementById('report-daily').classList.toggle('hidden', type !== 'daily');
      document.getElementById('report-monthly').classList.toggle('hidden', type !== 'monthly');
    });
  });

  document.getElementById('report-date').addEventListener('change', renderDailyReport);
  document.getElementById('report-month').addEventListener('change', renderMonthlyReport);
}

// ===== XSS対策 =====

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===================================================
//   初期化
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  initDefaultMenu();
  initTabs();
  initOrdersTab();
  initMenuTab();
  initCheckoutTab();
  initReportsTab();

  // 初期表示
  renderOrdersList();
});
